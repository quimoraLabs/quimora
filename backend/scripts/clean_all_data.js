import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import InstructorProfile from "../models/instructorProfile.model.js";
import EloRating from "../models/eloRating.model.js";
import Interest from "../models/interest.model.js";
import Level from "../models/level.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";
import Chapter from "../models/chapter.model.js";
import Challenge from "../models/challenge.model.js";
import PracticeProfile from "../models/practiceProfile.model.js";
import PracticeSession from "../models/practiceSession.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

async function cleanAll() {
  try {
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Cleaning all collections...");

    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      InstructorProfile.deleteMany({}),
      EloRating.deleteMany({}),
      Interest.deleteMany({}),
      Level.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      QuizAssignment.deleteMany({}),
      Chapter.deleteMany({}),
      Challenge.deleteMany({}),
      PracticeProfile.deleteMany({}),
      PracticeSession.deleteMany({}),
      StudentQuizProgress.deleteMany({}),
    ]);

    console.log("✅ All collections completely wiped clean!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanAll();

