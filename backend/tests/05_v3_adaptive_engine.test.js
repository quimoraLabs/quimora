import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Quiz from '../models/quiz.model.js';
import Level from '../models/level.model.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';

describe('⚡ Module 5: V3 Adaptive Engine, Level Tiers & Quiz Assignment APIs', () => {
  let authData;
  let testQuiz;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();

    // Ensure 6 levels exist in test db
    const levelsCount = await Level.countDocuments();
    if (levelsCount === 0) {
      await Level.create([
        { levelName: 'Beginner', minElo: 0, maxElo: 999 },
        { levelName: 'Learner', minElo: 1000, maxElo: 1199 },
        { levelName: 'Intermediate', minElo: 1200, maxElo: 1399 },
        { levelName: 'Advanced', minElo: 1400, maxElo: 1599 },
        { levelName: 'Master', minElo: 1600, maxElo: 1799 },
        { levelName: 'Expert', minElo: 1800, maxElo: 3000 },
      ]);
    }

    // Create a test quiz authored by instructor
    testQuiz = await Quiz.create({
      title: 'V3 Adaptive Calibration Assessment',
      description: 'Testing Elo calibration, level assignment and consent',
      createdBy: authData.instructor.user._id,
      timeLimit: 25,
      passingScore: 50,
      status: 'published',
      isActive: true,
    });
  });

  it('1. GET /api/v2/levels - returns all 6 canonical level tiers', async () => {
    const res = await request(app).get('/api/v2/levels');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
  });

  it('2. GET /api/v2/levels/current-tier - calculates correct tier for Beginner (850)', async () => {
    const res = await request(app).get('/api/v2/levels/current-tier?elo=850');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.tier).toBe('Beginner');
  });

  it('3. GET /api/v2/levels/current-tier - calculates correct tier for Advanced (1450)', async () => {
    const res = await request(app).get('/api/v2/levels/current-tier?elo=1450');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.tier).toBe('Advanced');
  });

  it('4. GET /api/v2/levels/current-tier - calculates correct tier for Expert (1900)', async () => {
    const res = await request(app).get('/api/v2/levels/current-tier?elo=1900');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.tier).toBe('Expert');
  });

  it('5. POST /api/v2/instructor/quizzes/:quizId/assign - assigns quiz to instructor', async () => {
    const res = await request(app)
      .post(`/api/v2/instructor/quizzes/${testQuiz._id}/assign`)
      .set('Authorization', `Bearer ${authData.instructor.token}`)
      .send({
        instructorId: authData.instructor.user._id,
        role: 'primary',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('role', 'primary');
  });

  it('6. GET /api/v2/instructor/quizzes/assigned - lists quizzes assigned to instructor', async () => {
    const res = await request(app)
      .get('/api/v2/instructor/quizzes/assigned')
      .set('Authorization', `Bearer ${authData.instructor.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('7. GET /api/v2/quizzes/:quizId/assigned-instructor - returns instructor profile for students', async () => {
    const res = await request(app)
      .get(`/api/v2/quizzes/${testQuiz._id}/assigned-instructor`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', authData.instructor.user.name);
    expect(res.body.data).toHaveProperty('isVerified', true);
  });

  it('8. POST /api/v2/student/quiz/:quizId/consent - records pre-quiz student telemetry consent', async () => {
    const res = await request(app)
      .post(`/api/v2/student/quiz/${testQuiz._id}/consent`)
      .set('Authorization', `Bearer ${authData.student.token}`)
      .send({ consented: true });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('consentGiven', true);
  });

  it('9. POST /api/v2/instructor/ai/generate-questions - supports Elo targetTier calibration', async () => {
    const res = await request(app)
      .post('/api/v2/instructor/ai/generate-questions')
      .set('Authorization', `Bearer ${authData.instructor.token}`)
      .send({
        topic: 'Node.js Event Loop',
        count: 2,
        difficulty: 'medium',
        targetTier: 'Advanced',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});
