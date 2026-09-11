process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.JWT_SECRET = "test_jwt_secret_123456789";

import mongoose from "mongoose";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

const BASE_URL = "http://localhost:5001/api/v1";
let server;

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, { ...options, headers, body });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING FULL QUIMORA ENDPOINT VALIDATION SUITE");
  console.log("==================================================");

  const { default: connectDB } = await import("../config/connectDB.js");
  const { default: app } = await import("../api/server.js");

  await connectDB();
  server = app.listen(5001);
  console.log("📡 Test Server listening on http://localhost:5001");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${testName} ${details ? "- " + JSON.stringify(details) : ""}`);
      failed++;
    }
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Quiz.deleteMany({});
      await Question.deleteMany({});
      await QuizAttempt.deleteMany({});
      console.log("🧹 Cleaned test database collections");
    }

    // ----------------------------------------------------
    // 1. Health Check
    // ----------------------------------------------------
    console.log("\n--- 1. Health Check Endpoint ---");
    const health = await request("http://localhost:5001/");
    assert(health.status === 200 && health.data.status === "ok", "GET / returns 200 OK");

    // ----------------------------------------------------
    // 2. Authentication & User Registration
    // ----------------------------------------------------
    console.log("\n--- 2. Auth & Registration ---");
    
    // Register Admin
    const adminReg = await request("/auth/register", {
      method: "POST",
      body: { username: "adminuser", email: "admin@test.com", password: "Password123!", name: "Test Admin" },
    });
    assert(adminReg.status === 201 && adminReg.data.success, "Register Admin user");
    await User.updateOne({ email: "admin@test.com" }, { role: "admin" });

    // Register Instructor
    const instReg = await request("/auth/register", {
      method: "POST",
      body: { username: "instructor1", email: "instructor@test.com", password: "Password123!", name: "Test Instructor" },
    });
    assert(instReg.status === 201 && instReg.data.success, "Register Instructor user");
    await User.updateOne({ email: "instructor@test.com" }, { role: "instructor" });

    // Register Student
    const studentReg = await request("/auth/register", {
      method: "POST",
      body: { username: "student1", email: "student@test.com", password: "Password123!", name: "Test Student" },
    });
    assert(studentReg.status === 201 && studentReg.data.success, "Register Student user");

    // Login Users
    const adminLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "admin@test.com", password: "Password123!" },
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, "Login Admin");
    const adminToken = adminLogin.data.token;

    const instLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "instructor@test.com", password: "Password123!" },
    });
    assert(instLogin.status === 200 && instLogin.data.token, "Login Instructor");
    const instToken = instLogin.data.token;

    const studentLogin = await request("/auth/login", {
      method: "POST",
      body: { email: "student@test.com", password: "Password123!" },
    });
    assert(studentLogin.status === 200 && studentLogin.data.token, "Login Student");
    const studentToken = studentLogin.data.token;

    // Profile & Reset OTP
    const getMe = await request("/auth/me", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(getMe.status === 200 && getMe.data.email === "student@test.com", "GET /auth/me returns current user");

    const otpReq = await request("/auth/request-otp", {
      method: "PATCH",
      body: { email: "student@test.com" },
    });
    assert(otpReq.status === 200 && otpReq.data.success, "PATCH /auth/request-otp works cleanly");

    // ----------------------------------------------------
    // 3. Quiz & Question Operations (Instructor)
    // ----------------------------------------------------
    console.log("\n--- 3. Quiz & Question Operations ---");

    const createQuiz = await request("/quizzes", {
      method: "POST",
      headers: { Authorization: `Bearer ${instToken}` },
      body: {
        title: "JavaScript Fundamentals Quiz",
        description: "Test basic JS concepts",
        timeLimit: 15,
        passingScore: 60,
        negativeMarking: 25,
      },
    });
    assert(createQuiz.status === 201 && createQuiz.data.data?._id, "POST /quizzes creates a new quiz");
    const quizId = createQuiz.data.data?._id;

    // Add 4-option Questions adhering strictly to Question Schema
    const addQ1 = await request(`/quiz/${quizId}/questions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instToken}` },
      body: {
        questionText: "What is typeof null in JavaScript?",
        options: [
          { optionText: "null", isCorrect: false },
          { optionText: "object", isCorrect: true },
          { optionText: "undefined", isCorrect: false },
          { optionText: "number", isCorrect: false },
        ],
        marks: 4,
        difficulty: "easy",
      },
    });
    assert(addQ1.status === 201 && addQ1.data.data?._id, "POST /quiz/:id/questions adds question 1");
    const q1Id = addQ1.data.data?._id;

    const addQ2 = await request(`/quiz/${quizId}/questions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${instToken}` },
      body: {
        questionText: "Which keyword declares a block-scoped variable?",
        options: [
          { optionText: "var", isCorrect: false },
          { optionText: "let", isCorrect: true },
          { optionText: "const", isCorrect: false },
          { optionText: "global", isCorrect: false },
        ],
        marks: 4,
        difficulty: "easy",
      },
    });
    assert(addQ2.status === 201 && addQ2.data.data?._id, "POST /quiz/:id/questions adds question 2");
    const q2Id = addQ2.data.data?._id;

    // Publish Quiz
    const publishQuiz = await request(`/quizzes/${quizId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${instToken}` },
      body: { status: "published" },
    });
    assert(publishQuiz.status === 200 && publishQuiz.data.data?.status === "published", "PATCH /quizzes/:id publishes quiz");

    // Security Check: Student vs Instructor
    const studentFetchQ = await request(`/quiz/${quizId}/questions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentFetchQ.status === 403, "GET /quiz/:id/questions blocks Student role");

    const instFetchQ = await request(`/quiz/${quizId}/questions`, {
      headers: { Authorization: `Bearer ${instToken}` },
    });
    assert(instFetchQ.status === 200 && instFetchQ.data.data?.length === 2, "GET /quiz/:id/questions allows Instructor");

    // ----------------------------------------------------
    // 4. Student Quiz Attempt Engine
    // ----------------------------------------------------
    console.log("\n--- 4. Student Quiz Attempt Engine ---");

    // Start Quiz Session
    const startAttempt = await request(`/student/quiz/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { quizId },
    });
    assert(startAttempt.status === 200 && startAttempt.data.data?.attemptId, "POST /student/quiz/start initializes session");
    const attemptId = startAttempt.data.data?.attemptId;

    // Retrieve options with IDs from student session
    const questionsForStudent = startAttempt.data.data?.quiz?.questions || [];
    const leaksAnswer = questionsForStudent.some((q) => q.options.some((opt) => opt.isCorrect !== undefined));
    assert(!leaksAnswer, "Start attempt payload sanitizes correct answer key");

    // Find correct option ID from DB question document
    const dbQ1 = await Question.findById(q1Id).select("+options.isCorrect");
    const dbQ2 = await Question.findById(q2Id).select("+options.isCorrect");

    const correctOpt1 = dbQ1.options.find((o) => o.isCorrect)?._id.toString();
    const correctOpt2 = dbQ2.options.find((o) => o.isCorrect)?._id.toString();

    // Submit Quiz Session with correct Option IDs
    const submitAttempt = await request(`/student/quiz/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        attemptId,
        answers: [
          { questionId: q1Id, selectedOptions: [correctOpt1] },
          { questionId: q2Id, selectedOptions: [correctOpt2] },
        ],
      },
    });
    assert(submitAttempt.status === 200 && submitAttempt.data.data?.scorePercentage === 100, "POST /student/quiz/submit evaluates 100% score", submitAttempt.data);

    // Fetch Attempt History
    const history = await request("/student/attempts", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(history.status === 200 && history.data.count > 0, "GET /student/attempts returns attempt history");

    // Fetch Single Attempt Details
    const attemptDetails = await request(`/student/attempts/${attemptId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(attemptDetails.status === 200 && (attemptDetails.data.data?._id || attemptDetails.data.data?.id), "GET /student/attempts/:id returns single attempt detail");

    // ----------------------------------------------------
    // 5. Dashboards & Management
    // ----------------------------------------------------
    console.log("\n--- 5. Dashboards & Management ---");

    const instDash = await request("/instructor/dashboard", {
      headers: { Authorization: `Bearer ${instToken}` },
    });
    assert(instDash.status === 200 && instDash.data.data?.metrics?.totalQuizzes === 1, "GET /instructor/dashboard returns instructor analytics", instDash.data);

    const studentDash = await request("/student/dashboard", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentDash.status === 200 && studentDash.data.data, "GET /student/dashboard returns student stats");

    const adminUsers = await request("/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200 && adminUsers.data.users?.length >= 3, "GET /users returns user list to Admin");

    const adminStats = await request("/admin/stats", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStats.status === 200 && adminStats.data.stats?.users?.total >= 3, "GET /admin/stats returns global metrics");

    console.log("\n==================================================");
    console.log(`📊 FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Test Runner Error:", err);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
