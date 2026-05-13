import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { assertUserExists, assertQuizExists } from "../utils/assertion.utils.js";

/**
 * Initializes a secure quiz taking session for an authorized user profile.
 */
export const startQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId; // Extracted safely from your authentication middleware

    // 1. REUSE ASSERTIONS: Validate database identity states with zero-memory footprint where possible
    await assertUserExists(userId, "false");
    
    // We fetch the full quiz document here to read its question counts and attempt rule configurations
    const quiz = await assertQuizExists(quizId);

    // 2. Structural Rule Validation: Ensure the quiz is published and active
    if (quiz.status !== "published" || !quiz.isActive) {
      return res.status(400).json({ 
        error: "This quiz is currently unavailable for testing" 
      });
    }

    // 3. Attempt Capacity Validation: Enforce maximum try boundaries if configured
    if (quiz.maxAttempts && quiz.maxAttempts > 0) {
      const pastAttemptsCount = await QuizAttempt.countDocuments({
        userId,
        quizId,
        status: "completed"
      });

      if (pastAttemptsCount >= quiz.maxAttempts) {
        return res.status(403).json({
          error: `You have exhausted your maximum allotment of ${quiz.maxAttempts} attempts for this quiz`
        });
      }
    }

    // 4. Initialize the Quiz Attempt Record Document
    const totalQuestions = quiz.questions ? quiz.questions.length : 0;
    if (totalQuestions === 0) {
      return res.status(400).json({ error: "Cannot start a quiz that contains no questions" });
    }

    const newAttempt = await QuizAttempt.create({
      userId,
      quizId,
      totalQuestions,
      status: "started",
      startedAt: Date.now()
    });

    // 5. SECURITY LAYER: Hydrate clean questions for the client screen
    // We convert the Mongoose object to a plain JavaScript object to remove correct answer fields safely
    const plainQuizObject = quiz.toObject();
    
    const secureQuestions = plainQuizObject.questions.map((question) => {
      // Destructure and drop the correct answer path completely from the object mapping routine
      const { correctAnswer, ...clientSafeFields } = question;
      return clientSafeFields;
    });

    // 6. Dispatch Response Packet
    res.status(201).json({
      success: true,
      message: "Quiz session started successfully",
      attemptId: newAttempt._id,
      quiz: {
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: secureQuestions // Frontend receives text options without keys
      }
    });

  } catch (error) {
    next(error);
  }
};


/**
 * Evaluates, grades, and secures an ongoing quiz session based on object choice options.
 */
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers: userAnswers } = req.body; // Expects array of { questionId, selectedOptions }
    const userId = req.auth.userId;

    // 1. Core State Guard: Verify attempt presence and context ownership
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res.status(404).json({ error: "Active quiz attempt session not found" });
    }

    if (attempt.status !== "started") {
      return res.status(400).json({ error: "This quiz session has already been processed" });
    }

    // 2. Structural Layer Validation: Hydrate master schema record parameters
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ error: "The origin quiz for this session no longer exists" });
    }

    // 3. Time Constraints Verification Block
    const timeSpentInSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    const serverBufferInSeconds = 15;
    
    if (quiz.timeLimit && quiz.timeLimit > 0) {
      const maximumAllowedSeconds = (quiz.timeLimit * 60) + serverBufferInSeconds;
      if (timeSpentInSeconds > maximumAllowedSeconds) {
        attempt.status = "abandoned";
        await attempt.save();
        return res.status(400).json({ 
          error: "Submission rejected: The time limit allocated for this session has expired" 
        });
      }
    }

    if (!Array.isArray(userAnswers)) {
      return res.status(400).json({ error: "Malformatted payload: Answers field must be a valid array" });
    }

    // 4. ANTI-CHEAT LAYER: Map master IDs using a secure key collection lookup string
    const masterQuestionIds = new Set(quiz.questions.map((q) => q._id.toString()));

    for (const ans of userAnswers) {
      if (ans.questionId === undefined || ans.questionId === null) {
        return res.status(400).json({ error: "Malformatted payload: Each submission element requires a 'questionId'" });
      }

      const submittedIdStr = ans.questionId.toString().trim();
      if (!masterQuestionIds.has(submittedIdStr)) {
        return res.status(400).json({ 
          error: `Security Violation: Question ID '${submittedIdStr}' does not match this quiz scope` 
        });
      }
    }

    // Map user answers using O(1) optimization key mapping variables
    const userAnswersMap = new Map();
    userAnswers.forEach((ans) => {
      userAnswersMap.set(ans.questionId.toString().trim(), ans.selectedOptions);
    });

    let correctAnswersCount = 0;
    const compiledSnapshotArray = [];

    // =========================================================================
    // DYNAMIC SCHEMA OBJECT GRADING ENGINE
    // =========================================================================
    for (const masterQuestion of quiz.questions) {
      const qIdString = masterQuestion._id.toString();
      const rawUserSelection = userAnswersMap.get(qIdString);

      // Handle structural scenarios where questions are completely un-attempted or skipped
      if (rawUserSelection === undefined || rawUserSelection === null) {
        compiledSnapshotArray.push({
          questionId: masterQuestion._id,
          selectedOptions: ["-1"], // Default to skipped state indicators
          isCorrect: false,
          timeSpent: 0
        });
        continue;
      }

      // 5. CAST USER SELECTION: Standardize input payload choice value down to clean numbers
      let sanitizedIndex = Number(rawUserSelection);
      if (isNaN(sanitizedIndex) || rawUserSelection === "" || rawUserSelection === null) {
        sanitizedIndex = -1;
      }

      // 6. DYNAMIC INDEX EXTRACTION: Locate the correct answer index from your native option objects
      const masterCorrectIndex = masterQuestion.options.findIndex((opt) => opt.isCorrect === true);

      // Evaluate accuracy strictly by validating bounds and checking structural matching positions
      const isCorrect = (sanitizedIndex !== -1) && (sanitizedIndex === masterCorrectIndex);

      if (isCorrect) {
        correctAnswersCount++;
      }

      compiledSnapshotArray.push({
        questionId: masterQuestion._id,
        selectedOptions: [sanitizedIndex.toString()], 
        isCorrect,
        timeSpent: 0
      });
    }
    // =========================================================================

    // 7. Security Size Validation Bounds Verification Check
    if (userAnswersMap.size > quiz.questions.length) {
      return res.status(400).json({ error: "Security Violation: Injected properties detected inside your payload data" });
    }

    // 8. Compile and finalize aggregate metrics calculations
    const scorePercentage = (correctAnswersCount / quiz.questions.length) * 100;

    attempt.correctAnswersCount = correctAnswersCount;
    attempt.score = parseFloat(scorePercentage.toFixed(2));
    attempt.answers = compiledSnapshotArray;
    attempt.timeTaken = timeSpentInSeconds;
    attempt.status = "completed";
    attempt.completedAt = Date.now();

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz session evaluated and processed successfully",
      summary: {
        totalQuestions: quiz.questions.length,
        correctAnswersCount,
        score: attempt.score,
        timeTakenInSeconds: timeSpentInSeconds,
        status: attempt.status
      }
    });

  } catch (error) {
    next(error);
  }
};

