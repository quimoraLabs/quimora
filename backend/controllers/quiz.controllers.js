import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { assertUserExists } from "../utils/assertion.utils.js";

export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    const user = await assertUserExists(req.auth.userId);
    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.auth.userId,
    });
    await quiz.save();
    // next();
    res
      .status(201)
      .json({
        success: true,
        message: "Quiz created successfully",
        data: quiz,
      });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    next(error);
  }
};

export const getQuizzesByInstructor = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.auth.userId }).populate("createdBy", "username email");
    if (!quizzes) {
      return res.status(404).json({
        message: "Quizzes not found",
      });
    }
    res.status(200).json({ success: true, data: quizzes || [] });
  } catch (error) {
    console.error("Get Quizzes Error:", error);
    next(error);
  }
};

export const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "username email");

    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    console.error("Get All Quizzes Error:", error);
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
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    next(error);
  }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "tags",
      "timeLimit",
      "startDate",
      "endDate",
      "maxAttempts",
    ];
    const data = req.body;

    if (data.title !== undefined && !data.title.trim()) {
      return res.status(400).json({
        error: "Title cannot be empty",
      });
    }

    // Filter out any fields that are not allowed
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

    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      createdBy: req.auth.userId,
    });

    const hasChanges = Object.keys(filteredData).some(
      (key) => filteredData[key] !== quiz[key],
    );

    if (!hasChanges) {
      return res.status(400).json({
        error: "No changes detected in the provided data",
      });
    }

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
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
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
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    next(error);
  }
};

export const changeQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["draft", "published"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      createdBy: req.auth.userId,
    });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.status === status) {
      return res.status(400).json({
        error: `Quiz is already ${status}`,
      });
    }

    if (status === "published" && quiz.questions.length === 0) {
      return res.status(400).json({
        error: "Cannot publish quiz without questions",
      });
    }

    quiz.status = status;
    await quiz.save();
    res
      .status(200)
      .json({
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
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      createdBy: req.auth.userId,
    });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    quiz.isActive = !quiz.isActive;
    await quiz.save();
    res.status(200).json({
      success: true,
      message: "Quiz activity status changed successfully",
      data: { isActive: quiz.isActive },
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    next(error);
  }
};
