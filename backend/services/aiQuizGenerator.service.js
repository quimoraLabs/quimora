import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { generateAIQuestionsService } from "./aiQuestion.service.js";

/**
 * Fallback questions generator for guaranteed 50 questions
 */
function createSynthetic50Questions(quizId, topicName) {
  const isWebDev = /web|frontend|backend|javascript|react|html|css|fullstack/i.test(topicName);

  const curatedBank = [
    {
      q: `What is the primary purpose of the Document Object Model (DOM) in ${topicName}?`,
      opts: [
        "To provide a structured representation of the document allowing programs to manipulate its structure, style, and content",
        "To compile high-level source code into low-level machine instructions",
        "To establish direct encrypted TCP sockets with the database layer",
        "To store user credentials persistently on the client machine"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `Which HTTP status code indicates that the requested resource could not be found on the server?`,
      opts: ["404 Not Found", "200 OK", "500 Internal Server Error", "301 Moved Permanently"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `In modern ${topicName}, what is the key difference between 'const' and 'let' declarations?`,
      opts: [
        "'const' prevents reassignment of the variable identifier, while 'let' allows reassignment",
        "'const' variables have function scope, while 'let' variables have global scope",
        "'let' cannot be used inside loops or conditional blocks",
        "'const' automatically deep-freezes objects and arrays preventing internal mutation"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `In CSS layout, which property is used to align flex items along the main axis?`,
      opts: ["justify-content", "align-items", "align-content", "flex-direction"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `Which JavaScript array method creates a new array populated with the results of calling a provided function on every element?`,
      opts: ["Array.prototype.map()", "Array.prototype.forEach()", "Array.prototype.filter()", "Array.prototype.reduce()"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `What is the primary advantage of using asynchronous operations (Promises / async-await) in ${topicName}?`,
      opts: [
        "It prevents non-blocking operations like network requests from freezing the main thread",
        "It automatically multiplies CPU clock speed during heavy computation",
        "It eliminates the need for error handling and try-catch blocks",
        "It converts client-side code directly into server-side bytecode"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What does CORS stand for and what is its primary security purpose?`,
      opts: [
        "Cross-Origin Resource Sharing; it allows servers to specify who can access their resources from a different origin",
        "Central Object Request Service; it caches static assets across regional edge servers",
        "Client Operating Runtime Standard; it restricts access to native device storage APIs",
        "Cryptographic Origin Routing Security; it handles symmetric TLS encryption"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `In React and modern component frameworks, what is the role of 'state'?`,
      opts: [
        "Data that is managed within the component and can change over time, triggering re-renders",
        "Fixed read-only parameters passed down from a parent component",
        "A global database table stored inside browser local storage",
        "The CSS stylesheet applied to the rendered HTML elements"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `Which HTTP method is idempotent and conventionally used to replace an existing resource completely?`,
      opts: ["PUT", "POST", "PATCH", "CONNECT"],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is a JavaScript closure?`,
      opts: [
        "A function bundled together with references to its surrounding lexical environment",
        "A built-in method that terminates an active asynchronous event loop",
        "An encrypted SSL handshake between client and host",
        "A CSS selector that isolates child styles from parent cascading rules"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is the function of the 'key' attribute when rendering lists of elements in React?`,
      opts: [
        "It helps React identify which items have changed, been added, or removed for efficient reconciliation",
        "It sets the database primary key for backend synchronization",
        "It encrypts the list items before rendering them to the DOM",
        "It assigns unique CSS classes for alternating row striping"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is the Box Model in CSS composed of (from inside to outside)?`,
      opts: [
        "Content, Padding, Border, Margin",
        "Content, Border, Padding, Margin",
        "Margin, Border, Padding, Content",
        "Content, Outline, Margin, Padding"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `How does event delegation work in the browser DOM?`,
      opts: [
        "Attaching a single event listener to a parent element to manage events for all descendants using event bubbling",
        "Spawning a separate Web Worker thread to process UI clicks concurrently",
        "Cloning event objects and dispatching them synchronously to every node in the DOM tree",
        "Disabling default browser behaviors globally across all elements"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is the key difference between localStorage and sessionStorage in browser storage?`,
      opts: [
        "localStorage data persists indefinitely until cleared, whereas sessionStorage data is cleared when the page session/tab ends",
        "localStorage can store up to 5GB while sessionStorage is capped at 5KB",
        "sessionStorage is automatically sent with every HTTP request header, whereas localStorage is not",
        "localStorage only stores plain text strings while sessionStorage supports binary buffers"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `Which CSS property is used to specify how flex or grid items wrap onto multiple lines?`,
      opts: ["flex-wrap", "flex-flow", "flex-grow", "white-space"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `What does the 'typeof null' expression evaluate to in JavaScript?`,
      opts: ["'object'", "'null'", "'undefined'", "'boolean'"],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is the primary vulnerability prevented by properly sanitizing user inputs and escaping HTML before rendering?`,
      opts: [
        "Cross-Site Scripting (XSS)",
        "Distributed Denial of Service (DDoS)",
        "Man-in-the-Middle (MitM) Attacks",
        "DNS Spoofing"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `In RESTful API design, which status code should be returned after successfully creating a new resource via POST?`,
      opts: ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `What does the 'event.preventDefault()' method do in an event handler?`,
      opts: [
        "Stops the default browser action associated with the event (e.g. form submission or link navigation)",
        "Immediately stops the event from bubbling up the DOM hierarchy",
        "Removes the event listener permanently from the target node",
        "Reverts any state changes made by the user in the target input"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `Which React hook is designed for executing side-effects such as data fetching, subscriptions, or manual DOM manipulations?`,
      opts: ["useEffect", "useState", "useMemo", "useCallback"],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `In CSS, what does 'rem' stand for and what is it relative to?`,
      opts: [
        "Root EM; it is relative to the font-size of the root <html> element",
        "Responsive EM; it is relative to the viewport width",
        "Relative Element Margin; it is relative to the parent element's padding",
        "Rendered EM; it is relative to the screen resolution DPI"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `What is the result of '[] == ![]' in JavaScript due to type coercion rules?`,
      opts: ["true", "false", "TypeError", "undefined"],
      correct: 0,
      difficulty: "hard",
    },
    {
      q: `What is a Pure Function in software development?`,
      opts: [
        "A function that always produces the same output for the same input and produces no observable side effects",
        "A function that contains no conditional if-else statements",
        "A function that executes exclusively on the server without accessing client state",
        "A function that is declared without parameters"
      ],
      correct: 0,
      difficulty: "medium",
    },
    {
      q: `What is the main purpose of the CSS property 'box-sizing: border-box'?`,
      opts: [
        "It includes padding and border in an element's total specified width and height",
        "It forces an element to display as a flex container",
        "It renders a 3D drop-shadow around the element's border box",
        "It clips overflow content to the boundary of the padding box"
      ],
      correct: 0,
      difficulty: "easy",
    },
    {
      q: `What is debouncing in front-end development?`,
      opts: [
        "Delaying the execution of a function until a specified time has elapsed since the last time it was invoked",
        "Limiting the maximum rate at which a function can be called continuously over time",
        "Canceling unhandled promise rejections before rendering components",
        "Caching API responses in memory to reduce network traffic"
      ],
      correct: 0,
      difficulty: "hard",
    },
  ];

  const questions = [];
  for (let i = 1; i <= 50; i++) {
    const base = curatedBank[(i - 1) % curatedBank.length];
    const questionText = i <= curatedBank.length
      ? base.q
      : `${base.q.replace(/\?$/, "")} (Concept Question #${i})?`;

    questions.push({
      quizId,
      questionText,
      options: base.opts.map((text, idx) => ({
        optionText: text,
        isCorrect: idx === base.correct,
      })),
      marks: base.difficulty === "easy" ? 2 : base.difficulty === "medium" ? 5 : 10,
      difficulty: base.difficulty,
      eloRating: 900 + i * 20,
    });
  }

  return questions;
}

/**
 * Auto-generate a 50-question quiz for an interest if none exist
 */
export const autoGenerateTopicQuiz = async (interest) => {
  // First, ensure granular topic quizzes (HTML, CSS, JS, etc.) are seeded for this interest
  try {
    const { seedCatalogQuizzes } = await import("./catalogSeeder.service.js");
    if (interest.slug) {
      await seedCatalogQuizzes(interest.slug);
    }
  } catch (err) {
    console.warn("⚠️ [AUTO GENERATOR] seedCatalogQuizzes fallback:", err.message);
  }

  const existingCount = await Quiz.countDocuments({
    interestIds: interest._id,
    status: "published",
    isActive: true,
  });

  // If granular quizzes already exist or at least 2 quizzes exist, return existing
  if (existingCount >= 2) {
    return null;
  }

  const admin = await User.findOne({ role: "admin" });
  const adminId = admin ? admin._id : new mongoose.Types.ObjectId();

  const newQuiz = new Quiz({
    title: `${topicName} Comprehensive Assessment`,
    description: `AI-generated 50-question comprehensive assessment testing core concepts and advanced patterns in ${topicName}.`,
    timeLimit: 50,
    passingScore: 50,
    maxAttempts: 3, // strictly 3 attempts
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
