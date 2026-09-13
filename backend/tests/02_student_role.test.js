import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/server.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';

describe('🎓 Module 2: Student Role Dashboard & Quiz Attempt APIs', () => {
  let authData;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();
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
});
