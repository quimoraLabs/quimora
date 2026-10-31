import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";

/**
 * Controller strictly enforcing the 4-level hierarchy:
 * Domain -> Course -> Chapter -> Quiz
 */
class HierarchyController {
  // LEVEL 1: Get all active root Domains
  async getDomains(req, res, next) {
    try {
      const domains = await Domain.find({ isActive: true }).sort({ name: 1 }).lean();
      return res.status(200).json({ success: true, data: domains });
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

  // COMPOSITE DRILL-DOWN: Course -> Chapters -> Quizzes
  async getCourseHierarchy(req, res, next) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId).populate("domainId", "name description").lean();
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }

      const chapters = await Chapter.find({ courseId }).sort({ orderIndex: 1 }).lean();
      const chapterIds = chapters.map((c) => c._id);

      const quizzes = await Quiz.find({ chapterId: { $in: chapterIds }, isActive: true })
        .select("title description duration timeLimit maxAttempts passingScore level chapterId courseId trackOrder questions")
        .sort({ trackOrder: 1, createdAt: 1 })
        .lean();

      const chaptersWithQuizzes = chapters.map((chap) => ({
        ...chap,
        quizzes: quizzes
          .filter((q) => q.chapterId?.toString() === chap._id.toString())
          .map((q) => ({
            ...q,
            duration: q.duration || q.timeLimit || 15,
            totalQuestions: q.questions?.length || 0,
          })),
      }));

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
