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
/**
 * Service to generate multiple-choice quiz questions using Groq AI.
 * Supports Elo-aware adaptive question calibration for targeted student skill tiers.
 * @param {Object} params
 * @param {string} params.topic - Subject or topic description (e.g. "React Hooks")
 * @param {number} [params.count=5] - Number of questions to generate (1 to 10)
 * @param {string} [params.difficulty="medium"] - "easy" | "medium" | "hard" | "mixed"
 * @param {string} [params.additionalContext] - Optional extra instructions or guidelines
 * @param {string} [params.targetTier] - "Beginner" | "Learner" | "Intermediate" | "Advanced" | "Master" | "Expert"
 * @param {number} [params.targetElo] - Exact target Elo score (e.g. 1450)
 * @returns {Promise<Array>} List of formatted questions
 */
export const generateAIQuestionsService = async ({
  topic,
  count = 5,
  difficulty = "medium",
  additionalContext = "",
  targetTier = "",
  targetElo = null,
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

  // Tier-specific pedagogical calibration guidelines
  const TIER_CALIBRATIONS = {
    Beginner: "Calibrated for Beginner tier (Elo 0-999): Focus strictly on foundational terms, core syntax, definitions, and direct recall. Avoid multi-step reasoning.",
    Learner: "Calibrated for Learner tier (Elo 1000-1199): Focus on standard usage patterns, basic error resolution, and common real-world language/framework APIs.",
    Intermediate: "Calibrated for Intermediate tier (Elo 1200-1399): Focus on edge cases, idiomatic code, efficiency considerations, and standard design patterns.",
    Advanced: "Calibrated for Advanced tier (Elo 1400-1599): Focus on architectural trade-offs, concurrency/race conditions, system internals, and performance profiling.",
    Master: "Calibrated for Master tier (Elo 1600-1799): Focus on complex production failure modes, memory leak debugging, subtle runtime mechanics, and distributed resilience.",
    Expert: "Calibrated for Expert tier (Elo 1800+): Focus on low-level runtime engine internals, compiler optimizations, esoteric specification details, and maximum scale trade-offs.",
  };

  const selectedTierGuidance = targetTier && TIER_CALIBRATIONS[targetTier]
    ? TIER_CALIBRATIONS[targetTier]
    : targetElo !== null
    ? `Target student Elo rating is ${targetElo}. Calibrate question difficulty and nuances to precisely assess this skill band.`
    : "";

  const systemPrompt = `You are an expert pedagogical exam question creator for an educational quiz platform.
Your task is to generate high-quality, authentic, standard, and student-friendly multiple choice questions (MCQs) for students on the given topic.

CRITICAL QUALITY GUIDELINES:
1. STUDENT-FRIENDLY & PRACTICAL:
   - Formulate clear, concise, standard questions that test real understanding, practical syntax, common patterns, and problem-solving.
   - AVOID pseudo-academic robotic jargon (e.g. NEVER ask generic template questions like "what is the foundational architecture principle for scenario #14").
   - Focus on actual language/framework constructs, methods, keywords, behavior, and standard conventions (e.g. for Web Development: HTML5 tags, CSS box model/flexbox, JavaScript async/await, DOM APIs, HTTP status codes, React components/state).
2. REALISTIC & PLAUSIBLE OPTIONS:
   - Provide 4 distinct, clear choices per question.
   - The correct answer must be unambiguously accurate according to official documentation.
   - The 3 distractors (wrong answers) must be realistic common student misconceptions or closely related methods/properties, NOT silly or bizarre gibberish.
3. TOPIC ACCURACY:
   - All questions must strictly pertain to the requested topic.
   - If there is a minor typo in the topic, intelligently interpret the real technology or subject.
4. CALIBRATION & DIFFICULTY:
   - Easy: Direct knowledge recall, common definitions, core syntax, standard built-ins.
   - Medium: Practical problem-solving, code snippets, determining output, common API usage.
   - Hard: Subtle edge cases, asynchronous timing, performance implications, architecture patterns.
   ${selectedTierGuidance ? `\nTIER GUIDANCE: ${selectedTierGuidance}` : ""}
5. Output MUST be valid, raw JSON only without markdown formatting.
6. The JSON object MUST have a top-level key "questions" containing an array of question objects.
7. Each question object MUST contain:
   - "questionText": Clear, natural question text.
   - "marks": 2 for easy, 5 for medium, 10 for hard.
   - "difficulty": "easy", "medium", or "hard".
   - "options": EXACTLY 4 option objects, each with "optionText" (string) and "isCorrect" (boolean).
   - EXACTLY ONE option MUST have "isCorrect": true, and the other 3 MUST have "isCorrect": false.`;

  const userPrompt = `Topic: "${topic}"
Number of questions: ${numQuestions}
Difficulty requested: ${isMixed ? "MIXED (generate a balanced mix of Easy, Medium, and Hard difficulty questions, e.g. 2 Easy, 2 Medium, 1 Hard)" : targetDifficulty}
${targetTier ? `Adaptive Skill Tier Target: ${targetTier}` : ""}
${targetElo ? `Target Student Elo: ${targetElo}` : ""}
${additionalContext ? `Additional Instructions: ${additionalContext}` : ""}

Generate ${numQuestions} multiple-choice questions now in pure JSON format.`;

  // Candidate models list in order of preference & access on Groq
  const candidateModels = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
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
        temperature: 0.6,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      };

      const completion = await groq.chat.completions.create(requestOptions);
      responseContent = completion.choices[0]?.message?.content;
      if (responseContent) break;
    } catch (err) {
      console.warn(`Groq model ${model} failed (${err.status || err.message}), trying fallback...`);
      lastError = err;
    }
  }

  if (!responseContent) {
    console.warn("All Groq models failed or offline. Generating high-quality pedagogical fallback questions for:", topic);
    return generatePedagogicalFallbackQuestions({
      topic,
      numQuestions,
      targetDifficulty,
      isMixed,
      mixedDifficulties,
      targetTier,
    });
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
      ...(targetTier ? { targetTier } : {}),
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
    return `An interactive educational quiz designed to assess and reinforce student knowledge on ${title}.`;
  }

  // Clean up any quotes or markdown
  const cleanedText = descriptionText.replace(/^["']|["']$/g, "").trim();
  return cleanedText;
};

/**
 * High-quality pedagogical fallback question generator when Groq is temporarily offline.
 * Strictly adheres to student-friendly, practical MCQs without robotic scenario templates.
 */
function generatePedagogicalFallbackQuestions({
  topic,
  numQuestions,
  targetDifficulty,
  isMixed,
  mixedDifficulties,
  targetTier,
}) {
  const t = topic.toLowerCase();
  const pool = [];

  if (t.includes("node") || t.includes("event loop")) {
    pool.push(
      {
        questionText: "In the Node.js event loop, which phase executes callbacks scheduled by setImmediate()?",
        difficulty: "medium",
        marks: 5,
        options: [
          { optionText: "Check phase", isCorrect: true },
          { optionText: "Timers phase", isCorrect: false },
          { optionText: "Poll phase", isCorrect: false },
          { optionText: "Close callbacks phase", isCorrect: false },
        ],
      },
      {
        questionText: "What takes precedence in the Node.js microtask queue during event loop execution?",
        difficulty: "hard",
        marks: 10,
        options: [
          { optionText: "process.nextTick() callbacks before Promise resolution callbacks", isCorrect: true },
          { optionText: "Promise resolution callbacks before process.nextTick()", isCorrect: false },
          { optionText: "fs.readFile I/O callbacks", isCorrect: false },
          { optionText: "setTimeout(..., 0) callbacks", isCorrect: false },
        ],
      },
      {
        questionText: "Which core Node.js module handles asynchronous file system operations?",
        difficulty: "easy",
        marks: 2,
        options: [
          { optionText: "fs (or fs/promises)", isCorrect: true },
          { optionText: "http", isCorrect: false },
          { optionText: "stream", isCorrect: false },
          { optionText: "path", isCorrect: false },
        ],
      },
      {
        questionText: "Which thread pool library does Node.js rely on under the hood for asynchronous I/O and crypto operations?",
        difficulty: "medium",
        marks: 5,
        options: [
          { optionText: "libuv", isCorrect: true },
          { optionText: "V8 Engine", isCorrect: false },
          { optionText: "Chromium Core", isCorrect: false },
          { optionText: "OpenSSL Thread Manager", isCorrect: false },
        ],
      }
    );
  } else if (t.includes("react")) {
    pool.push(
      {
        questionText: "In React, what hook is used to perform side effects such as data fetching or subscriptions?",
        difficulty: "easy",
        marks: 2,
        options: [
          { optionText: "useEffect", isCorrect: true },
          { optionText: "useMemo", isCorrect: false },
          { optionText: "useCallback", isCorrect: false },
          { optionText: "useRef", isCorrect: false },
        ],
      },
      {
        questionText: "Why should state updates never be mutated directly in React components?",
        difficulty: "medium",
        marks: 5,
        options: [
          { optionText: "React relies on shallow object equality to trigger re-renders and calculate virtual DOM diffs", isCorrect: true },
          { optionText: "Direct mutations throw a runtime TypeError in strict mode", isCorrect: false },
          { optionText: "Mutating state causes synchronous blocking of the browser main thread", isCorrect: false },
          { optionText: "State properties are strictly frozen using Object.freeze()", isCorrect: false },
        ],
      },
      {
        questionText: "What is the primary benefit of React.memo in component optimization?",
        difficulty: "medium",
        marks: 5,
        options: [
          { optionText: "It skips re-rendering a component if its incoming props have not changed", isCorrect: true },
          { optionText: "It caches API response payloads across page transitions", isCorrect: false },
          { optionText: "It automatically memoizes all function definitions inside the component", isCorrect: false },
          { optionText: "It enables concurrent rendering for all child components", isCorrect: false },
        ],
      }
    );
  }

  // Generic computer science / web development questions for any other topics
  const defaultBank = [
    {
      questionText: `In ${topic}, what is the fundamental purpose of adhering to standard modular design patterns?`,
      difficulty: "easy",
      marks: 2,
      options: [
        { optionText: "To increase maintainability, reusability, and separation of concerns", isCorrect: true },
        { optionText: "To eliminate all runtime memory allocations", isCorrect: false },
        { optionText: "To enforce single-threaded execution across systems", isCorrect: false },
        { optionText: "To bypass HTTP network latency", isCorrect: false },
      ],
    },
    {
      questionText: `When building applications in ${topic}, what is the best practice for handling asynchronous errors?`,
      difficulty: "medium",
      marks: 5,
      options: [
        { optionText: "Use try/catch blocks with async/await and centralize error logging/handling", isCorrect: true },
        { optionText: "Silently suppress errors to prevent crashes in production", isCorrect: false },
        { optionText: "Restart the application server on every thrown exception", isCorrect: false },
        { optionText: "Only catch errors on the client interface layer", isCorrect: false },
      ],
    },
    {
      questionText: `Which HTTP status code accurately signals that a resource was successfully created on the server?`,
      difficulty: "easy",
      marks: 2,
      options: [
        { optionText: "201 Created", isCorrect: true },
        { optionText: "200 OK", isCorrect: false },
        { optionText: "204 No Content", isCorrect: false },
        { optionText: "301 Moved Permanently", isCorrect: false },
      ],
    },
    {
      questionText: `What is the key advantage of using parameterized database queries in backend engineering?`,
      difficulty: "medium",
      marks: 5,
      options: [
        { optionText: "Preventing SQL/NoSQL injection vulnerabilities", isCorrect: true },
        { optionText: "Compressing network traffic over TCP sockets", isCorrect: false },
        { optionText: "Enabling multi-threaded transaction replication", isCorrect: false },
        { optionText: "Bypassing database index lookups for faster retrieval", isCorrect: false },
      ],
    },
    {
      questionText: `In modern software architecture, what does idempotent operation mean in an API contract?`,
      difficulty: "hard",
      marks: 10,
      options: [
        { optionText: "Making multiple identical requests produces the exact same server state as a single request", isCorrect: true },
        { optionText: "The operation executes in zero milliseconds without touching memory", isCorrect: false },
        { optionText: "Requests are executed strictly in parallel across worker processes", isCorrect: false },
        { optionText: "The API endpoint does not require user authentication credentials", isCorrect: false },
      ],
    },
  ];

  const fullPool = [...pool, ...defaultBank];
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    const base = fullPool[i % fullPool.length];
    const diff = isMixed ? (mixedDifficulties[i] || "medium") : targetDifficulty;
    const marks = diff === "easy" ? 2 : diff === "hard" ? 10 : 5;

    questions.push({
      questionText: base.questionText,
      difficulty: diff,
      marks: marks,
      options: [...base.options],
      ...(targetTier ? { targetTier } : {}),
    });
  }

  return questions;
}

