import mongoose from "mongoose";
import PracticeProfile, { getTodayDateIST } from "../models/practiceProfile.model.js";
import PracticeSession from "../models/practiceSession.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import Interest from "../models/interest.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";

/**
 * Service managing decoupled Practice Engine:
 * - Mode 1: Random Mind-Game (Daily 2-4 topics, 5-6 Qs each)
 * - Mode 2: Custom Daily Practice (Student Choice + Strict Midnight IST Reset)
 * - Independent Practice Scoreboard & Readiness Indicator
 */
class PracticeEngineService {
  /**
   * Retrieves or initializes student practice profile with IST date-boundary auto-reset.
   */
  async getOrCreateProfile(userId) {
    let profile = await PracticeProfile.findOne({ userId });
    if (!profile) {
      profile = new PracticeProfile({
        userId,
        randomDrillDate: getTodayDateIST(),
        customPracticeDate: getTodayDateIST(),
      });
      await profile.save();
    } else {
      profile.checkAndResetDailyCycles();
      await profile.save();
    }
    return profile;
  }

  /**
   * Returns complete practice status, limits, and scoreboard metrics.
   */
  async getPracticeStatus(userId) {
    const profile = await this.getOrCreateProfile(userId);

    const studentProfile = await StudentProfile.findOne({ userId }).populate("interests").lean();
    const enrolledInterests = studentProfile?.interests || [];

    // Calculate level progression
    const currentXp = profile.practiceXp || 0;
    const currentLevel = Math.max(1, Math.floor(currentXp / 100) + 1);
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const levelProgressPercent = Math.min(
      100,
      Math.round(((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
    );

    // Evaluate readiness for Main Quiz Challenge
    const masteredCount = profile.topicMastery.filter((t) => t.status === "ready" || t.accuracy >= 75).length;
    const criticalCount = profile.topicMastery.filter((t) => t.status === "critical" || t.accuracy < 60).length;
    const isReadyForChallenge = masteredCount > 0 && criticalCount === 0;

    return {
      profile: {
        practiceLevel: currentLevel,
        practiceXp: currentXp,
        levelProgressPercent,
        currentStreak: profile.currentStreak,
      },
      mode1_randomMindGame: {
        available: !profile.randomDrillCompletedToday,
        lastCompletedDate: profile.randomDrillDate,
        completedToday: profile.randomDrillCompletedToday,
        title: "Daily Mystery Mind-Game",
        description: "2 to 4 surprise topics automatically selected from your interests.",
      },
      mode2_customPractice: {
        targetSetToday: profile.customDailyTarget > 0,
        dailyTarget: profile.customDailyTarget,
        attemptsDoneToday: profile.customAttemptsDoneToday,
        attemptsRemaining: Math.max(0, profile.customDailyTarget - profile.customAttemptsDoneToday),
        maxAllowedPerDay: 4,
        timerMinutesPerDrill: 10,
        dateIST: profile.customPracticeDate,
      },
      topicMastery: profile.topicMastery,
      enrolledInterests: enrolledInterests.map((i) => ({
        _id: i._id,
        name: i.name,
        slug: i.slug,
        topics: i.topicTags || [],
      })),
      readiness: {
        isReadyForChallenge,
        message: isReadyForChallenge
          ? "🚀 You are in peak form! Ready to take on the Main Certification Exam."
          : "⚠️ Diagnostic practice recommended on critical topics before attempting Main Exam.",
      },
    };
  }

  /**
   * Student sets their daily commitment target for Mode 2 (1 to 4 drills).
   */
  async setCustomDailyTarget(userId, target) {
    const parsedTarget = Number(target);
    if (![1, 2, 3, 4].includes(parsedTarget)) {
      throw new Error("Daily practice target must be between 1 and 4 drills.");
    }

    const profile = await this.getOrCreateProfile(userId);
    profile.customDailyTarget = parsedTarget;
    await profile.save();

    return {
      success: true,
      dailyTarget: profile.customDailyTarget,
      attemptsDoneToday: profile.customAttemptsDoneToday,
      attemptsRemaining: profile.customDailyTarget - profile.customAttemptsDoneToday,
    };
  }

  /**
   * MODE 1: Starts Random Mind-Game drill.
   * Auto-selects 2 to 4 topics, 5-6 questions each.
   */
  async startRandomMindGame(userId) {
    const profile = await this.getOrCreateProfile(userId);
    if (profile.randomDrillCompletedToday) {
      throw new Error("You have already completed today's Random Mind-Game! Come back tomorrow.");
    }

    // Get student enrolled interests
    const studentProfile = await StudentProfile.findOne({ userId }).populate("interests").lean();
    let interestIds = studentProfile?.interests?.map((i) => i._id) || [];

    let quizzes = await Quiz.find({
      interestIds: { $in: interestIds },
      status: "published",
    })
      .select("questions tags title")
      .lean();

    if (!quizzes || quizzes.length === 0) {
      quizzes = await Quiz.find({ status: "published" }).select("questions tags title").limit(5).lean();
    }

    const allQuestionIds = quizzes.flatMap((q) => q.questions || []);
    const questionsFromDb = await Question.find({ _id: { $in: allQuestionIds } }).lean();

    const pool = questionsFromDb.map((question) => ({
      questionText: question.questionText,
      options: question.options.map((opt) => ({
        optionText: opt.optionText,
        isCorrect: Boolean(opt.isCorrect),
      })),
      explanation: question.explanation || "Review fundamental concepts of this topic.",
      topicTag: question.topicTag || "General",
    }));

    if (pool.length === 0) {
      // Emergency fallback question set to guarantee drill availability
      const fallbackQs = await Question.find().limit(10).lean();
      for (const f of fallbackQs) {
        pool.push({
          questionText: f.questionText,
          options: f.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: f.explanation || "Diagnostic practice topic.",
          topicTag: "General",
        });
      }
    }

    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(15, Math.max(5, shuffled.length)));
    const distinctTopics = Array.from(new Set(selectedQuestions.map((q) => q.topicTag)));

    const session = await PracticeSession.create({
      userId,
      mode: "random_mind_game",
      selectedScope: { type: "subject", targetName: "Random Mind-Game" },
      topicsCovered: distinctTopics,
      questions: selectedQuestions,
      timeLimitMinutes: 15,
      status: "in_progress",
    });

    return {
      sessionId: session._id,
      mode: "random_mind_game",
      topicsCovered: distinctTopics,
      totalQuestions: selectedQuestions.length,
      timeLimitMinutes: 15,
      questions: selectedQuestions.map((q, idx) => ({
        index: idx,
        questionText: q.questionText,
        options: q.options.map((o) => ({ optionText: o.optionText })),
        topicTag: q.topicTag,
      })),
    };
  }

  /**
   * MODE 2: Starts Custom Daily Practice Drill.
   * Student chooses scope. Timer = 10 minutes.
   */
  async startCustomDrill(userId, { scopeType, targetName }) {
    const profile = await this.getOrCreateProfile(userId);

    if (profile.customDailyTarget === 0) {
      throw new Error("Please set your daily practice target (1 to 4 drills) before starting.");
    }

    if (profile.customAttemptsDoneToday >= profile.customDailyTarget) {
      throw new Error(
        `Daily target reached (${profile.customAttemptsDoneToday}/${profile.customDailyTarget}). Targets reset at midnight!`
      );
    }

    const normalizedTarget = (targetName || "General").trim();
    const regex = new RegExp(normalizedTarget, "i");

    const quizzes = await Quiz.find({
      $or: [{ tags: regex }, { title: regex }, { description: regex }],
      status: "published",
    })
      .select("questions tags")
      .lean();

    const matchedQIds = quizzes.flatMap((q) => q.questions || []);
    let questionsFromDb = await Question.find({ _id: { $in: matchedQIds } }).lean();

    if (questionsFromDb.length < 5) {
      const anyQuestions = await Question.find().limit(10).lean();
      questionsFromDb = [...questionsFromDb, ...anyQuestions];
    }

    const questionPool = questionsFromDb.map((question) => ({
      questionText: question.questionText,
      options: question.options.map((opt) => ({
        optionText: opt.optionText,
        isCorrect: Boolean(opt.isCorrect),
      })),
      explanation: question.explanation || `Core principles of ${normalizedTarget}.`,
      topicTag: normalizedTarget,
    }));

    const shuffled = questionPool.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5); // 5 focused questions per custom drill

    const session = await PracticeSession.create({
      userId,
      mode: "custom_drill",
      selectedScope: { type: scopeType || "topic", targetName: normalizedTarget },
      topicsCovered: [normalizedTarget],
      questions: selectedQuestions,
      timeLimitMinutes: 10,
      status: "in_progress",
    });

    return {
      sessionId: session._id,
      mode: "custom_drill",
      selectedScope: session.selectedScope,
      totalQuestions: selectedQuestions.length,
      timeLimitMinutes: 10,
      questions: selectedQuestions.map((q, idx) => ({
        index: idx,
        questionText: q.questionText,
        options: q.options.map((o) => ({ optionText: o.optionText })),
        topicTag: q.topicTag,
      })),
    };
  }

  /**
   * Submits practice session answers, awards XP, updates streaks, and recalculates topic mastery.
   */
  async submitPracticeSession(userId, { sessionId, answers, timeSpentSeconds }) {
    const session = await PracticeSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error("Practice session not found.");
    }
    if (session.status === "completed") {
      throw new Error("This practice session has already been submitted.");
    }

    let correctCount = 0;
    const evaluatedQuestions = session.questions.map((q, idx) => {
      const userChoiceIndex = answers[idx] !== undefined ? Number(answers[idx]) : -1;
      const isCorrect = userChoiceIndex >= 0 && q.options[userChoiceIndex]?.isCorrect === true;

      if (isCorrect) correctCount++;

      return {
        questionText: q.questionText,
        options: q.options,
        explanation: q.explanation,
        topicTag: q.topicTag,
        selectedOptionIndex: userChoiceIndex,
        isCorrect,
      };
    });

    const totalQuestions = session.questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = correctCount * 10 + (score >= 80 ? 25 : 10);

    session.questions = evaluatedQuestions;
    session.score = score;
    session.xpEarned = xpEarned;
    session.timeSpentSeconds = Number(timeSpentSeconds) || 0;
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    // Update Practice Profile
    const profile = await this.getOrCreateProfile(userId);
    profile.practiceXp += xpEarned;
    profile.practiceLevel = Math.max(1, Math.floor(profile.practiceXp / 100) + 1);

    const todayIST = getTodayDateIST();
    if (profile.lastActiveDate !== todayIST) {
      profile.currentStreak += 1;
      profile.lastActiveDate = todayIST;
    }

    if (session.mode === "random_mind_game") {
      profile.randomDrillCompletedToday = true;
      profile.randomDrillDate = todayIST;
    } else if (session.mode === "custom_drill") {
      profile.customAttemptsDoneToday = Math.min(
        profile.customDailyTarget,
        profile.customAttemptsDoneToday + 1
      );
    }

    // Update topic mastery
    for (const topic of session.topicsCovered || []) {
      const existing = profile.topicMastery.find((t) => t.topicTag.toLowerCase() === topic.toLowerCase());
      if (existing) {
        existing.totalDrillsCompleted += 1;
        existing.totalQuestionsAnswered += totalQuestions;
        existing.correctAnswersCount += correctCount;
        existing.accuracy = Math.round(
          (existing.correctAnswersCount / existing.totalQuestionsAnswered) * 100
        );
        existing.status = existing.accuracy >= 75 ? "ready" : existing.accuracy >= 60 ? "improving" : "critical";
        existing.lastPracticedAt = new Date();
      } else {
        profile.topicMastery.push({
          topicTag: topic,
          accuracy: score,
          totalQuestionsAnswered: totalQuestions,
          correctAnswersCount: correctCount,
          totalDrillsCompleted: 1,
          status: score >= 75 ? "ready" : score >= 60 ? "improving" : "critical",
          lastPracticedAt: new Date(),
        });
      }
    }

    await profile.save();

    return {
      sessionId: session._id,
      score,
      totalQuestions,
      correctCount,
      xpEarned,
      newTotalXp: profile.practiceXp,
      practiceLevel: profile.practiceLevel,
      currentStreak: profile.currentStreak,
      feedback: session.questions.map((q) => ({
        questionText: q.questionText,
        selectedOptionIndex: q.selectedOptionIndex,
        correctOptionIndex: q.options.findIndex((o) => o.isCorrect),
        isCorrect: q.isCorrect,
        explanation: q.explanation,
        topicTag: q.topicTag,
      })),
    };
  }
}

export const practiceEngineService = new PracticeEngineService();
export default practiceEngineService;
