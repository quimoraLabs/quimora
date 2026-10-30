import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createTestUsersAndTokens } from "./helpers/seedAuth.js";
import Interest from "../models/interest.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import PracticeProfile from "../models/practiceProfile.model.js";

describe("⚡ Module 7: Decoupled Practice Engine & Daily Midnight Reset APIs", () => {
  let authData;
  let studentToken;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();
    studentToken = authData.student.token;

    // Reset student practice profile for clean test isolation
    await PracticeProfile.deleteOne({ userId: authData.student.user._id });

    // Seed sample quiz with questions for practice drills
    const testInterest = await Interest.findOneAndUpdate(
      { slug: "practice-test-topic" },
      {
        name: "Practice Test Topic",
        slug: "practice-test-topic",
        category: "Testing",
        topicTags: ["practice-drill", "state-management"],
        isActive: true,
      },
      { upsert: true, returnDocument: "after" }
    );

    const quiz = await Quiz.create({
      title: "Practice Engine Seed Quiz",
      description: "Dedicated to practice testing",
      interestIds: [testInterest._id],
      tags: ["practice-drill", "state-management"],
      createdBy: authData.instructor.user._id,
      status: "published",
      isActive: true,
      timeLimit: 15,
    });

    for (let i = 1; i <= 6; i++) {
      await Question.create({
        quizId: quiz._id,
        questionText: `Practice Question ${i} for drill?`,
        options: [
          { optionText: `Correct Option ${i}`, isCorrect: true },
          { optionText: `Wrong Option ${i}A`, isCorrect: false },
          { optionText: `Wrong Option ${i}B`, isCorrect: false },
          { optionText: `Wrong Option ${i}C`, isCorrect: false },
        ],
        explanation: `Explanation for practice question ${i}`,
      });
    }
  });

  it("1. GET /api/v2/practice/status - returns initialized profile and readiness info", async () => {
    const res = await request(app)
      .get("/api/v2/practice/status")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mode1_randomMindGame).toBeDefined();
    expect(res.body.data.mode2_customPractice).toBeDefined();
    expect(res.body.data.profile.practiceLevel).toBeGreaterThanOrEqual(1);
    expect(res.body.data.readiness).toBeDefined();
  });

  it("2. POST /api/v2/practice/custom-target - sets today's commitment target (1 to 4)", async () => {
    const res = await request(app)
      .post("/api/v2/practice/custom-target")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ target: 3 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dailyTarget).toBe(3);
  });

  it("3. POST /api/v2/practice/mode2/start - starts 10-minute custom drill", async () => {
    const res = await request(app)
      .post("/api/v2/practice/mode2/start")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ scopeType: "topic", targetName: "practice-drill" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeLimitMinutes).toBe(10);
    expect(res.body.data.questions.length).toBeGreaterThanOrEqual(1);

    // Verify option isCorrect is hidden
    expect(res.body.data.questions[0].options[0].isCorrect).toBeUndefined();
  });

  it("4. POST /api/v2/practice/submit - evaluates session and awards practice XP", async () => {
    // Start session first
    const startRes = await request(app)
      .post("/api/v2/practice/mode2/start")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ scopeType: "topic", targetName: "practice-drill" });

    const sessionId = startRes.body.data.sessionId;

    const submitRes = await request(app)
      .post("/api/v2/practice/submit")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        sessionId,
        answers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
        timeSpentSeconds: 120,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.xpEarned).toBeGreaterThan(0);
    expect(submitRes.body.data.feedback.length).toBeGreaterThan(0);
  });

  it("5. POST /api/v2/practice/mode1/start - starts Mode 1 Random Mind-Game", async () => {
    const res = await request(app)
      .post("/api/v2/practice/mode1/start")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mode).toBe("random_mind_game");
    expect(res.body.data.questions.length).toBeGreaterThanOrEqual(5);
  });
});
