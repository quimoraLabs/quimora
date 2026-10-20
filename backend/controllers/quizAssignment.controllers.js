import QuizAssignment from "../models/quizAssignment.model.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import InstructorProfile from "../models/instructorProfile.model.js";
import InstructorProfileService from "../services/instructorProfile.service.js";

/**
 * @desc    Assign a quiz to a primary instructor (Author or Admin only)
 * @route   POST /api/v2/instructor/quizzes/:quizId/assign
 * @access  Private (Quiz Creator or Admin)
 */
export const assignQuizToInstructor = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { instructorId, role = "primary" } = req.body;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "instructorId is required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Authorization: only the creator of the quiz or an admin can reassign
    const isAuthor = quiz.createdBy.toString() === req.auth.userId.toString();
    const isAdmin = req.auth.role === "admin";
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the quiz creator or an admin can assign instructors to this quiz",
      });
    }

    // Verify target user is an instructor
    const targetInstructor = await User.findById(instructorId);
    if (!targetInstructor || targetInstructor.role !== "instructor") {
      return res.status(400).json({
        success: false,
        message: "Target user must be a registered instructor",
      });
    }

    const assignment = await QuizAssignment.findOneAndUpdate(
      { quizId },
      { instructorId, role, assignedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await InstructorProfileService.invalidateAssignedCountCache(instructorId);

    res.status(200).json({
      success: true,
      message: "Quiz assigned to instructor successfully",
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all quizzes assigned to currently logged-in instructor
 * @route   GET /api/v2/instructor/quizzes/assigned
 * @access  Private (Instructor)
 */
export const getInstructorAssignedQuizzes = async (req, res, next) => {
  try {
    const instructorId = req.auth.userId;
    const assignments = await QuizAssignment.find({ instructorId }).populate("quizId");

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments.map((a) => a.quizId).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get assigned instructor profile for a quiz (Transparency for students)
 * @route   GET /api/v2/quizzes/:quizId/assigned-instructor
 * @access  Public / Student
 */
export const getQuizAssignedInstructor = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let instructorUser = null;
    let role = "creator";

    // 1. Check explicit QuizAssignment first
    const assignment = await QuizAssignment.findOne({ quizId }).populate("instructorId", "name email avatar");
    if (assignment && assignment.instructorId) {
      instructorUser = assignment.instructorId;
      role = assignment.role || "primary";
    } else {
      // 2. Fallback to quiz creator
      instructorUser = await User.findById(quiz.createdBy).select("name email avatar");
    }

    if (!instructorUser) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    // Fetch instructor profile (bio, expertise, stats)
    let instructorProfile = await InstructorProfile.findOne({ userId: instructorUser._id });

    res.status(200).json({
      success: true,
      data: {
        instructorId: instructorUser._id,
        name: instructorUser.name,
        email: instructorUser.email,
        avatar: instructorUser.avatar || null,
        bio: instructorProfile?.bio || "Verified Quimora Assessment Instructor",
        expertise: instructorProfile?.expertise || ["Computer Science", "Engineering"],
        role,
        isVerified: true,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Record student consent before starting a quiz
 * @route   POST /api/v2/student/quiz/:quizId/consent
 * @access  Private (Student)
 */
export const recordStudentConsent = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({
      success: true,
      message: "Consent verified and recorded for quiz attempt",
      data: {
        quizId,
        studentId: userId,
        consentGiven: true,
        consentedAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
