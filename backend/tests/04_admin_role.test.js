import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../api/server.js';
import { createTestUsersAndTokens } from './helpers/seedAuth.js';
import User from '../models/user.model.js';

describe('👑 Module 4: Admin Role, Dashboard & User Management APIs', () => {
  let authData;
  let tempUserId;

  beforeAll(async () => {
    authData = await createTestUsersAndTokens();
    const tempUser = await User.create({
      name: 'Temp Toggle User',
      email: `temp_toggle_${Date.now()}@test.com`,
      username: `temp_toggle_${Date.now()}`,
      password: 'password123',
      role: 'user',
      active: true,
    });
    tempUserId = tempUser._id;
  });

  it('1. GET /api/v1/admin/stats - returns admin analytics dashboard stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${authData.admin.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('2. GET /api/v1/users - admin lists all registered users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${authData.admin.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.users || res.body.data || res.body)).toBe(true);
  });

  it('3. GET /api/v1/users/:userId - fetches user profile by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${tempUserId}`)
      .set('Authorization', `Bearer ${authData.admin.token}`);
    expect(res.statusCode).toBe(200);
  });

  it('4. PATCH /api/v1/users/:userId/active - admin toggles user active status', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${tempUserId}/active`)
      .set('Authorization', `Bearer ${authData.admin.token}`)
      .send({ active: true });
    expect(res.statusCode).toBe(200);
  });

  it('5. GET /api/v1/admin/stats - rejects student token from accessing admin dashboard (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('Role not allowed');
  });
});
