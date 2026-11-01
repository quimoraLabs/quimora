import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import { DomainCurriculumService } from "../services/domainCurriculum.service.js";

/**
 * Controller strictly enforcing the 4-level hierarchy:
 * Domain -> Course -> Chapter -> Quiz
 */
class HierarchyController {
  // LEVEL 1: Get all active root Domains (auto-ensures student's chosen tracks exist)
  async getDomains(req, res, next) {
    try {
      const userId = req.auth?.userId || req.user?._id || req.user?.id;
      if (userId) {
        try {
          await DomainCurriculumService.ensureDomainsForStudent(userId);
        } catch (e) {
          console.warn("Student auto-domain ensure warning:", e);
        }
      }

      const domains = await Domain.find({ isActive: true }).sort({ name: 1 }).lean();
      return res.status(200).json({ success: true, data: domains });
    } catch (error) {
      next(error);
    }
  }

  // LEVEL 1 AUTO-CREATE: Ensure or auto-create a Domain & its 4-level hierarchy on demand
  async ensureDomain(req, res, next) {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ success: false, message: "topic is required" });
      }
      const domain = await DomainCurriculumService.ensureDomainForTopic(topic);
      return res.status(200).json({ success: true, data: domain });
    } catch (error) {
      next(error);
    }
  }

  // LEVEL 2: Get all Courses for a specific Domain
  async getCoursesByDomain(req, res, next) {
    try {
      const { domainId } = req.params;
      const courses = await Course.find({ domainId }).sort({ title: 1 }).lean();
      return res.status(200).json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  // LEVEL 3: Get Course details and its sequential Chapters
  async getCourseDetails(req, res, next) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId).populate("domainId", "name description").lean();
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }

      const chapters = await Chapter.find({ courseId }).sort({ orderIndex: 1 }).lean();
      return res.status(200).json({
        success: true,
        data: {
          ...course,
          chapters,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // LEVEL 4: Get Quizzes for a specific Chapter
  async getQuizzesByChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const chapter = await Chapter.findById(chapterId).lean();
      if (!chapter) {
        return res.status(404).json({ success: false, message: "Chapter not found" });
      }

      const quizzes = await Quiz.find({ chapterId, isActive: true })
        .select("title description duration timeLimit maxAttempts passingScore level questions trackOrder")
        .sort({ trackOrder: 1, createdAt: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          chapter,
          quizzes: quizzes.map((q) => ({
            ...q,
            duration: q.duration || q.timeLimit || 15,
            totalQuestions: q.questions?.length || 0,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // COMPOSITE DRILL-DOWN: Course -> Chapters -> Quizzes with Unlock & Completion State
  async getCourseHierarchy(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.auth?.userId || req.user?._id || req.user?.id;

      const course = await Course.findById(courseId).populate("domainId", "name description").lean();
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }

      const chapters = await Chapter.find({ courseId }).sort({ orderIndex: 1 }).lean();
      const chapterIds = chapters.map((c) => c._id);

      const quizzes = await Quiz.find({ chapterId: { $in: chapterIds }, isActive: true })
        .select("title description duration timeLimit maxAttempts passingScore level chapterId courseId trackOrder questions isBonus prerequisiteQuizId")
        .sort({ isBonus: 1, trackOrder: 1, createdAt: 1 })
        .lean();

      // Fetch student progress to compute sequential unlock and completion
      const quizIds = quizzes.map((q) => q._id);
      const progressList = userId
        ? await StudentQuizProgress.find({ userId, quizId: { $in: quizIds } }).lean()
        : [];

      const progressMap = new Map();
      for (const p of progressList) {
        progressMap.set(p.quizId.toString(), p);
      }

      let isPrevChapterCompleted = true; // First chapter is always accessible

      const chaptersWithQuizzes = chapters.map((chap, cIdx) => {
        const chapQuizzes = quizzes.filter((q) => q.chapterId?.toString() === chap._id.toString());
        const regularQuizzes = chapQuizzes.filter((q) => !q.isBonus);
        const bonusQuiz = chapQuizzes.find((q) => q.isBonus);

        let prevRegularQuizPassed = true;
        let regularQuizzesPassed = 0;

        const enrichedRegular = regularQuizzes.map((quiz, qIdx) => {
          const prog = progressMap.get(quiz._id.toString());
          const isPassed = Boolean(prog?.hasPassedOnce || (prog?.passAttemptsCount > 0));
          const attemptsUsed = (prog?.passAttemptsCount || 0) + (prog?.failAttemptsCount || 0);

          if (isPassed) regularQuizzesPassed++;

          // Sequential unlock: first quiz in unlocked chapter is unlocked, next unlocks if prev passed
          const isUnlocked = isPrevChapterCompleted && (qIdx === 0 || prevRegularQuizPassed);
          prevRegularQuizPassed = isPassed;

          return {
            ...quiz,
            duration: quiz.duration || quiz.timeLimit || 15,
            totalQuestions: quiz.questions?.length || 10,
            isPassed,
            isUnlocked,
            attemptsUsed,
            bestScore: prog?.bestScore || 0,
            isBonus: false,
          };
        });

        // Bonus quiz: does not block chapter, unlocked if chapter is unlocked
        const enrichedBonus = bonusQuiz
          ? {
              ...bonusQuiz,
              duration: bonusQuiz.duration || bonusQuiz.timeLimit || 15,
              totalQuestions: bonusQuiz.questions?.length || 10,
              isPassed: Boolean(progressMap.get(bonusQuiz._id.toString())?.hasPassedOnce),
              isUnlocked: isPrevChapterCompleted,
              attemptsUsed:
                (progressMap.get(bonusQuiz._id.toString())?.passAttemptsCount || 0) +
                (progressMap.get(bonusQuiz._id.toString())?.failAttemptsCount || 0),
              bestScore: progressMap.get(bonusQuiz._id.toString())?.bestScore || 0,
              isBonus: true,
            }
          : null;

        const isChapterCompleted = regularQuizzes.length > 0 && regularQuizzesPassed === regularQuizzes.length;
        const chapterUnlocked = isPrevChapterCompleted;
        isPrevChapterCompleted = isChapterCompleted; // Next chapter unlocks if this one is completed

        return {
          ...chap,
          isUnlocked: chapterUnlocked,
          isCompleted: isChapterCompleted,
          totalRegularLessons: regularQuizzes.length,
          clearedRegularLessons: regularQuizzesPassed,
          completionPercentage: regularQuizzes.length > 0
            ? Math.round((regularQuizzesPassed / regularQuizzes.length) * 100)
            : 0,
          quizzes: enrichedBonus ? [...enrichedRegular, enrichedBonus] : enrichedRegular,
          bonusQuiz: enrichedBonus,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          course,
          domain: course.domainId,
          chapters: chaptersWithQuizzes,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const hierarchyController = new HierarchyController();
export default hierarchyController;

