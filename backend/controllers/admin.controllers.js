import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 * @returns { success, stats: { users, studentsOverview, instructorsOverview } }
 */
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: { $ne: false } });
    const deactivatedUsers = await User.countDocuments({ active: false });

    const roleAgg = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const roles = { user: 0, instructor: 0, admin: 0 };
    roleAgg.forEach((r) => {
      if (r._id) roles[r._id] = r.count;
    });

    // 2. Quiz Stats
    const totalQuizzes = await Quiz.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ status: "published" });
    const draftQuizzes = await Quiz.countDocuments({ status: "draft" });

    // 3. Attempt Stats
    const totalAttempts = await QuizAttempt.countDocuments();
    const completedAttempts = await QuizAttempt.countDocuments({ status: "completed" });
    const passedAttempts = await QuizAttempt.countDocuments({
      status: "completed",
      passed: true,
    });

    const overallPassRate =
      completedAttempts > 0
        ? `${Math.round((passedAttempts / completedAttempts) * 100)}%`
        : "0%";

    const completionRate =
      totalAttempts > 0
        ? `${Math.round((completedAttempts / totalAttempts) * 100)}%`
        : "0%";

    const avgQuizzesPerInstructor =
      roles.instructor > 0
        ? Number((totalQuizzes / roles.instructor).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          roles,
          active: activeUsers,
          deactivated: deactivatedUsers,
        },
        studentsOverview: {
          totalAttempts,
          completedAttempts,
          passedAttempts,
          overallPassRate,
          completionRate,
        },
        instructorsOverview: {
          totalInstructors: roles.instructor,
          totalQuizzes,
          publishedQuizzes,
          draftQuizzes,
          avgQuizzesPerInstructor,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};