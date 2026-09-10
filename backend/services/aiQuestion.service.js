import Groq from "groq-sdk";
import config from "../config/config.js";

/**
 * Service to generate multiple-choice quiz questions using Groq AI.
 * @param {Object} params
 * @param {string} params.topic - Subject or topic description (e.g. "React Hooks")
 * @param {number} [params.count=5] - Number of questions to generate (1 to 10)
 * @param {string} [params.difficulty="medium"] - "easy" | "medium" | "hard"
 * @param {string} [params.additionalContext] - Optional extra instructions or guidelines
 * @returns {Promise<Array>} List of formatted questions
 */
export const generateAIQuestionsService = async ({
  topic,
  count = 5,
  difficulty = "medium",
  additionalContext = "",
}) => {
  const apiKey = config.groqApiKey;

  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured in backend environment.");
    error.statusCode = 500;
    throw error;
  }

  const groq = new Groq({ apiKey });

  const numQuestions = Math.min(Math.max(parseInt(count, 10) || 5, 1), 10);
  const isMixed = !difficulty || ["mixed", "all", "any"].includes(difficulty?.toLowerCase());
  const targetDifficulty = isMixed
    ? "mixed"
    : ["easy", "medium", "hard"].includes(difficulty?.toLowerCase())
    ? difficulty.toLowerCase()
    : "medium";

  const systemPrompt = `You are an expert AI exam question generator for an online quiz platform.
Your task is to generate high-quality, factually accurate multiple choice questions (MCQs) on the given topic.

CRITICAL REQUIREMENTS:
1. STRICT TOPIC FIDELITY & REAL-WORLD ACCURACY:
   - Ensure all questions strictly pertain to the exact real-world technology or topic requested.
   - If the user input has a minor typo (e.g. "Redus Toolkit" -> "Redux Toolkit"), automatically recognize and correct it to the real technology ("Redux Toolkit") and generate authentic questions about Redux Toolkit (state management, createSlice, configureStore, createAsyncThunk, React Redux).
   - DO NOT invent fictional libraries (e.g. "Redus Toolkit for data reduction/LZ77") and DO NOT confuse it with unrelated databases or tools (e.g. Redis).
2. Output MUST be valid, raw JSON only. Do not include markdown code blocks or extra text.
3. The JSON object MUST have a top-level key "questions" containing an array of question objects.
4. Each question object MUST contain:
   - "questionText": Clear string asking the question.
   - "marks": Integer score for the question (2 for easy, 5 for medium, 10 for hard).
   - "difficulty": String ("easy", "medium", or "hard").
   - "options": An array of EXACTLY 4 option objects.
5. Each option object MUST contain:
   - "optionText": String content for the choice.
   - "isCorrect": Boolean (true or false).
6. EXACTLY ONE option per question MUST have "isCorrect": true, and the other 3 MUST have "isCorrect": false.`;

  const userPrompt = `Topic: "${topic}"
Number of questions: ${numQuestions}
Difficulty requested: ${isMixed ? "MIXED (generate a balanced mix of Easy, Medium, and Hard difficulty questions, e.g. 2 Easy, 2 Medium, 1 Hard)" : targetDifficulty}
${additionalContext ? `Additional Instructions: ${additionalContext}` : ""}

Generate ${numQuestions} multiple-choice questions now in pure JSON format.`;

  // Candidate models list in order of preference & access on Groq
  const candidateModels = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "groq/compound",
  ];

  let responseContent = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const requestOptions = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: model,
        temperature: 0.7,
        max_tokens: 3000,
      };

      // Only add json_object format for supported models if needed
      if (!model.startsWith("openai/")) {
        requestOptions.response_format = { type: "json_object" };
      }

      const completion = await groq.chat.completions.create(requestOptions);
      responseContent = completion.choices[0]?.message?.content;
      if (responseContent) break;
    } catch (err) {
      console.warn(`Groq model ${model} failed (${err.status || err.message}), trying fallback...`);
      lastError = err;
    }
  }

  if (!responseContent) {
    throw new Error(
      lastError?.message || "Failed to generate AI questions with available Groq models."
    );
  }

  let cleanedContent = responseContent.trim();
  if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  let parsed;
  try {
    parsed = JSON.parse(cleanedContent);
  } catch (err) {
    console.error("Failed to parse Groq AI response:", responseContent);
    throw new Error("AI returned malformed JSON payload. Please try again.");
  }

  const rawQuestions = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : []);

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error("No questions were generated by the AI service.");
  }

  // Difficulty sequence for mixed mode
  let mixedDifficulties = [];
  if (isMixed) {
    const easyCount = Math.max(1, Math.floor(numQuestions * 0.3));
    const hardCount = Math.max(1, Math.floor(numQuestions * 0.3));
    const mediumCount = numQuestions - easyCount - hardCount;

    mixedDifficulties = [
      ...Array(easyCount).fill("easy"),
      ...Array(mediumCount).fill("medium"),
      ...Array(hardCount).fill("hard"),
    ];

    // Shuffle difficulty order across questions
    for (let i = mixedDifficulties.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mixedDifficulties[i], mixedDifficulties[j]] = [mixedDifficulties[j], mixedDifficulties[i]];
    }
  }

  // Generate target correct option positions across the batch (ensuring t_i !== t_{i-1})
  const targetIndices = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    let candidates = [0, 1, 2, 3];
    if (i > 0) {
      candidates = candidates.filter((c) => c !== targetIndices[i - 1]);
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    targetIndices.push(chosen);
  }

  // Sanitize, validate, and place correct options at non-consecutive target indices
  const sanitizedQuestions = rawQuestions.map((q, index) => {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const questionText = String(q.questionText || q.question || `Generated Question ${index + 1}`).trim();
    const answer = String(q.answer || q.correctAnswer || "").trim().toLowerCase();

    // Extract raw option objects
    let parsedOpts = rawOptions.slice(0, 4).map((opt, optIndex) => {
      if (typeof opt === "string") {
        const text = opt.trim();
        const isMatch = answer && (text.toLowerCase() === answer || answer === String(optIndex));
        return { optionText: text, isCorrect: isMatch };
      }
      return {
        optionText: String(opt.optionText || opt.text || opt.label || "").trim(),
        isCorrect: Boolean(opt.isCorrect),
      };
    });

    // Ensure 4 options
    while (parsedOpts.length < 4) {
      parsedOpts.push({
        optionText: `Option ${parsedOpts.length + 1}`,
        isCorrect: false,
      });
    }

    // Identify correct option index or default to 0
    let correctOptIndex = parsedOpts.findIndex((o) => o.isCorrect);
    if (correctOptIndex === -1) correctOptIndex = 0;

    const correctOption = { ...parsedOpts[correctOptIndex], isCorrect: true };
    const incorrectOptions = parsedOpts
      .filter((_, i) => i !== correctOptIndex)
      .map((o) => ({ ...o, isCorrect: false }));

    // Place correct option at targetIndices[index] and incorrect options in remaining slots
    const targetIndex = targetIndices[index];
    const finalOptions = new Array(4);
    finalOptions[targetIndex] = correctOption;

    let incIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== targetIndex) {
        finalOptions[i] = incorrectOptions[incIdx++];
      }
    }

    const qDiff = isMixed
      ? mixedDifficulties[index] || "medium"
      : ["easy", "medium", "hard"].includes(q.difficulty?.toLowerCase())
      ? q.difficulty.toLowerCase()
      : targetDifficulty;

    const qMarks = qDiff === "easy" ? 2 : qDiff === "hard" ? 10 : 5;

    return {
      questionText,
      marks: qMarks,
      difficulty: qDiff,
      options: finalOptions,
    };
  });

  return sanitizedQuestions;
};

/**
 * Service to auto-summarize / generate a quiz description based on title using Groq AI.
 * @param {Object} params
 * @param {string} params.title - Title of the quiz
 * @returns {Promise<string>} Generated description string
 */
export const generateAIDescriptionService = async ({ title }) => {
  const apiKey = config.groqApiKey;

  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured in backend environment.");
    error.statusCode = 500;
    throw error;
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are an expert educational content writer for an online quiz platform.
Your task is to write a clear, professional, engaging 2-3 sentence description for a quiz based on its title.
Do NOT include quotes, headers, or conversational filler. Return ONLY the description text.`;

  const userPrompt = `Quiz Title: "${title}"
Write a professional 2-3 sentence description summarizing what students will learn and test in this quiz.`;

  const candidateModels = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "groq/compound",
  ];

  let descriptionText = "";
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: model,
        temperature: 0.7,
      });

      descriptionText = completion.choices[0]?.message?.content?.trim();
      if (descriptionText) break;
    } catch (err) {
      console.warn(`Groq description generation model ${model} failed, trying fallback...`);
      lastError = err;
    }
  }

  if (!descriptionText) {
    throw new Error(lastError?.message || "Failed to generate AI description.");
  }

  // Clean up any quotes or markdown
  const cleanedText = descriptionText.replace(/^["']|["']$/g, "").trim();
  return cleanedText;
};
