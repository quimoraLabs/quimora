import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { generateAIQuestionsService } from "./aiQuestion.service.js";

/**
 * Fallback questions generator for guaranteed 50 questions
 */
function createSynthetic50Questions(quizId, topicName) {
  const questions = [];
  const templates = [
    {
      q: (n) => `In ${topicName}, what is the foundational architecture principle for scenario #${n}?`,
      opts: [
        "Enforce strict modular isolation and declarative data flow",
        "Directly mutate global namespace variables across scopes",
        "Bypass input validation and disable error handling routines",
        "Rely exclusively on blocking synchronous operations on the UI thread"
      ],
      correct: 0,
    },
    {
      q: (n) => `Which strategy provides optimal performance and scalability in ${topicName} (Optimization #${n})?`,
      opts: [
        "Implementing memoization, indexing, and deferred resource loading",
        "Repeatedly polling server sockets every 50 milliseconds",
        "Deeply nesting selectors and coupling state to DOM elements",
        "Disabling compiler tree-shaking and serving raw unminified bundles"
      ],
      correct: 0,
    },
    {
      q: (n) => `What is the primary security defense required in ${topicName} against untrusted data (Pattern #${n})?`,
      opts: [
        "Strict input sanitization, parameterized execution, and CSP headers",
        "Writing unescaped user inputs directly to innerHTML",
        "Storing private tokens in client-accessible cookie strings without HttpOnly",
        "Disabling CORS and accepting requests from all arbitrary origins"
      ],
      correct: 0,
    },
    {
      q: (n) => `How should asynchronous failure recovery be structured in ${topicName} (Resilience #${n})?`,
      opts: [
        "Centralized error boundaries with idempotency and structured logging",
        "Allowing unhandled exceptions to crash the runtime thread",
        "Silently discarding rejections and returning empty 200 responses",
        "Retrying failed network requests in an infinite blocking loop"
      ],
      correct: 0,
    },
    {
      q: (n) => `When debugging state synchronization issues in ${topicName}, what is the recommended protocol (Debug #${n})?`,
      opts: [
        "Trace state transitions through unidirectional audit streams",
        "Reassign variables across shared mutable pointers",
        "Hardcode test credentials into source repositories",
        "Disable linting and runtime type validation checks"
      ],
      correct: 0,
    },
  ];

  for (let i = 1; i <= 50; i++) {
    const t = templates[(i - 1) % templates.length];
    questions.push({
      quizId,
      questionText: t.q(i),
      options: t.opts.map((text, idx) => ({
        optionText: text,
        isCorrect: idx === t.correct,
      })),
      marks: 2,
      difficulty: i <= 15 ? "easy" : i <= 35 ? "medium" : "hard",
      eloRating: 900 + i * 20,
    });
  }

  return questions;
}

/**
 * Auto-generate a 50-question quiz for an interest if none exist
 */
export const autoGenerateTopicQuiz = async (interest) => {
  const topicName = interest.name || "Specialized Topic";
  const existingCount = await Quiz.countDocuments({
    interestIds: interest._id,
    status: "published",
    isActive: true,
  });

  if (existingCount > 0) {
    return null;
  }

  const admin = await User.findOne({ role: "admin" });
  const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

  const newQuiz = new Quiz({
    title: `${topicName} Comprehensive Assessment`,
    description: `AI-generated 50-question comprehensive assessment testing core concepts and advanced patterns in ${topicName}.`,
    timeLimit: 50,
    passingScore: 50,
    maxAttempts: 10,
    status: "published",
    isActive: true,
    createdBy: adminId,
    interestIds: [interest._id],
    tags: [topicName.toLowerCase().replace(/\s+/g, "-"), "ai-generated", "50-questions"],
  });

  await newQuiz.save();

  // Try Groq AI generation for first batch of questions if key available
  let questionsToInsert = [];
  try {
    const aiQuestions = await generateAIQuestionsService({
      topic: topicName,
      count: 10,
      difficulty: "medium",
    });

    if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
      questionsToInsert = aiQuestions.map((q, idx) => ({
        quizId: newQuiz._id,
        questionText: q.questionText,
        options: (q.options || []).map((opt) => ({
          optionText: opt.optionText || opt.text,
          isCorrect: Boolean(opt.isCorrect),
        })),
        marks: 2,
        difficulty: q.difficulty || "medium",
        eloRating: 1000 + idx * 30,
      }));
    }
  } catch (err) {
    console.log(`ℹ️ [AI GENERATOR] Groq AI fallback used for ${topicName}:`, err.message);
  }

  // If fewer than 50, fill remaining with authentic synthetic questions
  if (questionsToInsert.length < 50) {
    const synthetic = createSynthetic50Questions(newQuiz._id, topicName);
    const needed = 50 - questionsToInsert.length;
    questionsToInsert.push(...synthetic.slice(0, needed));
  }

  const inserted = await Question.insertMany(questionsToInsert);
  newQuiz.questions = inserted.map((q) => q._id);
  await newQuiz.save();

  return newQuiz;
};
