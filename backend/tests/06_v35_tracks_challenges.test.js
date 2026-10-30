import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { createTestUsersAndTokens } from "./helpers/seedAuth.js";
import Interest from "../models/interest.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import Challenge from "../models/challenge.model.js";

describe("⚡ Module 6: V3.5 Skill Tracks, Progression & Live Challenges APIs", () => {
  let authData;
  let studentToken;
  let testInterest;
  let testChapter;
  let testQuiz1;
  let testQuiz2;
  let testChallenge;

  beforeAll(async () => {
    // 1. Authenticate student
    authData = await createTestUsersAndTokens();
    studentToken = authData.student.token;

    // 2. Create sample test interest
    testInterest = await Interest.findOneAndUpdate(
      { slug: "v35-test-domain" },
      {
        name: "Test Domain Track",
        slug: "v35-test-domain",
        category: "Programming",
        topicTags: ["test", "track", "v35"],
        icon: "Code",
        color: "#6366f1",
        isActive: true,
      },
      { upsert: true, returnDocument: "after" }
    );

    // 3. Create Chapter 1
    testChapter = await Chapter.findOneAndUpdate(
      { interestId: testInterest._id, orderIndex: 1 },
      {
        interestId: testInterest._id,
        title: "Test Track Chapter 1",
        description: "Chapter 1 description",
        orderIndex: 1,
        requiredPassingScore: 50,
      },
      { upsert: true, returnDocument: "after" }
    );

    // 4. Create two sequential quizzes
    testQuiz1 = await Quiz.create({
      title: "Test Quiz 1.1",
      description: "First challenge in track",
      interestIds: [testInterest._id],
      chapterId: testChapter._id,
      trackOrder: 1,
      timeLimit: 15,
      passingScore: 50,
      status: "published",
      isActive: true,
      createdBy: authData.instructor.user._id,
    });

    testQuiz2 = await Quiz.create({
      title: "Test Quiz 1.2",
      description: "Second challenge in track",
      interestIds: [testInterest._id],
      chapterId: testChapter._id,
      trackOrder: 2,
      prerequisiteQuizId: testQuiz1._id,
      timeLimit: 15,
      passingScore: 50,
      status: "published",
      isActive: true,
      createdBy: authData.instructor.user._id,
    });

    // 5. Create Live Challenge
    const now = new Date();
    testChallenge = await Challenge.create({
      title: "Sprint Cup Alpha",
      description: "Live Weekly Sprint Alpha",
      type: "weekly_sprint",
      interestId: testInterest._id,
      quizId: testQuiz1._id,
      startTime: new Date(now.getTime() - 1000 * 60 * 60), // Started 1 hour ago
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Ends in 24 hours
      isLive: true,
    });
  });

  afterAll(async () => {
    if (testInterest?._id) await Interest.findByIdAndDelete(testInterest._id);
    if (testChapter?._id) await Chapter.findByIdAndDelete(testChapter._id);
    if (testQuiz1?._id) await Quiz.findByIdAndDelete(testQuiz1._id);
    if (testQuiz2?._id) await Quiz.findByIdAndDelete(testQuiz2._id);
    if (testChallenge?._id) await Challenge.findByIdAndDelete(testChallenge._id);
  });

  it("1. GET /api/v2/student/tracks/:interestId - returns full curriculum track with unlocked first challenge", async () => {
    const res = await request(app)
      .get(`/api/v2/student/tracks/${testInterest._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.interest.name).toBe("Test Domain Track");
    expect(res.body.data.chapters.length).toBeGreaterThanOrEqual(1);

    const chapter1 = res.body.data.chapters.find((c) => c.orderIndex === 1);
    expect(chapter1).toBeDefined();
    expect(chapter1.isUnlocked).toBe(true);

    const q1 = chapter1.quizzes.find((q) => q._id.toString() === testQuiz1._id.toString());
    const q2 = chapter1.quizzes.find((q) => q._id.toString() === testQuiz2._id.toString());

    expect(q1.isUnlocked).toBe(true);
    expect(q2.isUnlocked).toBe(false); // Locked because quiz 1 not passed yet
  });

  it("2. GET /api/v2/student/tracks/next-challenge/:quizId - resolves or handles next challenge pointer", async () => {
    const res = await request(app)
      .get(`/api/v2/student/tracks/next-challenge/${testQuiz1._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("3. GET /api/v2/student/challenges - returns live and upcoming contests", async () => {
    const res = await request(app)
      .get("/api/v2/student/challenges")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const found = res.body.data.find((c) => c._id.toString() === testChallenge._id.toString());
    expect(found).toBeDefined();
    expect(found.status).toBe("active");
  });

  it("4. GET /api/v2/student/challenges/:challengeId/leaderboard - returns leaderboard structure", async () => {
    const res = await request(app)
      .get(`/api/v2/student/challenges/${testChallenge._id}/leaderboard`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.challenge.title).toBe("Sprint Cup Alpha");
    expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
  });
});
