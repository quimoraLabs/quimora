import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import mongoose from "mongoose";
import { redisCache } from "../config/redis.js";
import {
  assertQuizExists,
  assertUserExists,
} from "../utils/assertion.utils.js";
import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";
import { isDuplicateQuiz } from "../utils/duplicate.utils.js";

/**
 * @desc    Fetch active and published available quizzes for students
 * @route   GET /api/v2/quizzes/student
 * @access  Private (Student)
 * @returns {Object} Paginated list of student available quizzes
 */
export const getAvailableQuizzesForStudents = async (req, res, next) => {
  try {
    const now = new Date();
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const userId = req.auth?.userId;

    const cacheKey = userId
      ? `quizzes:student:${userId}:p${page}:l${limit}`
      : `quizzes:student:all:p${page}:l${limit}`;

    const cachedData = await redisCache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const query = {
      status: "published",
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    };

    // V3 Interest-Driven Filter: only return quizzes matching the student's selected interests
    if (userId) {
      const profile = await StudentProfile.findOne({ userId });
      if (profile && Array.isArray(profile.interests) && profile.interests.length > 0) {
        query.interestIds = { $in: profile.interests };
      } else {
        query.interestIds = { $in: [] };
      }
    }

    const totalItems = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name email")
      .populate("interestIds", "name slug")
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const responsePayload = {
      success: true,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
        limit,
      },
      data: quizzes,
    };

    await redisCache.set(cacheKey, responsePayload, 60);

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new quiz
 * @route   POST /api/v2/quizzes
 * @access  Private (Instructor/Admin)
 * @returns {Object} Created quiz details
 */
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, timeLimit, maxAttempts, startDate, endDate, tags = [], interestIds = [] } = req.body;
    const userId = req.auth.userId;
    await assertUserExists(userId, false);

    const isDuplicate = await isDuplicateQuiz(title, userId);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "A quiz with this title already exists.",
      });
    }

    const quiz = new Quiz({
      title,
      description,
      timeLimit,
      maxAttempts,
      startDate,
      endDate,
      createdBy: userId,
      tags,
      interestIds,
    });
    await quiz.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch quizzes created by the logged-in instructor
 * @route   GET /api/v2/quizzes/instructor
 * @access  Private (Instructor)
 * @returns {Object} Paginated list of instructor quizzes
 */
export const getQuizzesByInstructor = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const totalItems = await Quiz.countDocuments({
      createdBy: req.auth.userId.toString(),
    });

    await assertUserExists(req.auth.userId, false);

    const quizzes = await Quiz.find({
      createdBy: req.auth.userId.toString(),
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!quizzes) {
      return res.status(404).json({
        message: "Quizzes not found",
      });
    }
    const formattedQuizzes = formatUniversalResponse(quizzes);
    const totalPages = Math.ceil(formattedQuizzes.length / limit);
    res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit,
      },
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all quizzes system-wide (Admin list)
 * @route   GET /api/v2/quizzes
 * @access  Private (Admin)
 * @returns {Object} Paginated list of system quizzes
 */
export const getQuizzes = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const totalItems = await Quiz.countDocuments();

    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedQuizzes = quizzes.length
      ? formatUniversalResponse(quizzes, "createdBy", ["name", "email"])
      : [];

    res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
        limit,
      },
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single quiz details by ID with stats
 * @route   GET /api/v2/quizzes/:quizId
 * @access  Public / Authenticated
 * @returns {Object} Detailed quiz metadata and statistics
 */
export const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const result = formatUniversalResponse(quiz, "createdBy", [
      "name",
      "email",
    ]);

    const totalAttempts = await QuizAttempt.countDocuments({
      quizId,
      status: "completed",
    });

    result.stats = {
      attempts: totalAttempts,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing quiz details
 * @route   PATCH /api/v2/quizzes/:quizId
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated quiz object
 */
export const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();
    const data = req.body;

    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to update this quiz" });
    }

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      if (data.title.trim() !== quiz.title) {
        const isDuplicate = await isDuplicateQuiz(data.title.trim(), userId, quizId);
        if (isDuplicate) {
          return res.status(409).json({ error: "A quiz with this title already exists" });
        }
      }
    }

    const allowedFields = [
      "title",
      "description",
      "tags",
      "interestIds",
      "timeLimit",
      "startDate",
      "endDate",
      "maxAttempts",
      "status",
      "isActive",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        filteredData[field] = data[field];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const hasChanges = Object.keys(filteredData).some(
      (key) => JSON.stringify(filteredData[key]) !== JSON.stringify(quiz[key])
    );

    if (!hasChanges) {
      return res.status(400).json({
        error: "No changes detected in the provided data",
      });
    }

    const finalStartDate = filteredData.startDate ? new Date(filteredData.startDate) : quiz.startDate;
    const finalEndDate = filteredData.endDate ? new Date(filteredData.endDate) : quiz.endDate;

    if (finalStartDate && finalEndDate && finalEndDate <= finalStartDate) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    Object.assign(quiz, filteredData);
    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete quiz and cascading questions/attempts
 * @route   DELETE /api/v2/quizzes/:quizId
 * @access  Private (Instructor/Admin)
 * @returns {Object} Success message
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();
    const role = req.auth.role;

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access to delete this quiz" });
    }

    await quiz.deleteOne();

    await Question.deleteMany({ quizId });
    await QuizAttempt.deleteMany({ quizId });

    res.status(200).json({
      success: true,
      message: "Quiz and its associated questions and attempts deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change publishing status of a quiz ('draft' | 'published')
 * @route   PATCH /api/v2/quizzes/:quizId/status
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated quiz status
 */
export const changeQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    if (status !== "draft" && status !== "published") {
      return res.status(400).json({ error: "Invalid status" });
    }

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this resource" });
    }

    if (quiz.status === status) {
      return res.status(400).json({ error: `Quiz is already ${status}` });
    }

    if (status === "published") {
      const questionCount = await Question.countDocuments({ quizId });
      if (questionCount === 0) {
        return res.status(400).json({
          error: "Cannot publish a quiz containing zero active questions",
        });
      }
    }

    quiz.status = status;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz status updated to ${status} successfully`,
      data: { status: quiz.status },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle quiz active status (true / false)
 * @route   PATCH /api/v2/quizzes/:quizId/active
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated active state
 */
export const toggleQuizActiveStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz ${quiz.isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: quiz.isActive },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clone/duplicate an existing quiz and its questions
 * @route   POST /api/v2/quizzes/:quizId/clone
 * @access  Private (Instructor/Admin)
 * @returns {Object} Cloned quiz payload and question count
 */
export const cloneQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId || req.params.id;
    const userId = req.auth.userId.toString();

    const sourceQuiz = await assertQuizExists(quizId);

    if (sourceQuiz.createdBy.toString() !== userId && req.auth.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to clone this quiz" });
    }

    let clonedTitle = `${sourceQuiz.title} (Copy)`;
    let isDuplicate = await isDuplicateQuiz(clonedTitle, userId);
    if (isDuplicate) {
      clonedTitle = `${sourceQuiz.title} (Copy ${Date.now().toString().slice(-4)})`;
    }

    const clonedQuiz = new Quiz({
      title: clonedTitle,
      description: sourceQuiz.description,
      timeLimit: sourceQuiz.timeLimit,
      passingScore: sourceQuiz.passingScore,
      maxAttempts: sourceQuiz.maxAttempts,
      status: "draft",
      isActive: true,
      createdBy: userId,
      tags: sourceQuiz.tags || [],
      interestIds: sourceQuiz.interestIds || [],
    });
    await clonedQuiz.save();

    const sourceQuestions = await Question.find({ quizId: sourceQuiz._id }).lean();
    if (sourceQuestions.length > 0) {
      const clonedQuestions = sourceQuestions.map((q) => {
        const { _id, createdAt, updatedAt, quizId, ...rest } = q;
        return {
          ...rest,
          quizId: clonedQuiz._id,
        };
      });
      await Question.insertMany(clonedQuestions);
    }

    res.status(201).json({
      success: true,
      message: "Quiz duplicated successfully",
      data: {
        quiz: clonedQuiz,
        clonedQuestionsCount: sourceQuestions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
