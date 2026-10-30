import mongoose from "mongoose";
import PracticeProfile, { getTodayDateIST } from "../models/practiceProfile.model.js";
import PracticeSession from "../models/practiceSession.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import Interest from "../models/interest.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import { generateAIQuestionsService } from "./aiQuestion.service.js";

/**
 * Service managing decoupled Practice Engine:
 * - Mode 1: Random Mind-Game (Daily AI-curated diagnostic drill, 2-4 topics)
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
        lastResult: profile.mode1LastResult || null,
        title: "Daily Mystery Mind-Game",
        description: "Fresh diagnostic questions dynamically generated from your enrolled interests.",
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
   * Generates or curates fresh scenario questions across student interests.
   */
  async startRandomMindGame(userId) {
    const profile = await this.getOrCreateProfile(userId);
    if (profile.randomDrillCompletedToday) {
      throw new Error("You have already completed today's Random Mind-Game! Come back tomorrow.");
    }

    // Get student enrolled interests
    const studentProfile = await StudentProfile.findOne({ userId }).populate("interests").lean();
    let interests = studentProfile?.interests || [];

    if (!interests || interests.length === 0) {
      interests = await Interest.find({ isActive: true }).limit(3).lean();
    }

    // Pick 2 to 3 random topics across enrolled domains
    const allTopicTags = interests.flatMap((i) => i.topicTags || [i.name]);
    const shuffledTopics = allTopicTags.sort(() => 0.5 - Math.random());
    const selectedTopics = shuffledTopics.slice(0, Math.min(3, Math.max(2, shuffledTopics.length)));

    let practiceQuestions = [];

    // Try AI generation for completely fresh, non-repetitive scenario questions
    try {
      const topicString = selectedTopics.join(", ");
      const aiQs = await generateAIQuestionsService({
        topic: topicString,
        count: 6,
        difficulty: "mixed",
        additionalContext: "Practical, conceptual problem-solving questions. Avoid rote memorization definitions.",
      });

      if (aiQs && aiQs.length >= 4) {
        practiceQuestions = aiQs.map((q, idx) => ({
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: q.explanation || "Diagnostic analysis of conceptual execution.",
          topicTag: selectedTopics[idx % selectedTopics.length] || "General",
        }));
      }
    } catch (aiErr) {
      console.warn("AI generation fallback to database pool:", aiErr.message);
    }

    // Fallback if AI is offline or in test mode without API key
    if (practiceQuestions.length < 5) {
      const dbQuestions = await Question.find().limit(20).lean();
      const shuffled = dbQuestions.sort(() => 0.5 - Math.random());
      practiceQuestions = shuffled.slice(0, 6).map((q, idx) => ({
        questionText: q.questionText,
        options: q.options.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: Boolean(opt.isCorrect),
        })),
        explanation: q.explanation || "Diagnostic practice concept review.",
        topicTag: selectedTopics[idx % selectedTopics.length] || "General",
      }));
    }

    const distinctTopics = Array.from(new Set(practiceQuestions.map((q) => q.topicTag)));

    const session = await PracticeSession.create({
      userId,
      mode: "random_mind_game",
      selectedScope: { type: "subject", targetName: "Random Mind-Game" },
      topicsCovered: distinctTopics,
      questions: practiceQuestions,
      timeLimitMinutes: 10,
      status: "in_progress",
    });

    return {
      sessionId: session._id,
      mode: "random_mind_game",
      topicsCovered: distinctTopics,
      totalQuestions: practiceQuestions.length,
      timeLimitMinutes: 10,
      questions: practiceQuestions.map((q, idx) => ({
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
    let practiceQuestions = [];

    // Try AI generation for targeted remedial practice
    try {
      const aiQs = await generateAIQuestionsService({
        topic: normalizedTarget,
        count: 5,
        difficulty: "medium",
        additionalContext: "Targeted remedial diagnostic drill questions with detailed explanations.",
      });

      if (aiQs && aiQs.length >= 4) {
        practiceQuestions = aiQs.map((q) => ({
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: q.explanation || `Core principles of ${normalizedTarget}.`,
          topicTag: normalizedTarget,
        }));
      }
    } catch {
      // Fallback to database
    }

    if (practiceQuestions.length < 5) {
      const regex = new RegExp(normalizedTarget, "i");
      const quizzes = await Quiz.find({
        $or: [{ tags: regex }, { title: regex }, { description: regex }],
        status: "published",
      }).select("questions").lean();

      const matchedQIds = quizzes.flatMap((q) => q.questions || []);
      let questionsFromDb = await Question.find({ _id: { $in: matchedQIds } }).lean();

      if (questionsFromDb.length < 5) {
        const anyQuestions = await Question.find().limit(10).lean();
        questionsFromDb = [...questionsFromDb, ...anyQuestions];
      }

      const shuffled = questionsFromDb.sort(() => 0.5 - Math.random());
      practiceQuestions = shuffled.slice(0, 5).map((q) => ({
        questionText: q.questionText,
        options: q.options.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: Boolean(opt.isCorrect),
        })),
        explanation: q.explanation || `Diagnostic drill on ${normalizedTarget}.`,
        topicTag: normalizedTarget,
      }));
    }

    try {
      const session = await PracticeSession.create({
        userId,
        mode: "custom_drill",
        selectedScope: { type: scopeType || "topic", targetName: normalizedTarget },
        topicsCovered: [normalizedTarget],
        questions: practiceQuestions,
        timeLimitMinutes: 10,
        status: "in_progress",
      });

      return {
        sessionId: session._id,
        mode: "custom_drill",
        selectedScope: session.selectedScope,
        totalQuestions: practiceQuestions.length,
        timeLimitMinutes: 10,
        questions: practiceQuestions.map((q, idx) => ({
          index: idx,
          questionText: q.questionText,
          options: q.options.map((o) => ({ optionText: o.optionText })),
          topicTag: q.topicTag,
        })),
      };
    } catch (createErr) {
      console.error("DEBUG startCustomDrill PracticeSession.create error:", createErr);
      throw createErr;
    }
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
      profile.mode1LastResult = {
        score,
        correctCount,
        totalQuestions,
        completedAt: new Date(),
      };
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
