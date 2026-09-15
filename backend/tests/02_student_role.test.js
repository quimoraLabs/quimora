import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/server.js';
import Quiz from '../models/quiz.model.js';
import Question from '../models/question.model.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';

describe('🎓 Module 2: Student Role Dashboard & Quiz Attempt APIs', () => {
  let authData;
  let testQuiz;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();

    // Create a published test quiz with 30-minute time limit for student attempt tests
    testQuiz = await Quiz.create({
      title: 'Timed Assessment Test',
      description: 'Server-validated timer test quiz',
      createdBy: authData.instructor.user._id,
      timeLimit: 30, // 30 minutes
      passingScore: 50,
      maxAttempts: 2,
      status: 'published',
      isActive: true,
    });

    await Question.create({
      quizId: testQuiz._id,
      questionText: 'What is Node.js?',
      options: [
        { optionText: 'JavaScript Runtime Environment', isCorrect: true },
        { optionText: 'Database Management Engine', isCorrect: false },
        { optionText: 'CSS Styling Framework', isCorrect: false },
        { optionText: 'Operating System Kernel', isCorrect: false },
      ],
      marks: 1,
    });
  });

  it('1. GET /api/v1/quizzes/student - returns available quizzes for authenticated student', async () => {
    const res = await request(app)
      .get('/api/v1/quizzes/student')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('2. GET /api/v1/student/dashboard - returns dashboard analytics for student', async () => {
    const res = await request(app)
      .get('/api/v1/student/dashboard')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('3. GET /api/v1/student/attempts - returns student attempt history', async () => {
    const res = await request(app)
      .get('/api/v1/student/attempts')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('4. GET /api/v1/student/dashboard - rejects request without token (401)', async () => {
    const res = await request(app).get('/api/v1/student/dashboard');
    expect(res.statusCode).toBe(401);
  });

  it('5. GET /api/v1/student/dashboard - rejects instructor token from accessing student dashboard (403)', async () => {
    const res = await request(app)
      .get('/api/v1/student/dashboard')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('Role not allowed');
  });

  it('6. GET /api/v1/student/quiz/:quizId/eligibility - checks student eligibility for timed quiz', async () => {
    const res = await request(app)
      .get(`/api/v1/student/quiz/${testQuiz._id}/eligibility`)
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('isEligible', true);
  });

  it('7. POST /api/v1/student/quiz/start - initializes session with server remainingTimeSeconds payload', async () => {
    const res = await request(app)
      .post('/api/v1/student/quiz/start')
      .set('Authorization', `Bearer ${authData.student.token}`)
      .send({ quizId: testQuiz._id });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('attemptId');
    expect(res.body.data).toHaveProperty('remainingTimeSeconds');
    expect(res.body.data.remainingTimeSeconds).toBeGreaterThan(0);
    expect(res.body.data.remainingTimeSeconds).toBeLessThanOrEqual(1800);
  });
});
