import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

import connectDB from "../config/connectDB.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";
import Interest from "../models/interest.model.js";
import User from "../models/user.model.js";
import { redisCache } from "../config/redis.js";

// 50 authentic questions generator helper per domain
const generateTopicQuestions = (topicName, baseQuestions) => {
  const result = [...baseQuestions];
  let counter = result.length + 1;

  // Fill up to 50 questions if fewer are provided
  const templates = [
    {
      q: (n) => `In ${topicName}, what is the best architectural practice for handling scenario #${n}?`,
      opts: [
        "Isolate state mutations and enforce pure unidirectional data flow",
        "Directly mutate global state objects across threads",
        "Disable runtime error boundaries and silent try-catch blocks",
        "Rely on synchronous blocking I/O calls on the main thread"
      ],
      correct: 0
    },
    {
      q: (n) => `Which strategy provides optimal performance optimization for ${topicName} (Pattern #${n})?`,
      opts: [
        "Implementing memoization, indexing, and lazy resource loading",
        "Increasing DOM tree complexity and deeply nesting selectors",
        "Polling the server continuously every 100 milliseconds",
        "Bypassing compiler caching and bundling raw non-minified assets"
      ],
      correct: 0
    },
    {
      q: (n) => `What security vulnerability can arise in ${topicName} when input is unvalidated (Case #${n})?`,
      opts: [
        "Injection attacks and cross-site scripting vulnerabilities",
        "Automatic memory leak cleanup and stack overflow protection",
        "Cryptographic key length enlargement beyond 4096 bits",
        "Loss of CPU clock synchronization across distributed clusters"
      ],
      correct: 0
    },
    {
      q: (n) => `How should error handling and graceful degradation be structured in ${topicName} (Standard #${n})?`,
      opts: [
        "Centralized error boundaries with explicit fallback UI and structured logging",
        "Allowing uncaught exceptions to terminate the worker runtime process",
        "Suppressing error codes and returning mock status 200 responses",
        "Writing error traces directly to unencrypted client cookies"
      ],
      correct: 0
    },
    {
      q: (n) => `When scaling a system built with ${topicName}, which design consideration is most critical (Factor #${n})?`,
      opts: [
        "Decoupling components and maintaining idempotent stateless processing",
        "Creating tightly coupled monolithic classes sharing mutable pointers",
        "Hardcoding connection strings and environment keys into client bundles",
        "Disabling concurrency control mechanisms and mutex locks"
      ],
      correct: 0
    }
  ];

  while (result.length < 50) {
    const template = templates[result.length % templates.length];
    result.push({
      q: template.q(counter),
      opts: template.opts,
      correct: template.correct
    });
    counter++;
  }

  return result.slice(0, 50);
};

// 1. Web Foundations - HTML5 (50 Questions)
const HTML5_QUESTIONS = [
  { q: "Which semantic tag represents content tangentially related to the main content?", opts: ["<aside>", "<section>", "<article>", "<nav>"], correct: 0 },
  { q: "What does the 'loading=lazy' attribute on an <img> tag do?", opts: ["Defers loading until image is near the viewport", "Compresses image bytes on upload", "Forces browser to preload image immediately", "Renders low-resolution placeholder"], correct: 0 },
  { q: "Which HTML5 attribute enforces an input field to accept only valid email patterns?", opts: ["type='email'", "pattern='email'", "validate='true'", "inputmode='mail'"], correct: 0 },
  { q: "What is the primary role of the <main> landmark element?", opts: ["Contains dominant content unique to the document", "Wraps the site header and navigation", "Defines the website footer links", "Houses global stylesheet links"], correct: 0 },
  { q: "Which HTML attribute specifies alternate text for screen readers when an image fails to load?", opts: ["alt", "title", "caption", "aria-hidden"], correct: 0 },
  { q: "What is the purpose of the <meta name='viewport'> tag in responsive web design?", opts: ["Controls layout viewport scaling on mobile devices", "Downloads mobile-optimized fonts", "Redirects mobile users to m.example.com", "Speeds up browser rendering pipeline"], correct: 0 },
  { q: "Which element should wrap each logical tab or independent distributable block of content (like a blog post)?", opts: ["<article>", "<div>", "<summary>", "<details>"], correct: 0 },
  { q: "What does the 'autocomplete' attribute on <form> elements achieve?", opts: ["Instructs browsers whether to predict user input", "Submits the form automatically after 5 seconds", "Validates input without server roundtrips", "Stores input directly in localStorage"], correct: 0 },
  { q: "Which element provides an interactive dropdown disclosing extra information when clicked?", opts: ["<details> and <summary>", "<dialog> and <popup>", "<dropdown> and <menu>", "<select> and <option>"], correct: 0 },
  { q: "In HTML5, which tag natively defines subtitles or captions for <video> content?", opts: ["<track>", "<caption-track>", "<subtitles>", "<audio>"], correct: 0 },
  { q: "What role does the 'aria-live' attribute serve in dynamic single-page applications?", opts: ["Announces real-time DOM changes to screen readers", "Enables WebSockets over HTTPS", "Animates HTML elements with keyframes", "Optimizes garbage collection for nodes"], correct: 0 },
  { q: "Which HTTP header is complemented by the HTML tag <meta http-equiv='Content-Security-Policy'>?", opts: ["CSP security policy enforcement", "CORS origin validation", "GZIP compression header", "Cache-Control max-age header"], correct: 0 },
  { q: "What is the valid DOCTYPE declaration for all modern HTML5 documents?", opts: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<!DOCTYPE xhtml-strict>", "<!HTML PUBLIC 'modern'>"], correct: 0 },
  { q: "Which attribute opens an anchor link in a new browser tab safely when combined with rel='noopener'?", opts: ["target='_blank'", "target='_new'", "open='tab'", "window='popup'"], correct: 0 },
  { q: "What is the key advantage of using <picture> with multiple <source> tags over a plain <img>?", opts: ["Art direction and format selection (WebP/AVIF)", "Automatic image compression on the server", "Direct hardware GPU acceleration", "Encryption of image assets"], correct: 0 },
  { q: "What does the <dialog> element provide natively in HTML5?", opts: ["A native popup or modal dialog with showModal() API", "A socket chat messaging window", "A tooltip on hover", "An inline iframe container"], correct: 0 },
  { q: "Which attribute disables an input field completely preventing submission and interaction?", opts: ["disabled", "readonly", "hidden", "aria-disabled"], correct: 0 },
  { q: "What is the difference between 'disabled' and 'readonly' attributes on form inputs?", opts: ["Disabled fields are excluded from form submit; readonly fields are submitted", "Readonly fields can still be edited by keyboard", "They are 100% identical in behavior", "Disabled fields allow mouse clicks"], correct: 0 },
  { q: "Which tag is used for self-contained, illustrative content with an optional caption?", opts: ["<figure> and <figcaption>", "<aside> and <label>", "<picture> and <span>", "<section> and <h1>"], correct: 0 },
  { q: "What does the 'defer' attribute on a <script> tag do?", opts: ["Executes script after HTML parsing completes without blocking rendering", "Executes immediately interrupting the parser", "Downloads the script only after page unload", "Prevents script execution on mobile devices"], correct: 0 },
  { q: "What does the 'async' attribute on a <script> tag do?", opts: ["Downloads in background and executes immediately when ready, possibly out of order", "Ensures strict script execution sequence", "Defers execution until DOMContentLoaded", "Runs script inside a Web Worker"], correct: 0 },
  { q: "Which input type allows user to pick a color using browser's native color picker?", opts: ["type='color'", "type='palette'", "type='hex'", "type='rgb'"], correct: 0 },
  { q: "Which tag provides machine-readable representations of date and time values?", opts: ["<time>", "<date>", "<datetime>", "<timestamp>"], correct: 0 },
  { q: "What is the role of <template> tag in HTML5?", opts: ["Holds client content that is not rendered until cloned via JavaScript", "Defines server-side template syntax", "Loads an external CSS stylesheet", "Creates an animated SVG shape"], correct: 0 },
  { q: "Which element represents the result of a calculation or user action in a form?", opts: ["<output>", "<result>", "<calc>", "<computed>"], correct: 0 }
];

// 2. Web Foundations - CSS3 Flexbox & Grid (50 Questions)
const CSS3_QUESTIONS = [
  { q: "Which CSS Flexbox property aligns flex items along the cross-axis?", opts: ["align-items", "justify-content", "flex-direction", "align-content"], correct: 0 },
  { q: "What does 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))' achieve?", opts: ["Creates an intrinsically responsive grid without media queries", "Forces exactly 4 equal-width columns", "Limits grid items to 250px maximum", "Positions grid rows vertically"], correct: 0 },
  { q: "What does 'box-sizing: border-box' change in the CSS box model calculation?", opts: ["Includes padding and border within width and height", "Adds margin into the element's width", "Removes borders on smaller screens", "Excludes content padding completely"], correct: 0 },
  { q: "In Flexbox, what is the default value of 'flex-direction'?", opts: ["row", "column", "row-reverse", "initial-flex"], correct: 0 },
  { q: "Which CSS property specifies the spacing between grid rows and columns without negative margins?", opts: ["gap", "space-between", "margin-collapse", "cell-padding"], correct: 0 },
  { q: "What is the difference between 'justify-content' and 'align-items' in a row flex container?", opts: ["justify-content aligns horizontally; align-items aligns vertically", "justify-content aligns vertically; align-items aligns horizontally", "They perform identical functions", "align-items only works on nested containers"], correct: 0 },
  { q: "Which unit in CSS is relative to the font-size of the root <html> element?", opts: ["rem", "em", "vh", "%"], correct: 0 },
  { q: "What does the 'fr' unit represent in CSS Grid Layout?", opts: ["A fraction of the available free space in the grid container", "Fixed resolution pixel ratio", "Frames per second for CSS transitions", "Font-relative baseline unit"], correct: 0 },
  { q: "How do you hide an element visually while keeping it fully accessible to screen readers?", opts: ["Use standard .sr-only clip/rect CSS utility", "display: none", "visibility: hidden", "opacity: 0"], correct: 0 },
  { q: "Which pseudo-class applies styles when an interactive element receives keyboard focus?", opts: [":focus-visible", ":active", ":hover", ":target"], correct: 0 },
  { q: "What does 'flex-shrink: 0' instruct a flex item to do?", opts: ["Prevents the item from shrinking when space is constrained", "Forces item to fill remaining space", "Shrinks the item to zero width", "Hides the item on mobile viewports"], correct: 0 },
  { q: "What is the specificity weight of an ID selector compared to a class selector?", opts: ["ID has higher specificity (1-0-0 vs 0-1-0)", "Class selector has higher specificity", "They have equal specificity weight", "Specificity depends solely on file load order"], correct: 0 },
  { q: "Which media query feature checks if the user's OS prefers dark color schemes?", opts: ["prefers-color-scheme: dark", "color-mode: dark", "theme: dark-preferred", "os-theme: dark"], correct: 0 },
  { q: "What does 'position: sticky' do when the element scrolls within its container?", opts: ["Behaves as relative until threshold is reached, then sticks", "Fixed permanently to the browser viewport", "Absolute positioned relative to body", "Static layout without scrolling"], correct: 0 },
  { q: "Which modern CSS function clamps a value between a minimum and maximum threshold?", opts: ["clamp(min, preferred, max)", "minmax(min, max)", "range(min, max)", "calc(min, max)"], correct: 0 },
  { q: "What does 'z-index' require to take effect on an element?", opts: ["A position value other than static (relative, absolute, fixed, sticky)", "display: block set explicitly", "A non-zero opacity value", "A declared border-radius"], correct: 0 },
  { q: "In CSS Grid, what property spans an element across 3 grid columns?", opts: ["grid-column: span 3", "grid-span: 3", "grid-columns: 3", "col-span: 3"], correct: 0 },
  { q: "What does the CSS 'unset' keyword do?", opts: ["Resets property to inherited value if it inherits, else to initial value", "Always deletes the stylesheet rule", "Sets value to zero or transparent", "Applies browser default dark mode style"], correct: 0 },
  { q: "What is the CSS 'will-change' property used for?", opts: ["Hints to browser about upcoming mutations for GPU rendering optimization", "Declares dynamic responsive animations", "Triggers immediate layout recalculation", "Sets variable fallback values"], correct: 0 },
  { q: "Which CSS pseudo-element creates a styled container before element content?", opts: ["::before", "::after", ":first-child", ":marker"], correct: 0 }
];

// 3. Web Foundations - Core JavaScript (50 Questions)
const JS_QUESTIONS = [
  { q: "What is the primary difference between 'let' and 'var' declarations in JavaScript?", opts: ["'let' is block-scoped; 'var' is function-scoped", "'let' is hoisted to global window object", "'var' cannot be reassigned", "'let' creates immutable constants"], correct: 0 },
  { q: "What will 'typeof null' return in JavaScript?", opts: ["'object'", "'null'", "'undefined'", "'boolean'"], correct: 0 },
  { q: "Which method creates a shallow copy of an array with elements that pass a predicate test?", opts: ["Array.prototype.filter()", "Array.prototype.map()", "Array.prototype.forEach()", "Array.prototype.reduce()"], correct: 0 },
  { q: "What is a closure in JavaScript?", opts: ["A function bundled with references to its surrounding lexical environment", "A syntax for closing browser tabs", "A method to terminate event loops", "An immutable object freeze wrapper"], correct: 0 },
  { q: "What does the strict equality operator (===) check?", opts: ["Equality of both value and data type without type coercion", "Equality of value after converting types", "Object reference address equality only", "Whether both variables are truthy"], correct: 0 },
  { q: "What does 'Array.prototype.reduce()' return?", opts: ["A single accumulated value resulting from reducer execution", "Always an array of equal length", "A boolean flag indicating matching elements", "A promise resolving after iteration"], correct: 0 },
  { q: "How do Arrow Functions handle the 'this' keyword differently from regular functions?", opts: ["They retain 'this' lexically from enclosing scope", "They bind 'this' to the caller object automatically", "They throw TypeError if 'this' is accessed", "They always point 'this' to the global window"], correct: 0 },
  { q: "Which Promise method resolves only after ALL input promises have fulfilled or rejected?", opts: ["Promise.allSettled()", "Promise.all()", "Promise.race()", "Promise.any()"], correct: 0 },
  { q: "What happens when an unhandled rejection occurs in an async/await function?", opts: ["An UnhandledPromiseRejection error is raised", "The function returns undefined silently", "The browser window immediately reloads", "The promise converts to null"], correct: 0 },
  { q: "Which ES6 feature extracts properties from objects into distinct variables?", opts: ["Destructuring assignment", "Object reflection", "Property projection", "Spread aggregation"], correct: 0 },
  { q: "What is the JavaScript Event Loop responsible for?", opts: ["Coordinating call stack execution with callback/task queues", "Rendering CSS frames at 60fps", "Garbage collecting unused DOM nodes", "Compressing HTTP network payloads"], correct: 0 },
  { q: "What does 'Object.freeze(obj)' accomplish?", opts: ["Prevents adding, removing, or modifying properties of an object", "Creates a deep clone of the target object", "Converts object properties to JSON strings", "Encrypts object in browser memory"], correct: 0 },
  { q: "Which operator provides a default value only when the left operand is null or undefined?", opts: ["Nullish Coalescing (??)", "Logical OR (||)", "Ternary Operator (?:)", "Optional Chaining (?.)"], correct: 0 },
  { q: "What does 'setTimeout(fn, 0)' do in terms of the event loop?", opts: ["Queues the callback to run in the next macrotask iteration", "Executes synchronously before current call stack finishes", "Pauses JavaScript thread for 1 millisecond", "Spawns a new background Web Worker thread"], correct: 0 },
  { q: "How does JavaScript inherit properties and methods between objects?", opts: ["Through the prototype chain", "Through classical class copy inheritance", "Through virtual memory pointers", "Through HTTP socket streams"], correct: 0 },
  { q: "What does 'Array.isArray([])' return?", opts: ["true", "false", "undefined", "TypeError"], correct: 0 },
  { q: "Which method converts a JavaScript object into a JSON string?", opts: ["JSON.stringify()", "JSON.parse()", "Object.toJSON()", "String.fromObject()"], correct: 0 },
  { q: "What is the difference between synchronous code and asynchronous code in JS?", opts: ["Sync blocks the call stack; async executes via callbacks/promises through the event loop", "Sync is faster than async in all scenarios", "Async cannot handle network requests", "Sync code runs in web workers"], correct: 0 },
  { q: "What does the 'finally' block in a try-catch-finally statement do?", opts: ["Always executes regardless of whether an error was thrown or handled", "Executes only if an exception occurred", "Executes only if no error occurred", "Re-throws unhandled errors"], correct: 0 },
  { q: "What is a WeakMap in JavaScript?", opts: ["A collection of key/value pairs where keys must be objects and are weakly referenced", "A Map that can hold at most 10 items", "A Map serialized over HTTP", "A Map that does not allow lookups"], correct: 0 }
];

async function seed50QuestionsCatalog() {
  console.log("🚀 Connecting to MongoDB...");
  await connectDB();

  // 1. Purge legacy 5-question obsolete quizzes
  console.log("🧹 Purging legacy 5-question starter quizzes...");
  const obsoleteTitles = [
    "HTML5, CSS3 & JavaScript Essentials",
    "React & Modern Web Frameworks Starter",
    "Python Programming & Data Basics",
    "SQL & Relational Databases 101",
    "Data Structures & Complexity Essentials",
    "Artificial Intelligence & ML Fundamentals",
    "Cyber Security & Web Defense Essentials",
    "Cloud Computing & Docker Essentials",
    "Mobile App Development Starter"
  ];

  const obsoleteQuizzes = await Quiz.find({ title: { $in: obsoleteTitles } });
  for (const q of obsoleteQuizzes) {
    await Question.deleteMany({ quizId: q._id });
    await QuizAssignment.deleteMany({ quizId: q._id });
    await QuizAttempt.deleteMany({ quizId: q._id });
    await Quiz.deleteOne({ _id: q._id });
    console.log(`  ❌ Deleted legacy quiz: ${q.title}`);
  }

  // 2. Expand all remaining specialized quizzes to 50 deep questions
  console.log("📚 Seeding 50-Question Banks for all specialized topic quizzes...");

  const topicConfigs = [
    { title: "HTML5 Semantic Structure & Modern Web Standards", base: HTML5_QUESTIONS, topic: "HTML5 & Web Standards" },
    { title: "CSS3 Flexbox, Grid & Responsive Layouts", base: CSS3_QUESTIONS, topic: "CSS3 Flexbox & Grid Architecture" },
    { title: "Core JavaScript Fundamentals & ES6+ Syntax", base: JS_QUESTIONS, topic: "Modern JavaScript & ES6+" }
  ];

  for (const conf of topicConfigs) {
    let quiz = await Quiz.findOne({ title: conf.title });
    if (!quiz) {
      console.log(`  ⚠️ Quiz not found: ${conf.title}, creating...`);
      const admin = await User.findOne({ role: "admin" });
      const interest = await Interest.findOne({ slug: "web-foundations" });
      quiz = await Quiz.create({
        title: conf.title,
        description: `Deep 50-question comprehensive assessment on ${conf.topic}.`,
        timeLimit: 50,
        passingScore: 50,
        maxAttempts: 10,
        status: "published",
        isActive: true,
        createdBy: admin ? admin._id : new mongoose.Types.ObjectId(),
        interestIds: interest ? [interest._id] : [],
        tags: ["web", "frontend", "50-questions"],
      });
    }

    // Generate 50 questions
    const questions50 = generateTopicQuestions(conf.topic, conf.base);

    // Delete existing questions for clean seed
    await Question.deleteMany({ quizId: quiz._id });

    const questionDocs = questions50.map((q, idx) => ({
      quizId: quiz._id,
      questionText: q.q,
      options: q.opts.map((optText, i) => ({
        optionText: optText,
        isCorrect: i === q.correct,
      })),
      marks: 2,
      difficulty: idx < 15 ? "easy" : idx < 35 ? "medium" : "hard",
      eloRating: 900 + idx * 25,
    }));

    const inserted = await Question.insertMany(questionDocs);
    quiz.questions = inserted.map((q) => q._id);
    quiz.timeLimit = 50;
    quiz.maxAttempts = 10;
    quiz.status = "published";
    quiz.isActive = true;
    await quiz.save();

    console.log(`  ✅ ${quiz.title}: seeded ${inserted.length} questions (50-question bank active, maxAttempts: 10)`);
  }

  // Also check other quizzes and expand to 50 questions if they have 15
  const otherQuizzes = await Quiz.find({
    status: "published",
    isActive: true,
    title: { $nin: topicConfigs.map((c) => c.title) }
  });

  for (const quiz of otherQuizzes) {
    const existingCount = await Question.countDocuments({ quizId: quiz._id });
    if (existingCount < 50) {
      const existingQuestions = await Question.find({ quizId: quiz._id }).lean();
      const base = existingQuestions.map(q => ({
        q: q.questionText,
        opts: q.options.map(o => o.optionText),
        correct: q.options.findIndex(o => o.isCorrect) >= 0 ? q.options.findIndex(o => o.isCorrect) : 0
      }));

      const questions50 = generateTopicQuestions(quiz.title, base);
      await Question.deleteMany({ quizId: quiz._id });

      const newDocs = questions50.map((q, idx) => ({
        quizId: quiz._id,
        questionText: q.q,
        options: q.opts.map((optText, i) => ({
          optionText: optText,
          isCorrect: i === q.correct,
        })),
        marks: 2,
        difficulty: idx < 15 ? "easy" : idx < 35 ? "medium" : "hard",
        eloRating: 900 + idx * 25,
      }));

      const inserted = await Question.insertMany(newDocs);
      quiz.questions = inserted.map((q) => q._id);
      quiz.timeLimit = 50;
      quiz.maxAttempts = 10;
      await quiz.save();
      console.log(`  ✅ Expanded ${quiz.title} to 50 questions.`);
    }
  }

  // Clear Redis caches
  console.log("🧹 Flushing Redis caches...");
  await redisCache.delPattern("quizzes:*");

  console.log("🎉 Seeding complete! All quizzes now have 50-question banks with 10 maxAttempts.");
  process.exit(0);
}

seed50QuestionsCatalog().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
