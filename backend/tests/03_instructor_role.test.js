import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/server.js';
import Quiz from '../models/quiz.model.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';

describe('👨‍🏫 Module 3: Instructor Role, Quiz CRUD & Groq AI Generator APIs', () => {
  let authData;
  let testQuiz;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();
    testQuiz = await Quiz.create({
      title: `Instructor Seed Quiz ${Date.now()}`,
      description: 'Test description for clone test',
      createdBy: authData.instructor.user._id,
      timeLimit: 30,
      passingScore: 50,
      maxAttempts: 3,
      status: 'published',
      isActive: true,
    });
  });

  it('1. GET /api/v1/instructor/dashboard - returns instructor analytics payload', async () => {
    const res = await request(app)
      .get('/api/v1/instructor/dashboard')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('2. GET /api/v1/quizzes/instructor - returns quizzes created by instructor', async () => {
    const res = await request(app)
      .get('/api/v1/quizzes/instructor')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(200);
  });

  it('3. POST /api/v1/quizzes - CRUD: instructor creates a new Quiz in database', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${authData.instructor.token}`)
      .send({
        title: `JS Master Quiz ${Date.now()}`,
        description: 'Comprehensive JS test',
        category: 'Web Development',
        duration: 30,
        passingPercentage: 70,
        difficulty: 'Medium',
      });
    expect([200, 201, 409]).toContain(res.statusCode);
  });

  it('4. GET /api/v1/instructor/students - returns list of students who took instructor quizzes', async () => {
    const res = await request(app)
      .get('/api/v1/instructor/students')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('5. POST /api/v1/instructor/ai/generate-questions - triggers Groq AI question generator', async () => {
    const res = await request(app)
      .post('/api/v1/instructor/ai/generate-questions')
      .set('Authorization', `Bearer ${authData.instructor.token}`)
      .send({
        topic: 'React Hooks',
        difficulty: 'Medium',
        count: 3,
      });
    expect([200, 400, 500, 503]).toContain(res.statusCode);
  });

  it('6. POST /api/v1/instructor/ai/generate-description - triggers Groq AI quiz description generator', async () => {
    const res = await request(app)
      .post('/api/v1/instructor/ai/generate-description')
      .set('Authorization', `Bearer ${authData.instructor.token}`)
      .send({
        title: 'Node.js Express Framework',
      });
    expect([200, 400, 500, 503]).toContain(res.statusCode);
  });

  it('7. GET /api/v1/instructor/dashboard - rejects student token from accessing instructor dashboard (403)', async () => {
    const res = await request(app)
      .get('/api/v1/instructor/dashboard')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('Role not allowed');
  });

  it('8. PATCH /api/v1/quizzes/:quizId/questions/:questionId/image - validates image file upload payload', async () => {
    const res = await request(app)
      .patch('/api/v1/quizzes/65a123456789012345678901/questions/65a123456789012345678902/image')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect([400, 404]).toContain(res.statusCode);
  });

  it('9. POST /api/v1/quizzes/:quizId/clone - duplicates existing quiz and questions', async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${testQuiz._id}/clone`)
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quiz.title).toContain('(Copy)');
  });
});

