import mongoose from "mongoose";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";

export const createQuestion = async (req, res) => {
    const data = req.body;
    const quizId = req.params.quizId;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(404).json({ message: "Quiz not found" });
    }
    
    try {
        const question = new Question({
            ...data,
            creator: userId,
        });
        await question.save();
        res.status(201).json(question);
    }
    catch (error) {
        res.status(409).json({ message: error.message });
    }
};