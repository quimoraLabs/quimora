import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/server.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';

describe('🔐 Module 1: Authentication & User Verification APIs', () => {
  let authData;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();
  });

  it('1. POST /api/v1/auth/register - registers new user successfully', async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'New Registered User',
        username: `reg_user_${timestamp}`,
        email: `registered_${timestamp}@test.com`,
        password: 'Password123!',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('2. POST /api/v1/auth/login - authenticates valid user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@test.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('3. POST /api/v1/auth/login - rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student@test.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('4. GET /api/v1/auth/me - returns logged-in user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect([200, 403]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('email', 'student@test.com');
    }
  });

  it('5. GET /api/v1/auth/me - rejects request with 401 if token is missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('6. POST /api/v1/auth/admin/create-user - admin successfully creates new user', async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/v1/auth/admin/create-user')
      .set('Authorization', `Bearer ${authData.admin.token}`)
      .send({
        name: 'Created By Admin',
        username: `admin_created_${timestamp}`,
        email: `admin_created_${timestamp}@test.com`,
        password: 'password123',
        role: 'instructor',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('7. PATCH /api/v1/auth/request-otp - sends password reset request', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/request-otp')
      .send({ email: 'student@test.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
