import mongoose from "mongoose";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import Interest from "../models/interest.model.js";
import EloRating from "../models/eloRating.model.js";

/**
 * Service managing domain tracks, chapters, unlock progression, and star certifications.
 */
class TrackProgressionService {
  /**
   * Fetches full domain track hierarchy with chapters, quizzes, and live student unlock state.
   * @param {string} interestId - Domain/Interest ID
   * @param {string} userId - Current student user ID
   */
  async getDomainTrack(interestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(interestId)) {
      throw new Error("Invalid interest ID format");
    }

    const interest = await Interest.findById(interestId).lean();
    if (!interest) {
      throw new Error("Interest domain not found");
    }

    // Fetch chapters ordered by orderIndex
    let chapters = await Chapter.find({ interestId, isPublished: true })
      .sort({ orderIndex: 1 })
      .lean();

    // If chapters don't exist yet, auto-generate default Chapter 1 to organize existing quizzes
    if (!chapters || chapters.length === 0) {
      const defaultChapter = await Chapter.create({
        interestId,
        title: `${interest.name} Fundamentals`,
        description: `Core fundamentals and principles of ${interest.name}.`,
        orderIndex: 1,
        requiredPassingScore: 50,
      });
      chapters = [defaultChapter.toObject()];

      // Link unassigned quizzes of this interest to default chapter
      await Quiz.updateMany(
        { interestIds: interestId, chapterId: null },
        { chapterId: defaultChapter._id, trackOrder: 1 }
      );
    }

    // Fetch all published quizzes belonging to this domain
    const quizzes = await Quiz.find({
      interestIds: interestId,
      status: "published",
      isActive: true,
    })
      .select("title description timeLimit passingScore chapterId trackOrder prerequisiteQuizId level questions")
      .sort({ trackOrder: 1, createdAt: 1 })
      .lean();

    // Fetch student's progress for all these quizzes
    const quizIds = quizzes.map((q) => q._id);
    const progressRecords = await StudentQuizProgress.find({
      userId,
      quizId: { $in: quizIds },
    }).lean();

    const progressMap = new Map();
    for (const prog of progressRecords) {
      progressMap.set(prog.quizId.toString(), prog);
    }

    // Calculate progression and unlock statuses
    let isPreviousChapterCompleted = true; // First chapter is always unlocked
    const enrichedChapters = [];
    let totalQuizzesInDomain = 0;
    let totalQuizzesPassedInDomain = 0;

    for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
      const chap = chapters[cIdx];
      const chapQuizzes = quizzes.filter(
        (q) => q.chapterId && q.chapterId.toString() === chap._id.toString()
      );

      const isChapterUnlocked = isPreviousChapterCompleted;
      let allChapterQuizzesPassed = chapQuizzes.length > 0;
      let previousQuizPassed = true; // First quiz of unlocked chapter is open

      const enrichedQuizzes = chapQuizzes.map((quiz, qIdx) => {
        totalQuizzesInDomain++;
        const prog = progressMap.get(quiz._id.toString());
        const hasPassed = prog?.hasPassedOnce || (prog?.bestScore || 0) >= (quiz.passingScore || 50);

        if (hasPassed) {
          totalQuizzesPassedInDomain++;
        }

        // A quiz is unlocked if:
        // 1. Chapter is unlocked AND
        // 2. Either it is the first quiz of the chapter, OR the previous quiz was passed, OR prerequisiteQuiz is passed.
        let isUnlocked = false;
        if (isChapterUnlocked) {
          if (qIdx === 0 && !quiz.prerequisiteQuizId) {
            isUnlocked = true;
          } else if (quiz.prerequisiteQuizId) {
            const prereqProg = progressMap.get(quiz.prerequisiteQuizId.toString());
            isUnlocked = Boolean(prereqProg?.hasPassedOnce || (prereqProg?.bestScore || 0) >= 50);
          } else {
            isUnlocked = previousQuizPassed;
          }
        }

        // Pass forward status for sequential order within chapter
        previousQuizPassed = hasPassed;
        if (!hasPassed) {
          allChapterQuizzesPassed = false;
        }

        return {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          level: quiz.level,
          trackOrder: quiz.trackOrder || qIdx + 1,
          questionCount: quiz.questions?.length || 0,
          isUnlocked,
          isCompleted: hasPassed,
          bestScore: prog?.bestScore || 0,
          passAttemptsCount: prog?.passAttemptsCount || 0,
          failAttemptsCount: prog?.failAttemptsCount || 0,
        };
      });

      isPreviousChapterCompleted = isChapterUnlocked && allChapterQuizzesPassed;

      enrichedChapters.push({
        _id: chap._id,
        title: chap.title,
        description: chap.description,
        orderIndex: chap.orderIndex,
        requiredPassingScore: chap.requiredPassingScore,
        isUnlocked: isChapterUnlocked,
        isCompleted: isChapterUnlocked && allChapterQuizzesPassed,
        quizzes: enrichedQuizzes,
      });
    }

    // Calculate Domain Star Badge (1 to 5 Stars)
    const eloDoc = await EloRating.findOne({ userId, interestId, isArchived: false }).lean();
    const currentElo = eloDoc?.currentRating || 1000;
    const stars = this.calculateDomainStars(totalQuizzesPassedInDomain, totalQuizzesInDomain, currentElo);

    return {
      interest: {
        _id: interest._id,
        name: interest.name,
        slug: interest.slug,
        description: interest.description,
        icon: interest.icon,
        color: interest.color,
      },
      stats: {
        totalQuizzes: totalQuizzesInDomain,
        passedQuizzes: totalQuizzesPassedInDomain,
        completionPercentage:
          totalQuizzesInDomain > 0
            ? Math.round((totalQuizzesPassedInDomain / totalQuizzesInDomain) * 100)
            : 0,
        currentElo,
        stars,
      },
      chapters: enrichedChapters,
    };
  }

  /**
   * Calculates star rating (1-5 stars) based on completed challenges and current Elo.
   */
  calculateDomainStars(passedCount, totalCount, elo) {
    if (totalCount === 0 || passedCount === 0) return 0;
    const completionRatio = passedCount / totalCount;

    if (completionRatio >= 1.0 && elo >= 1600) return 5;
    if (completionRatio >= 0.75 && elo >= 1400) return 4;
    if (completionRatio >= 0.5 && elo >= 1200) return 3;
    if (completionRatio >= 0.25 && elo >= 1050) return 2;
    if (passedCount >= 1) return 1;
    return 0;
  }

  /**
   * Finds the immediate next challenge / quiz in the track after completing current quiz.
   */
  async getNextChallenge(currentQuizId, userId) {
    const currentQuiz = await Quiz.findById(currentQuizId).lean();
    if (!currentQuiz || !currentQuiz.interestIds || currentQuiz.interestIds.length === 0) {
      return null;
    }

    const domainId = currentQuiz.interestIds[0];
    const track = await this.getDomainTrack(domainId, userId);

    let foundCurrent = false;
    for (const chap of track.chapters) {
      for (const q of chap.quizzes) {
        if (foundCurrent && q.isUnlocked && !q.isCompleted) {
          return {
            nextQuizId: q._id,
            title: q.title,
            chapterTitle: chap.title,
            domainName: track.interest.name,
          };
        }
        if (q._id.toString() === currentQuizId.toString()) {
          foundCurrent = true;
        }
      }
    }

    return null;
  }
}

export const trackProgressionService = new TrackProgressionService();
export default trackProgressionService;

