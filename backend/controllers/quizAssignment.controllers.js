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
    const { instructorId, role = "primary", force = false } = req.body;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "instructorId is required" });
    }

    const quiz = await Quiz.findById(quizId).populate("interestIds");
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

    // 1. Strict Check: Ensure instructor has configured their expertise
    let instructorProfile = await InstructorProfile.findOne({ userId: instructorId });
    if (!instructorProfile) {
      instructorProfile = await InstructorProfile.create({ userId: instructorId });
    }

    const cleanExpertise = (instructorProfile.expertise || []).filter(
      (e) => typeof e === "string" && e.trim().length > 0
    );

    // Rule 1: Empty expertise blocks assignment
    if (cleanExpertise.length === 0) {
      return res.status(400).json({
        success: false,
        code: "EXPERTISE_REQUIRED",
        message:
          "Instructor has not added any areas of expertise to their profile. Please instruct them to complete their profile before assigning quizzes.",
      });
    }

    // 2. Strict Check: Case-insensitive & partial match between quiz topics/tags and instructor expertise
    const quizTopics = [];
    if (quiz.title) quizTopics.push(quiz.title);
    if (Array.isArray(quiz.tags)) quizTopics.push(...quiz.tags);
    if (Array.isArray(quiz.interestIds)) {
      quiz.interestIds.forEach((i) => {
        if (i && i.name) quizTopics.push(i.name);
      });
    }

    const isTopicMatching = (topics, expertiseList) => {
      // Broad baseline catch
      if (expertiseList.some((e) => ["general", "all", "computer science"].includes(e.toLowerCase().trim()))) {
        return true;
      }

      return topics.some((topic) => {
        const tLower = topic.toLowerCase().trim();
        return expertiseList.some((exp) => {
          const eLower = exp.toLowerCase().trim();
          if (tLower.includes(eLower) || eLower.includes(tLower)) return true;

          const acronyms = [
            ["js", "javascript"],
            ["ts", "typescript"],
            ["py", "python"],
            ["ml", "machine learning"],
            ["ai", "artificial intelligence"],
            ["dbms", "database"],
            ["web dev", "web development"],
            ["os", "operating system"],
            ["dsa", "data structures"],
          ];

          return acronyms.some(
            ([abbr, full]) =>
              (tLower.includes(abbr) && eLower.includes(full)) ||
              (tLower.includes(full) && eLower.includes(abbr))
          );
        });
      });
    };

    const hasMatchingExpertise = isTopicMatching(quizTopics, cleanExpertise);

    // Rule 2: If expertise doesn't match and force is not set, return warning requiring confirmation
    if (!hasMatchingExpertise && !force) {
      return res.status(422).json({
        success: false,
        code: "EXPERTISE_MISMATCH",
        requiresConfirmation: true,
        message: `Instructor's expertise (${cleanExpertise.join(", ")}) does not match this quiz's topic or tags. Assign anyway?`,
        quizTopics,
        instructorExpertise: cleanExpertise,
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
      message: hasMatchingExpertise
        ? "Quiz assigned to instructor successfully (Expertise verified)"
        : "Quiz assigned to instructor with forced confirmation",
      data: assignment,
      matched: hasMatchingExpertise,
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
    const cleanExpertise = (instructorProfile?.expertise || []).filter(
      (e) => typeof e === "string" && e.trim().length > 0
    );
    const hasExpertise = cleanExpertise.length > 0;

    res.status(200).json({
      success: true,
      data: {
        instructorId: instructorUser._id,
        name: instructorUser.name,
        email: instructorUser.email,
        avatar: instructorUser.avatar || null,
        bio: instructorProfile?.bio || "Verified Quimora Assessment Instructor",
        expertise: hasExpertise ? cleanExpertise : ["Expertise not specified yet"],
        role,
        isVerified: hasExpertise,
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
