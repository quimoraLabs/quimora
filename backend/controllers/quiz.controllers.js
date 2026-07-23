import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import mongoose from "mongoose";
import {
  assertQuizExists,
  assertUserExists,
} from "../utils/assertion.utils.js";
import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";
import { isDuplicateQuiz } from "../utils/duplicate.utils.js";

// Fetch Student Specific Active & Published Available Quizzes
export const getAvailableQuizzesForStudents = async (req, res, next) => {
  try {
    const now = new Date();
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const query = {
      status: "published",
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    };

    const totalItems = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name email")
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};


// Create a new quiz (Allows empty question sets to add later)
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, timeLimit, maxAttempts, startDate, endDate, tags = [] } = req.body;
    const userId = req.auth.userId;
    await assertUserExists(userId, false);

    // Check for duplicate quiz title for this user
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
    });
    await quiz.save();
    // next();
    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    // console.error("Create Quiz Error:", error);
    next(error);
  }
};


// Fetch single quiz high-level details for tracking
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
    }).skip((page - 1) * limit)
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
    // console.error("Get Quizzes Error:", error);
    next(error);
  }
};

export const getQuizzes = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    // Total count of ALL quizzes in the database
    const totalItems = await Quiz.countDocuments();

    // Fetch all quizzes sorted by newest first
    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Universal formatting
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

export const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // 1. Fetch quiz with clean populated fields (.lean() for lightweight plain object)
    const quiz = await Quiz.findById(quizId)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // 2. Format response cleanly
    const result = formatUniversalResponse(quiz, "createdBy", [
      "name",
      "email",
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();
    const data = req.body;

    // 1. Ownership & Existence Check (Single DB lookup)
    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to update this quiz" });
    }

    // 2. Validate essential title
    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      // Duplicate title check only if title is actually changing
      if (data.title.trim() !== quiz.title) {
        const isDuplicate = await isDuplicateQuiz(data.title.trim(), userId, quizId);
        if (isDuplicate) {
          return res.status(409).json({ error: "A quiz with this title already exists" });
        }
      }
    }

    // 3. Filter allowed updating fields
    const allowedFields = [
      "title",
      "description",
      "tags",
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

    // Example Backend Check
    const hasChanges = Object.keys(filteredData).some(
      (key) => JSON.stringify(filteredData[key]) !== JSON.stringify(quiz[key])
    );

    if (!hasChanges) {
      return res.status(400).json({
        error: "No changes detected in the provided data",
      });
    }

    // 4. Validate Start Date vs End Date logic
    const finalStartDate = filteredData.startDate ? new Date(filteredData.startDate) : quiz.startDate;
    const finalEndDate = filteredData.endDate ? new Date(filteredData.endDate) : quiz.endDate;

    if (finalStartDate && finalEndDate && finalEndDate <= finalStartDate) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    // 5. Direct Document Modification & Save (Triggers Mongoose Virtuals & Schema Hooks Properly)
    Object.assign(quiz, filteredData);

    // Save document (runValidators: true works natively on .save())
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

export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    // 1. Existence Check
    const quiz = await assertQuizExists(quizId);

    // 2. Authorization Check (Only creator can delete)
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to delete this quiz" });
    }

    // 3. Delete the Quiz
    await quiz.deleteOne();

    // 4. CASCADING DELETE: Remove all linked questions to prevent database junk
    await Question.deleteMany({ quizId });

    res.status(200).json({
      success: true,
      message: "Quiz and its associated questions deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const changeQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    // 1. Direct status validation (No unnecessary array declaration)
    if (status !== "draft" && status !== "published") {
      return res.status(400).json({ error: "Invalid status" });
    }

    // 2. Fetch Quiz
    const quiz = await assertQuizExists(quizId);

    // 3. Authorization Check
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this resource" });
    }

    // 4. Idempotency Check
    if (quiz.status === status) {
      return res.status(400).json({ error: `Quiz is already ${status}` });
    }

    // 5. Correct Count Check for Separated Question Collection
    if (status === "published") {
      const questionCount = await Question.countDocuments({ quizId });
      if (questionCount === 0) {
        return res.status(400).json({
          error: "Cannot publish a quiz containing zero active questions",
        });
      }
    }

    // 6. Save Updated Status
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

export const toggleQuizActiveStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    // 1. Fetch & Existence Check
    const quiz = await assertQuizExists(quizId);

    // 2. Authorization Check
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // 3. Simple Boolean Flip
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
