import mongoose from "mongoose";
import PracticeProfile, { getTodayDateIST, getYesterdayDateIST } from "../models/practiceProfile.model.js";
import PracticeSession from "../models/practiceSession.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Interest from "../models/interest.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import { generateAIQuestionsService } from "./aiQuestion.service.js";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
   * Generates or curates fresh scenario questions strictly within student's active Domain courses.
   */
  async startRandomMindGame(userId, { domainId } = {}) {
    const profile = await this.getOrCreateProfile(userId);
    if (profile.randomDrillCompletedToday) {
      throw new Error("You have already completed today's Random Mind-Game! Come back tomorrow.");
    }

    // Determine target Domain scope
    let activeDomain = null;
    if (domainId && mongoose.Types.ObjectId.isValid(domainId)) {
      activeDomain = await Domain.findById(domainId).lean();
    }
    if (!activeDomain) {
      activeDomain = await Domain.findOne({ isActive: true }).lean();
    }

    // Get courses belonging strictly to this Domain
    const domainCourses = activeDomain
      ? await Course.find({ domainId: activeDomain._id }).lean()
      : [];
    const courseTitles = domainCourses.map((c) => c.title);

    let selectedTopics = courseTitles.length > 0 ? courseTitles : ["Web Fundamentals", "Application Architecture"];
    const shuffledTopics = [...selectedTopics].sort(() => 0.5 - Math.random());
    const targetTopics = shuffledTopics.slice(0, Math.min(3, Math.max(2, shuffledTopics.length)));

    let practiceQuestions = [];

    // Try AI generation strictly locked to this Domain
    try {
      const topicString = targetTopics.join(", ");
      const aiQs = await generateAIQuestionsService({
        topic: `${activeDomain?.name ? activeDomain.name + ": " : ""}${topicString}`,
        count: 6,
        difficulty: "mixed",
        additionalContext: `CRITICAL: You are locked strictly to the "${activeDomain?.name || "Target"}" Domain. Do NOT generate questions from any other domain or unrelated technology.`,
      });

      if (aiQs && aiQs.length >= 4) {
        practiceQuestions = aiQs.map((q, idx) => ({
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: q.explanation || `Comprehensive explanation of concepts covered in this question.`,
          topicTag: targetTopics[idx % targetTopics.length] || activeDomain?.name || "General",
        }));
      }
    } catch (aiErr) {
      console.warn("AI generation fallback to database pool:", aiErr.message);
    }

    // Fallback if AI is offline - strictly select from Domain's courses quizzes
    if (practiceQuestions.length < 5) {
      const courseIds = domainCourses.map((c) => c._id);
      const domainQuizzes = await Quiz.find({
        courseId: { $in: courseIds },
        isActive: true,
      }).select("questions tags").lean();

      const matchedQIds = domainQuizzes.flatMap((q) => q.questions || []);
      const dbQuestions = await Question.find({ _id: { $in: matchedQIds } }).lean();

      let sourceQs = dbQuestions;
      if (sourceQs.length < 5) {
        const publishedQuizzes = await Quiz.find({ status: "published", isActive: true }).select("questions").limit(10).lean();
        const pubQIds = publishedQuizzes.flatMap((q) => q.questions || []);
        const fallbackQs = await Question.find({ _id: { $in: pubQIds } }).limit(15).lean();
        sourceQs = fallbackQs.length > 0 ? fallbackQs : dbQuestions;
      }
      const shuffled = sourceQs.sort(() => 0.5 - Math.random());
      practiceQuestions = shuffled.slice(0, 6).map((q, idx) => ({
        questionText: q.questionText,
        options: q.options.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: Boolean(opt.isCorrect),
        })),
        explanation: q.explanation || `Key concept review for ${targetTopics[idx % targetTopics.length] || "the topic"}.`,
        topicTag: targetTopics[idx % targetTopics.length] || activeDomain?.name || "General",
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
   * DEMO PRACTICE (TUTORIAL MODE):
   * Strictly a 2-3 question how-to tutorial for first-time exam takers.
   * Teaches the exam UI (timer, next button, submit).
   * Not tied to weak areas or daily targets.
   */
  async startDemoTutorialSession(userId) {
    const demoQuestions = [
      {
        questionText: "How does the countdown timer work during a live certification exam?",
        options: [
          { optionText: "The timer runs continuously and your exam automatically submits when time reaches 00:00", isCorrect: true },
          { optionText: "The timer pauses whenever you switch to another browser tab", isCorrect: false },
          { optionText: "You can freely restart or pause the exam timer whenever needed", isCorrect: false },
          { optionText: "There is no time limit on any Quimora certification exams", isCorrect: false },
        ],
        explanation: "The countdown timer is strictly enforced by the server. Always manage your time and ensure answers are selected before the timer expires.",
        topicTag: "Exam Interface Tutorial",
      },
      {
        questionText: "How do you navigate through questions and complete your certification exam?",
        options: [
          { optionText: "Use 'Next', 'Previous', or Question numbers to navigate, and click the red 'Finish & Submit' button when done", isCorrect: true },
          { optionText: "You must only answer the first question to pass the test", isCorrect: false },
          { optionText: "Closing the browser tab automatically grades and passes your test", isCorrect: false },
          { optionText: "Answers are locked immediately and cannot be changed before submission", isCorrect: false },
        ],
        explanation: "You can navigate between questions freely, change your selected choices anytime before submitting, and finalize by clicking 'Finish & Submit'.",
        topicTag: "Exam Interface Tutorial",
      },
      {
        questionText: "What happens immediately after you submit your certification exam?",
        options: [
          { optionText: "You receive an instant performance scorecard with concept breakdowns and accuracy percentages", isCorrect: true },
          { optionText: "Your answers are deleted without any score or diagnostic report", isCorrect: false },
          { optionText: "You must wait 48 hours for an instructor to manually review your multiple-choice questions", isCorrect: false },
          { optionText: "Your student account is automatically logged out and suspended", isCorrect: false },
        ],
        explanation: "Quimora provides real-time automated scoring with category mastery, performance metrics, and immediate review feedback.",
        topicTag: "Exam Interface Tutorial",
      },
    ];

    const session = await PracticeSession.create({
      userId,
      mode: "demo_tutorial",
      selectedScope: { type: "tutorial", targetName: "Exam Interface Tutorial" },
      topicsCovered: ["Exam Interface Tutorial"],
      questions: demoQuestions,
      timeLimitMinutes: 3,
      status: "in_progress",
    });

    return {
      sessionId: session._id,
      isDemo: true,
      mode: "demo_tutorial",
      topicsCovered: ["Exam Interface Tutorial"],
      totalQuestions: demoQuestions.length,
      timeLimitMinutes: 3,
      questions: demoQuestions.map((q, idx) => ({
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
   * Locked to Domain/Course context.
   */
  async startCustomDrill(userId, { scopeType, targetName, domainName } = {}) {
    const profile = await this.getOrCreateProfile(userId);

    // If daily target was not set, auto-initialize target to 1 so the drill can start seamlessly
    if (!profile.customDailyTarget || profile.customDailyTarget === 0) {
      profile.customDailyTarget = 1;
      await profile.save();
    }

    if (profile.customAttemptsDoneToday >= profile.customDailyTarget) {
      const error = new Error(
        `Daily target reached (${profile.customAttemptsDoneToday}/${profile.customDailyTarget}). Targets reset at midnight!`
      );
      error.statusCode = 400;
      throw error;
    }

    const normalizedTarget = (targetName || "General").trim();
    let practiceQuestions = [];

    // Try AI generation for targeted remedial practice locked to Domain
    try {
      const aiQs = await generateAIQuestionsService({
        topic: domainName ? `${domainName} - ${normalizedTarget}` : normalizedTarget,
        count: 5,
        difficulty: "medium",
        additionalContext: `Targeted remedial diagnostic drill questions. MUST BE 100% EXCLUSIVELY on "${normalizedTarget}"${domainName ? ` within ${domainName}` : ""}. Absolutely no questions from other domains or unrelated languages.`,
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
      // Safely escape regex to prevent crashes on special characters like (ARIA), &, etc.
      const escaped = escapeRegex(normalizedTarget);
      const regex = new RegExp(`^${escaped}$|${escaped}`, "i");
      const quizzes = await Quiz.find({
        $or: [{ tags: regex }, { title: regex }],
        status: "published",
      }).select("questions").lean();

      const matchedQIds = quizzes.flatMap((q) => q.questions || []);
      let questionsFromDb = await Question.find({ _id: { $in: matchedQIds } }).lean();

      // If database questions exist for this topic, use them
      if (questionsFromDb.length >= 5) {
        const shuffled = questionsFromDb.sort(() => 0.5 - Math.random());
        practiceQuestions = shuffled.slice(0, 5).map((q) => ({
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: q.explanation || `Key concept review for ${normalizedTarget}.`,
          topicTag: normalizedTarget,
        }));
      } else {
        // Fallback: Generate dedicated topic-specific questions without mixing other topics
        const existingQs = questionsFromDb.map((q) => ({
          questionText: q.questionText,
          options: q.options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
          explanation: q.explanation || `Core principles of ${normalizedTarget}.`,
          topicTag: normalizedTarget,
        }));

        practiceQuestions = [...existingQs];
        const needed = 5 - practiceQuestions.length;
        for (let i = 0; i < needed; i++) {
          practiceQuestions.push({
            questionText: `Which of the following is considered a foundational best practice when working with ${normalizedTarget} (Part ${i + 1})?`,
            options: [
              { optionText: `Adhering to standard syntax, design patterns, and documentation guidelines for ${normalizedTarget}`, isCorrect: true },
              { optionText: `Avoiding all validation and runtime checks to optimize execution speed`, isCorrect: false },
              { optionText: `Hardcoding dynamic configurations directly into source code`, isCorrect: false },
              { optionText: `Deprecating backward compatibility without version migrations`, isCorrect: false },
            ],
            explanation: `Standard architectural patterns in ${normalizedTarget} emphasize strict validation, clean separation of concerns, and following official documentation.`,
            topicTag: normalizedTarget,
          });
        }
      }
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
    // Atomically lock session from being evaluated or submitted multiple times
    const session = await PracticeSession.findOneAndUpdate(
      { _id: sessionId, userId, status: { $ne: "completed" } },
      { $set: { status: "evaluating" } },
      { returnDocument: "after" }
    );
    if (!session) {
      throw new Error("Practice session not found or already submitted.");
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

    // If Demo Tutorial mode, complete without modifying daily targets or mastery
    if (session.mode === "demo_tutorial") {
      return {
        sessionId: session._id,
        isDemo: true,
        score,
        correctCount,
        totalQuestions,
        xpEarned: 10,
        practiceLevel: 1,
        newTotalXp: 10,
        currentStreak: 1,
        feedback: evaluatedQuestions.map((q) => ({
          questionText: q.questionText,
          isCorrect: q.isCorrect,
          explanation: q.explanation,
        })),
      };
    }

    // Update Practice Profile
    const profile = await this.getOrCreateProfile(userId);
    profile.practiceXp += xpEarned;
    profile.practiceLevel = Math.max(1, Math.floor(profile.practiceXp / 100) + 1);

    const todayIST = getTodayDateIST();
    if (profile.lastActiveDate !== todayIST) {
      const yesterdayIST = getYesterdayDateIST();
      if (profile.lastActiveDate === yesterdayIST) {
        profile.currentStreak += 1;
      } else {
        // First practice ever or missed at least one day
        profile.currentStreak = 1;
      }
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
