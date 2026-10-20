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

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

async function resetV3Data() {
  try {
    console.log("Connecting to MongoDB for V3 Data Reset...");
    await mongoose.connect(MONGO_URI);

    console.log("Wiping V3 database collections...");
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await InstructorProfile.deleteMany({});
    await EloRating.deleteMany({});
    await Interest.deleteMany({});
    await Level.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await QuizAttempt.deleteMany({});
    await QuizAssignment.deleteMany({});

    console.log("✅ All V3 collections wiped successfully!");
  } catch (error) {
    console.error("❌ Error resetting V3 data:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

resetV3Data();
