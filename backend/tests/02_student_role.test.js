import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Quiz from '../models/quiz.model.js';
import Question from '../models/question.model.js';
import Interest from '../models/interest.model.js';
import StudentProfile from '../models/studentProfile.model.js';
import { redisCache } from '../config/redis.js';
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

  it('1. GET /api/v2/quizzes/student - returns available quizzes for authenticated student', async () => {
    const res = await request(app)
      .get('/api/v2/quizzes/student')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('2. GET /api/v2/student/dashboard - returns dashboard analytics for student', async () => {
    const res = await request(app)
      .get('/api/v2/student/dashboard')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('3. GET /api/v2/student/attempts - returns student attempt history', async () => {
    const res = await request(app)
      .get('/api/v2/student/attempts')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('4. GET /api/v2/student/dashboard - rejects request without token (401)', async () => {
    const res = await request(app).get('/api/v2/student/dashboard');
    expect(res.statusCode).toBe(401);
  });

  it('5. GET /api/v2/student/dashboard - rejects instructor token from accessing student dashboard (403)', async () => {
    const res = await request(app)
      .get('/api/v2/student/dashboard')
      .set('Authorization', `Bearer ${authData.instructor.token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('Role not allowed');
  });

  it('6. GET /api/v2/student/quiz/:quizId/eligibility - checks student eligibility for timed quiz', async () => {
    const res = await request(app)
      .get(`/api/v2/student/quiz/${testQuiz._id}/eligibility`)
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('isEligible', true);
  });

  it('7. POST /api/v2/student/quiz/start - initializes session with server remainingTimeSeconds payload', async () => {
    const res = await request(app)
      .post('/api/v2/student/quiz/start')
      .set('Authorization', `Bearer ${authData.student.token}`)
      .send({ quizId: testQuiz._id });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('attemptId');
    expect(res.body.data).toHaveProperty('remainingTimeSeconds');
    expect(res.body.data.remainingTimeSeconds).toBeGreaterThan(0);
    expect(res.body.data.remainingTimeSeconds).toBeLessThanOrEqual(1800);
  });

  it('8. GET /api/v2/interests - returns all active interest topics', async () => {
    const res = await request(app).get('/api/v2/interests');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('9. GET /api/v2/interests/student/profile - returns student profile with elo ratings', async () => {
    const res = await request(app)
      .get('/api/v2/interests/student/profile')
      .set('Authorization', `Bearer ${authData.student.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('profile');
    expect(res.body.data).toHaveProperty('eloRatings');
  });

  it('10. GET /api/v1/student/quizzes - strictly filters quizzes by student profile interests', async () => {
    // Find or create Python and Web interests
    let pythonInterest = await Interest.findOne({ slug: 'data-science' });
    if (!pythonInterest) {
      pythonInterest = await Interest.create({
        name: 'Python Track Test',
        slug: 'data-science',
        topicTags: ['python', 'pandas'],
        isCore: true,
      });
    }

    let webInterest = await Interest.findOne({ slug: 'web-foundations' });
    if (!webInterest) {
      webInterest = await Interest.create({
        name: 'Web Track Test',
        slug: 'web-foundations',
        topicTags: ['html', 'css'],
        isCore: true,
      });
    }

    // Create quizzes for each interest
    const pythonQuiz = await Quiz.create({
      title: 'Python Essentials Beginner Course',
      description: 'Core python test',
      createdBy: authData.instructor.user._id,
      interestIds: [pythonInterest._id],
      level: 'Beginner',
      tags: ['python'],
      status: 'published',
      isActive: true,
      maxAttempts: 3,
    });

    const webQuiz = await Quiz.create({
      title: 'Web Foundations HTML Special',
      description: 'HTML foundations test',
      createdBy: authData.instructor.user._id,
      interestIds: [webInterest._id],
      level: 'Beginner',
      tags: ['html'],
      status: 'published',
      isActive: true,
      maxAttempts: 3,
    });

    // Update student's profile to only have Python interest
    await StudentProfile.findOneAndUpdate(
      { userId: authData.student.user._id },
      { interests: [pythonInterest._id] }
    );

    // Clear cache to simulate fresh interest change
    await redisCache.delPattern("quizzes:student:*");

    // Call GET /api/v1/student/quizzes
    const res = await request(app)
      .get('/api/v1/student/quizzes')
      .set('Authorization', `Bearer ${authData.student.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    const returnedQuizTitles = res.body.data.map((q) => q.title);
    expect(returnedQuizTitles).toContain('Python Essentials Beginner Course');
    // Web quiz must NOT leak into Python student's catalog
    expect(returnedQuizTitles).not.toContain('Web Foundations HTML Special');
  });

  it('11. GET /api/v1/student/quizzes?interestId=... - strictly filters to requested interest', async () => {
    const pythonInterest = await Interest.findOne({ slug: 'data-science' });
    const res = await request(app)
      .get(`/api/v1/student/quizzes?interestId=${pythonInterest._id}`)
      .set('Authorization', `Bearer ${authData.student.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((q) => {
      expect(q).toHaveProperty('level');
      const hasMatch = q.interestIds.some(
        (id) => (id._id || id).toString() === pythonInterest._id.toString()
      );
      expect(hasMatch).toBe(true);
    });
  });
});

