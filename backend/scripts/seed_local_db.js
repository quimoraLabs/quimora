import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

async function seedDatabase() {
  console.log("==================================================");
  console.log("🌱 SEEDING MULTIPLE USERS & INSTRUCTORS DATA");
  console.log(`🔗 Target Connection: ${MONGO_URI}`);
  console.log("==================================================");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clean existing seed data in local database
    const emailsToClean = [
      "admin@quimora.com",
      "instructor@quimora.com",
      "rajesh@quimora.com",
      "emily@quimora.com",
      "student@quimora.com",
      "rahul@quimora.com",
      "priya@quimora.com",
      "david@quimora.com",
      "ananya@quimora.com",
    ];

    await User.deleteMany({ email: { $in: emailsToClean } });
    console.log("🧹 Cleaned old test users");

    const plainPassword = "Password123!";

    // 1. Create Admin
    const adminUser = await User.create({
      username: "admin_quimora",
      name: "System Administrator",
      email: "admin@quimora.com",
      password: plainPassword,
      role: "admin",
      active: true,
    });

    // 2. Create 3 Instructors
    const inst1 = await User.create({
      username: "prof_sarah",
      name: "Prof. Sarah Connor",
      email: "instructor@quimora.com",
      password: plainPassword,
      role: "instructor",
      active: true,
    });

    const inst2 = await User.create({
      username: "dr_rajesh",
      name: "Dr. Rajesh Kumar",
      email: "rajesh@quimora.com",
      password: plainPassword,
      role: "instructor",
      active: true,
    });

    const inst3 = await User.create({
      username: "emily_watson",
      name: "Emily Watson",
      email: "emily@quimora.com",
      password: plainPassword,
      role: "instructor",
      active: true,
    });

    // 3. Create 5 Students
    const student1 = await User.create({
      username: "alex_rivera",
      name: "Alex Rivera",
      email: "student@quimora.com",
      password: plainPassword,
      role: "user",
      active: true,
    });

    const student2 = await User.create({
      username: "rahul_sharma",
      name: "Rahul Sharma",
      email: "rahul@quimora.com",
      password: plainPassword,
      role: "user",
      active: true,
    });

    const student3 = await User.create({
      username: "priya_patel",
      name: "Priya Patel",
      email: "priya@quimora.com",
      password: plainPassword,
      role: "user",
      active: true,
    });

    const student4 = await User.create({
      username: "david_kim",
      name: "David Kim",
      email: "david@quimora.com",
      password: plainPassword,
      role: "user",
      active: true,
    });

    const student5 = await User.create({
      username: "ananya_verma",
      name: "Ananya Verma",
      email: "ananya@quimora.com",
      password: plainPassword,
      role: "user",
      active: true,
    });

    console.log("👤 Created Accounts (Password for all: Password123!):");
    console.log("   👑 Admin:       admin@quimora.com");
    console.log("   🎓 Instructors: instructor@quimora.com, rajesh@quimora.com, emily@quimora.com");
    console.log("   👤 Students:    student@quimora.com, rahul@quimora.com, priya@quimora.com, david@quimora.com, ananya@quimora.com");

    // 4. Create Sample Quiz 1 (by Prof. Sarah)
    const quiz1 = await Quiz.create({
      title: "JavaScript Essentials & ES6+ Mastery",
      description: "Master modern JavaScript concepts including closures, promises, async/await, and scope.",
      timeLimit: 15,
      passingScore: 60,
      negativeMarking: 25,
      status: "published",
      isActive: true,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-09-30T23:59:59.000Z"),
      tags: ["JavaScript", "Frontend", "WebDev"],
      createdBy: inst1._id,
      questions: [],
    });

    const q1 = await Question.create({
      quizId: quiz1._id,
      questionText: "What will be the output of `typeof null` in JavaScript?",
      options: [
        { optionText: "null", isCorrect: false },
        { optionText: "object", isCorrect: true },
        { optionText: "undefined", isCorrect: false },
        { optionText: "number", isCorrect: false },
      ],
      marks: 4,
      difficulty: "easy",
    });

    const q2 = await Question.create({
      quizId: quiz1._id,
      questionText: "Which keyword declares a block-scoped variable in ES6?",
      options: [
        { optionText: "var", isCorrect: false },
        { optionText: "let", isCorrect: true },
        { optionText: "global", isCorrect: false },
        { optionText: "define", isCorrect: false },
      ],
      marks: 4,
      difficulty: "easy",
    });

    const q3 = await Question.create({
      quizId: quiz1._id,
      questionText: "What does the `Promise.all()` method return when all input promises resolve?",
      options: [
        { optionText: "The result of the first resolved promise", isCorrect: false },
        { optionText: "An array of all resolved values", isCorrect: true },
        { optionText: "A single combined string", isCorrect: false },
        { optionText: "A boolean true", isCorrect: false },
      ],
      marks: 4,
      difficulty: "medium",
    });

    const q4 = await Question.create({
      quizId: quiz1._id,
      questionText: "What is the primary difference between `==` and `===` operators?",
      options: [
        { optionText: "`==` compares types while `===` ignores types", isCorrect: false },
        { optionText: "`===` performs strict equality checking value AND type", isCorrect: true },
        { optionText: "There is no difference between them", isCorrect: false },
        { optionText: "`==` is deprecated in modern JS", isCorrect: false },
      ],
      marks: 4,
      difficulty: "easy",
    });

    quiz1.questions = [q1._id, q2._id, q3._id, q4._id];
    await quiz1.save();

    // 5. Create Sample Quiz 2 (by Dr. Rajesh)
    const quiz2 = await Quiz.create({
      title: "Full-Stack Web Development Architecture",
      description: "Test your skills across Node.js, Express, MongoDB, REST APIs, and React architecture.",
      timeLimit: 20,
      passingScore: 50,
      negativeMarking: 25,
      status: "published",
      isActive: true,
      tags: ["Node.js", "Express", "MongoDB", "React"],
      createdBy: inst2._id,
      questions: [],
    });

    const q2_1 = await Question.create({
      quizId: quiz2._id,
      questionText: "Which Express middleware is used to parse incoming JSON request payloads?",
      options: [
        { optionText: "express.static()", isCorrect: false },
        { optionText: "express.json()", isCorrect: true },
        { optionText: "express.urlencoded()", isCorrect: false },
        { optionText: "express.router()", isCorrect: false },
      ],
      marks: 5,
      difficulty: "easy",
    });

    const q2_2 = await Question.create({
      quizId: quiz2._id,
      questionText: "In MongoDB, what does the `.lean()` method accomplish on Mongoose queries?",
      options: [
        { optionText: "Deletes documents from the collection", isCorrect: false },
        { optionText: "Returns plain JavaScript objects instead of Mongoose Documents", isCorrect: true },
        { optionText: "Encrypts the returned data payload", isCorrect: false },
        { optionText: "Limits query results to 10 items", isCorrect: false },
      ],
      marks: 5,
      difficulty: "medium",
    });

    const q2_3 = await Question.create({
      quizId: quiz2._id,
      questionText: "What HTTP response status code signifies an Unauthorized authentication error?",
      options: [
        { optionText: "200 OK", isCorrect: false },
        { optionText: "401 Unauthorized", isCorrect: true },
        { optionText: "404 Not Found", isCorrect: false },
        { optionText: "500 Internal Server Error", isCorrect: false },
      ],
      marks: 5,
      difficulty: "easy",
    });

    const q2_4 = await Question.create({
      quizId: quiz2._id,
      questionText: "Which React hook is designed for executing side-effects in functional components?",
      options: [
        { optionText: "useState", isCorrect: false },
        { optionText: "useEffect", isCorrect: true },
        { optionText: "useContext", isCorrect: false },
        { optionText: "useReducer", isCorrect: false },
      ],
      marks: 5,
      difficulty: "easy",
    });

    quiz2.questions = [q2_1._id, q2_2._id, q2_3._id, q2_4._id];
    await quiz2.save();

    // 6. Question Snapshots setup
    const q1Obj = await Question.findById(q1._id).select("+options.isCorrect");
    const q2Obj = await Question.findById(q2._id).select("+options.isCorrect");
    const q3Obj = await Question.findById(q3._id).select("+options.isCorrect");
    const q4Obj = await Question.findById(q4._id).select("+options.isCorrect");

    const c1 = q1Obj.options.find((o) => o.isCorrect)?._id.toString();
    const c2 = q2Obj.options.find((o) => o.isCorrect)?._id.toString();
    const c3 = q3Obj.options.find((o) => o.isCorrect)?._id.toString();
    const c4 = q4Obj.options.find((o) => o.isCorrect)?._id.toString();

    const w1 = q1Obj.options.find((o) => !o.isCorrect)?._id.toString();
    const w4 = q4Obj.options.find((o) => !o.isCorrect)?._id.toString();

    const snapshotsQuiz1 = [
      { questionId: q1._id, questionText: q1.questionText, marks: 4, difficulty: "easy", options: q1.options.map(o=>({_id: o._id, optionText: o.optionText, isCorrect: o.isCorrect})) },
      { questionId: q2._id, questionText: q2.questionText, marks: 4, difficulty: "easy", options: q2.options.map(o=>({_id: o._id, optionText: o.optionText, isCorrect: o.isCorrect})) },
      { questionId: q3._id, questionText: q3.questionText, marks: 4, difficulty: "medium", options: q3.options.map(o=>({_id: o._id, optionText: o.optionText, isCorrect: o.isCorrect})) },
      { questionId: q4._id, questionText: q4.questionText, marks: 4, difficulty: "easy", options: q4.options.map(o=>({_id: o._id, optionText: o.optionText, isCorrect: o.isCorrect})) },
    ];

    // Create Attempts for Students:

    // Student 1 (Alex Rivera) - Score 68.75%
    const attemptAlex = await QuizAttempt.create({
      userId: student1._id,
      quizId: quiz1._id,
      totalQuestions: 4,
      correctAnswersCount: 3,
      incorrectAnswersCount: 1,
      unattemptedCount: 0,
      marksObtained: 11,
      totalMarks: 16,
      passed: true,
      score: 68.75,
      status: "completed",
      questionSnapshots: snapshotsQuiz1,
      answers: [
        { questionId: q1._id, selectedOptions: [c1], isCorrect: true, timeSpent: 15 },
        { questionId: q2._id, selectedOptions: [c2], isCorrect: true, timeSpent: 12 },
        { questionId: q3._id, selectedOptions: [c3], isCorrect: true, timeSpent: 25 },
        { questionId: q4._id, selectedOptions: [w4], isCorrect: false, timeSpent: 18 },
      ],
      startedAt: new Date(Date.now() - 300000),
      completedAt: new Date(),
      timeTaken: 70,
    });

    // Student 2 (Rahul Sharma) - Score 100%
    await QuizAttempt.create({
      userId: student2._id,
      quizId: quiz1._id,
      totalQuestions: 4,
      correctAnswersCount: 4,
      incorrectAnswersCount: 0,
      unattemptedCount: 0,
      marksObtained: 16,
      totalMarks: 16,
      passed: true,
      score: 100,
      status: "completed",
      questionSnapshots: snapshotsQuiz1,
      answers: [
        { questionId: q1._id, selectedOptions: [c1], isCorrect: true, timeSpent: 10 },
        { questionId: q2._id, selectedOptions: [c2], isCorrect: true, timeSpent: 8 },
        { questionId: q3._id, selectedOptions: [c3], isCorrect: true, timeSpent: 15 },
        { questionId: q4._id, selectedOptions: [c4], isCorrect: true, timeSpent: 12 },
      ],
      startedAt: new Date(Date.now() - 600000),
      completedAt: new Date(Date.now() - 550000),
      timeTaken: 45,
    });

    // Student 3 (Priya Patel) - Score 50%
    await QuizAttempt.create({
      userId: student3._id,
      quizId: quiz1._id,
      totalQuestions: 4,
      correctAnswersCount: 2,
      incorrectAnswersCount: 2,
      unattemptedCount: 0,
      marksObtained: 6,
      totalMarks: 16,
      passed: false,
      score: 37.5,
      status: "completed",
      questionSnapshots: snapshotsQuiz1,
      answers: [
        { questionId: q1._id, selectedOptions: [c1], isCorrect: true, timeSpent: 20 },
        { questionId: q2._id, selectedOptions: [c2], isCorrect: true, timeSpent: 14 },
        { questionId: q3._id, selectedOptions: [w1], isCorrect: false, timeSpent: 30 },
        { questionId: q4._id, selectedOptions: [w4], isCorrect: false, timeSpent: 22 },
      ],
      startedAt: new Date(Date.now() - 900000),
      completedAt: new Date(Date.now() - 800000),
      timeTaken: 86,
    });

    // Student 4 (David Kim) - Score 87.5%
    await QuizAttempt.create({
      userId: student4._id,
      quizId: quiz1._id,
      totalQuestions: 4,
      correctAnswersCount: 3,
      incorrectAnswersCount: 0,
      unattemptedCount: 1,
      marksObtained: 12,
      totalMarks: 16,
      passed: true,
      score: 75,
      status: "completed",
      questionSnapshots: snapshotsQuiz1,
      answers: [
        { questionId: q1._id, selectedOptions: [c1], isCorrect: true, timeSpent: 11 },
        { questionId: q2._id, selectedOptions: [c2], isCorrect: true, timeSpent: 9 },
        { questionId: q3._id, selectedOptions: [c3], isCorrect: true, timeSpent: 16 },
        { questionId: q4._id, selectedOptions: ["-1"], isCorrect: false, timeSpent: 0 },
      ],
      startedAt: new Date(Date.now() - 1200000),
      completedAt: new Date(Date.now() - 1100000),
      timeTaken: 55,
    });

    console.log("📊 Created 4 Completed Quiz Attempts for Roster & Leaderboard testing!");
    console.log(`🔗 Alex Rivera Report: http://localhost:5173/student/attempts/${attemptAlex._id}/report`);

    console.log("\n==================================================");
    console.log("🎉 DATABASE SEEDED WITH 5 STUDENTS, 3 INSTRUCTORS & ATTEMPTS!");
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Seed Error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
