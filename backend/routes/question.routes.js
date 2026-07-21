import express from 'express';

import authMiddleware, { authorizeRoles } from '../middleware/auth.middleware.js';
import { createQuestion, deleteMultipleQuestions, deleteQuestion, getQuizQuestions, getQuestionById, updateQuestion, createBulkQuestions } from '../controllers/question.controllers.js';
import { validateObjectId } from '../middleware/validObjectId.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', validateObjectId('quizId'), authMiddleware, authorizeRoles("instructor"), createQuestion);
router.post('/bulk', validateObjectId('quizId'), authMiddleware, authorizeRoles("instructor"), createBulkQuestions);
router.get("/", authMiddleware, getQuizQuestions)
router.delete('/', authMiddleware, authorizeRoles("instructor"), deleteMultipleQuestions);
router.get('/:questionId', validateObjectId('questionId'), authMiddleware, getQuestionById);
router.patch('/:questionId', validateObjectId('questionId'), authMiddleware, authorizeRoles("instructor"), updateQuestion);
router.delete('/:questionId', validateObjectId('questionId'), authMiddleware, authorizeRoles("instructor"), deleteQuestion);

// router.delete('/:id', authMiddleware, deleteQuestion);
// router.get('/quizzes/:quizId/questions', authMiddleware, getQuizQuestions);

export default router;
