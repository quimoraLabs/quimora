import mongoose from "mongoose";
import dotenv from "dotenv";
import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";
import Challenge from "../models/challenge.model.js";
import PracticeProfile from "../models/practiceProfile.model.js";
import PracticeSession from "../models/practiceSession.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import QuizPassAppeal from "../models/quizPassAppeal.model.js";
import CoinTransaction from "../models/coinTransaction.model.js";
import Interest from "../models/interest.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import InstructorProfile from "../models/instructorProfile.model.js";
import EloRating from "../models/eloRating.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

export async function cleanAllCollections() {
  try {
    console.log("Connecting to:", MONGO_URI);
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
    }
    console.log("🧹 Cleaning all old hierarchy, quizzes, questions, and practice sessions...");

    const results = await Promise.all([
      Domain.deleteMany({}),
      Course.deleteMany({}),
      Chapter.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      QuizAssignment.deleteMany({}),
      Challenge.deleteMany({}),
      PracticeProfile.deleteMany({}),
      PracticeSession.deleteMany({}),
      StudentQuizProgress.deleteMany({}),
      QuizPassAppeal.deleteMany({}),
      CoinTransaction.deleteMany({}),
      Interest.deleteMany({}),
      StudentProfile.deleteMany({}),
      InstructorProfile.deleteMany({}),
      EloRating.deleteMany({}),
    ]);

    console.log("✅ All collections completely wiped clean!");
    return results;
  } catch (err) {
    console.error("Cleanup failed:", err);
    throw err;
  }
}

if (process.argv[1]?.includes("clean_all_data.js")) {
  cleanAllCollections().then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  }).catch(() => process.exit(1));
}

