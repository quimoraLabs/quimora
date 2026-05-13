import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import {
  assertQuizExists,
  assertUserExists,
} from "../utils/assertion.utils.js";

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    await assertUserExists(req.auth.userId, false);

    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.auth.userId,
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

export const getQuizzesByInstructor = async (req, res, next) => {
  try {
    await assertUserExists(req.auth.userId, false);
    const quizzes = await Quiz.find({ createdBy: req.auth.userId }).populate(
      "createdBy",
      "username email",
    );
    if (!quizzes) {
      return res.status(404).json({
        message: "Quizzes not found",
      });
    }
    res.status(200).json({ success: true, data: quizzes || [] });
  } catch (error) {
    // console.error("Get Quizzes Error:", error);
    next(error);
  }
};

export const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "username email");

    if (!quizzes || !quizzes.length === 0) {
      res.status(404).json({ success: false, message: "Quizzes are empty" });
    }

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    // console.error("Get All Quizzes Error:", error);
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      // createdBy: req.auth.userId,
    }).populate("createdBy", "username email");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    // Mongoose CastErrors are already intercepted at the application layer by your route middleware layout
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId;
    const data = req.body;

    // 1. REUSE ASSERTION: Verify user presence using optimized zero-memory search index mapping
    // Note: Corrected variable format token assignment to ensure string structure compatibility
    await assertUserExists(req.auth.userId, "false");

    // 2. Validate essential text payload strings
    if (data.title !== undefined && !data.title.trim()) {
      return res.status(400).json({
        error: "Title cannot be empty",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "tags",
      "timeLimit",
      "startDate",
      "endDate",
      "maxAttempts",
    ];

    // 3. Isolate permitted updating fields
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        error: "No valid fields provided for update",
      });
    }

    // 4. REUSE ASSERTION: Secure full quiz extraction to avoid properties of null application failures
    const quiz = await assertQuizExists(quizId);

    // 6. Evaluate data changes accurately (JSON stringification handles reference arrays like "tags" perfectly)
    const hasChanges = Object.keys(filteredData).some(
      (key) => JSON.stringify(filteredData[key]) !== JSON.stringify(quiz[key]),
    );

    if (!hasChanges) {
      return res.status(400).json({
        error: "No changes detected in the provided data",
      });
    }

    // 7. Execute explicit atomic field updates
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { _id: req.params.quizId, createdBy: req.auth.userId },
      { $set: filteredData },
      { new: true, runValidators: true },
    );

    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    // Mongoose CastErrors are already intercepted at the application layer by your route middleware layout
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    await assertQuizExists(req.params.quizId, false);

    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.quizId,
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    // Mongoose CastErrors are already intercepted at the application layer by your route middleware layout
    next(error);
  }
};

export const changeQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { quizId } = req.params;
    const userId = req.auth.userId;

    const allowedStatus = ["draft", "published"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    // 1. REUSE ASSERTION: Hydrate the quiz document safely
    const quiz = await assertQuizExists(quizId);

    // 2. Authorization Boundary Check
    if (!quiz.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this resource" });
    }

    // 3. Idempotency Check: Prevent duplicate state setting operations
    if (quiz.status === status) {
      return res.status(400).json({
        error: `Quiz is already ${status}`,
      });
    }

    // 4. Data Rule Check: Block empty placeholder publications
    if (
      status === "published" &&
      (!quiz.questions || quiz.questions.length === 0)
    ) {
      return res
        .status(400)
        .json({
          error: "Cannot publish a quiz containing zero active questions",
        });
    }

    // 5. Update and apply save mutations securely
    quiz.status = status;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz status updated successfully`,
      data: { status: quiz.status },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    next(error);
  }
};

export const changeQuizActivity = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId;

    // 1. REUSE ASSERTION: Verify quiz record presence using an optimized metadata check
    // We pass "false" to assert existence cleanly without loading massive sub-document nested structures
    await assertQuizExists(quizId, "false");

    // 2. ATOMIC FIELD INVERSION: Fetch the current activity state and flip it cleanly using an array pipe
    // This removes the race-condition risk of concurrent document overwrite failures completely
    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, createdBy: userId },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true, runValidators: true },
    );

    // 3. Authorization or record ownership match fallback fallback validation check
    if (!quiz) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this resource" });
    }

    res.status(200).json({
      success: true,
      message: "Quiz activity status changed successfully",
      data: { isActive: quiz.isActive },
    });
  } catch (error) {
    next(error);
  }
};
