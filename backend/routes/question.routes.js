import express from 'express';

import authMiddleware from '../middleware/auth.middleware.js';
import { createQuestion,getAllQuestions,getQuestionById,updateQuestion } from '../controllers/question.controllers.js';
import { validateObjectId } from '../middleware/validObjectId.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/',validateObjectId('quizId'), authMiddleware, createQuestion);
router.get("/",authMiddleware,getAllQuestions)
router.get('/:questionId', validateObjectId('questionId'), authMiddleware, getQuestionById);
router.patch('/:questionId', validateObjectId('questionId'), authMiddleware, updateQuestion);
// router.delete('/:id', authMiddleware, deleteQuestion);
// router.get('/quizzes/:quizId/questions', authMiddleware, getAllQuestions);

export default router;
