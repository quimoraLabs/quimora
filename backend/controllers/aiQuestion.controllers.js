import { generateAIQuestionsService } from "../services/aiQuestion.service.js";

/**
 * Controller to generate multiple-choice questions via Groq AI
 * @route POST /api/v1/instructor/ai/generate-questions
 * @access Private (Instructor)
 */
export const generateAIQuestions = async (req, res, next) => {
  try {
    const { topic, count = 5, difficulty = "medium", additionalContext = "" } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic is required and must be a non-empty text string.",
      });
    }

    const questions = await generateAIQuestionsService({
      topic: topic.trim(),
      count: parseInt(count, 10) || 5,
      difficulty,
      additionalContext: additionalContext?.trim() || "",
    });

    res.status(200).json({
      success: true,
      message: `${questions.length} AI question(s) generated successfully`,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};
