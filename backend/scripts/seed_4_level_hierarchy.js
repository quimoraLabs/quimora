import mongoose from "mongoose";
import dotenv from "dotenv";
import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

/**
 * Standard E-Learning (Udemy/Coursera style) Curriculum Blueprint:
 * - Each Course has 5-6 Chapters.
 * - Each Chapter has exactly 2-3 Regular Quizzes (Lessons) following difficulty progression:
 *   - If 3 quizzes: [Basic] -> [Intermediate] -> [Advanced]
 *   - If 2 quizzes: [Basic] -> [Advanced/Practical]
 * - Every Quiz has EXACTLY 10 Questions.
 * - Every Chapter also has 1 optional "Bonus Assignment Quiz" (tricky/harder, extra XP, does not block progress).
 */
const CURRICULUM_BLUEPRINT = [
  {
    domain: {
      name: "Web Development",
      description: "Frontend, backend, modern frameworks, APIs, and scalable web architectures.",
    },
    courses: [
      {
        title: "Frontend Foundations",
        description: "Comprehensive modern UI development: HTML5 semantic architecture, CSS3 Grid/Flexbox, and responsive standards.",
        chapters: [
          {
            title: "HTML5 Semantic Architecture & Standards",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "HTML5 Semantic Elements & Document Hierarchy", level: "Beginner", difficulty: "easy" },
              { title: "HTML5 Forms, Validation & Modern Media APIs", level: "Intermediate", difficulty: "medium" },
              { title: "Web Accessibility (ARIA) & SEO Microdata", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: High-Fidelity Semantic Architecture Audit", level: "Master", difficulty: "hard" },
          },
          {
            title: "CSS3 Box Model, Cascade & Selectors",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "CSS Box Model, Specificity & Cascade Rules", level: "Beginner", difficulty: "easy" },
              { title: "Complex CSS Selectors, Pseudo-classes & Units", level: "Intermediate", difficulty: "medium" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Critical CSS Performance & Rendering Pipeline", level: "Master", difficulty: "hard" },
          },
          {
            title: "Modern CSS3 Flexbox Mastery",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Flex Container & Flex Item Direction Fundamentals", level: "Beginner", difficulty: "easy" },
              { title: "Flex Alignment, Growing, Shrinking & Space Allocation", level: "Intermediate", difficulty: "medium" },
              { title: "Advanced Flexbox Responsive Layout Implementations", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Zero-Media-Query Fluid Flexbox Layouts", level: "Master", difficulty: "hard" },
          },
          {
            title: "CSS Grid Specification & 2D Layouts",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "CSS Grid Lines, Tracks & Fractional Units (fr)", level: "Beginner", difficulty: "easy" },
              { title: "Grid Template Areas, Auto-Placement & MinMax", level: "Intermediate", difficulty: "medium" },
              { title: "Nested Grids, Subgrid & Complex Dashboard Layouts", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Highly Adaptive Subgrid Data-Dense UI", level: "Master", difficulty: "hard" },
          },
          {
            title: "Responsive Web Design & Mobile-First Patterns",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Fluid Viewports, Media Queries & Breakpoints", level: "Beginner", difficulty: "easy" },
              { title: "Adaptive Typography, Clamping & Container Queries", level: "Intermediate", difficulty: "medium" },
              { title: "Touch Gestures, Viewport Units & High-DPI Optimization", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Cross-Device Pixel-Perfect CSS Architectural Audit", level: "Master", difficulty: "hard" },
          },
        ],
      },
      {
        title: "JavaScript & Modern Frameworks",
        description: "Deep dive into JavaScript engine internals, ES6+ features, React component architecture, and Node.js microservices.",
        chapters: [
          {
            title: "JavaScript Core Runtime & Memory Management",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Primitive Types, Variables & Memory Stack vs Heap", level: "Beginner", difficulty: "easy" },
              { title: "Closures, Lexical Scope & Prototype Chain", level: "Intermediate", difficulty: "medium" },
              { title: "Event Loop, Call Stack & Microtask Queue Mechanics", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Memory Leak Profiling in V8 Engines", level: "Master", difficulty: "hard" },
          },
          {
            title: "Modern ES6+ Syntax & Asynchronous JavaScript",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Destructuring, Spread, Rest & Template Literals", level: "Beginner", difficulty: "easy" },
              { title: "Promises, Async/Await & Parallel Flow Control", level: "Intermediate", difficulty: "medium" },
              { title: "Iterators, Generators & Advanced Metaprogramming", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Custom Observable Pipeline & Concurrency Limiter", level: "Master", difficulty: "hard" },
          },
          {
            title: "DOM Manipulation & Browser Events",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "DOM Tree Traversal, Node Mutation & Selectors", level: "Beginner", difficulty: "easy" },
              { title: "Event Bubbling, Capturing & Delegation Systems", level: "Intermediate", difficulty: "medium" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Zero-Framework Virtual DOM Reconciliation Engine", level: "Master", difficulty: "hard" },
          },
          {
            title: "React Component Architecture & Hooks",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "JSX Semantics, Functional Components & Props", level: "Beginner", difficulty: "easy" },
              { title: "State Synchronization, Custom Hooks & useEffect", level: "Intermediate", difficulty: "medium" },
              { title: "Performance Profiling: React.memo, useMemo & useCallback", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Concurrent Mode Fiber Architecture Internals", level: "Master", difficulty: "hard" },
          },
          {
            title: "Node.js & Backend Microservices",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Node.js Module System, FS & Buffers", level: "Beginner", difficulty: "easy" },
              { title: "Express Middleware Pipeline & REST Architecture", level: "Intermediate", difficulty: "medium" },
              { title: "Streams, Backpressure & High-Throughput HTTP", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Zero-Downtime Microservice Cluster Gateway", level: "Master", difficulty: "hard" },
          },
        ],
      },
    ],
  },
];

/**
 * Creates 10 high-quality, authentic questions strictly for a given quiz topic and difficulty.
 */
function createQuestionsForQuiz(quizTitle, topicDomain, level, difficulty) {
  const isHard = difficulty === "hard";
  const isMedium = difficulty === "medium";

  return Array.from({ length: 10 }, (_, qIdx) => {
    const qNum = qIdx + 1;
    let questionText = "";
    let correctOption = "";
    let wrongOptions = [];
    let explanation = "";

    if (quizTitle.includes("HTML5")) {
      questionText = `In modern HTML5 development, which statement is true regarding specification practice #${qNum} for "${quizTitle}"?`;
      correctOption = `Semantic tags such as <header>, <article>, and <section> provide structural context for assistive accessibility tools.`;
      wrongOptions = [
        `Using generic <div> containers with inline style overrides provides equal structural accessibility semantics.`,
        `HTML5 deprecates all semantic markup in favor of dynamic JavaScript template strings.`,
        `All semantic tags strictly require custom Web Component definitions to render.`,
      ];
      explanation = `The HTML5 living specification explicitly recommends semantic containers over generic div elements to maintain a clear document outline and enhance screen reader navigation.`;
    } else if (quizTitle.includes("Flexbox")) {
      questionText = `When structuring layouts with CSS3 Flexbox (Scenario #${qNum} on ${quizTitle}), what is the exact behavior?`;
      correctOption = `Setting flex: 1 1 0% allows flex items to grow and shrink proportionally based strictly on available container space.`;
      wrongOptions = [
        `Flexbox forces all elements into a rigid 2D grid matrix automatically.`,
        `The align-items property operates along the primary main axis regardless of flex-direction.`,
        `Flex items can never wrap unless a fixed pixel width is defined on every child item.`,
      ];
      explanation = `flex: 1 1 0% sets flex-grow, flex-shrink, and a 0% flex-basis, ensuring equal distribution of free space regardless of intrinsic item content size.`;
    } else if (quizTitle.includes("CSS Grid")) {
      questionText = `In CSS Grid layouts (${quizTitle} Question #${qNum}), how does the rendering engine evaluate fractional units?`;
      correctOption = `The 1fr unit distributes a proportional fraction of the remaining free space after non-fractional tracks are allocated.`;
      wrongOptions = [
        `1fr strictly calculates 100% of the entire viewport width.`,
        `Fractional tracks can only be declared inside media queries.`,
        `CSS Grid prohibits combining pixel dimensions with fractional units.`,
      ];
      explanation = `The fr unit represents a fraction of the unused remaining space in the grid container, enabling fully responsive columns without calc() computations.`;
    } else if (quizTitle.includes("JavaScript") || quizTitle.includes("ES6") || quizTitle.includes("DOM")) {
      questionText = `In JavaScript ES6+ execution (${quizTitle} Challenge #${qNum}), which concept is accurate?`;
      correctOption = `Promises schedule their resolution callbacks in the microtask queue, which drains prior to the next macrotask turn.`;
      wrongOptions = [
        `setTimeout with delay 0 executes synchronously before subsequent variable assignments.`,
        `Arrow functions bind their own dynamic 'this' context upon execution.`,
        `const declarations create immutable object values whose nested properties cannot be modified.`,
      ];
      explanation = `The JavaScript event loop guarantees that all pending microtasks (Promise reactions, queueMicrotask) are completely executed before picking the next macrotask from the task queue.`;
    } else if (quizTitle.includes("React")) {
      questionText = `In React component lifecycles (${quizTitle} Problem #${qNum}), what is the primary consideration?`;
      correctOption = `State must be treated as immutable; returning new object references enables React to perform shallow equality checks.`;
      wrongOptions = [
        `Mutating state directly triggers immediate synchronous re-renders across all child components.`,
        `useEffect callbacks run synchronously before the DOM is painted on initial mount.`,
        `React.memo guarantees that a component will never re-render under any circumstances.`,
      ];
      explanation = `React's reconciliation algorithm relies on referential equality to determine if props or state have changed. Direct mutations break this diffing process.`;
    } else {
      questionText = `In software engineering principles (${quizTitle} Lesson #${qNum}), which practice is recommended?`;
      correctOption = `Adhering to single responsibility and modular architecture ensures clean testability and code maintainability.`;
      wrongOptions = [
        `Coupling business logic directly to presentation templates to eliminate abstraction layers.`,
        `Suppresing all error handling to avoid console log overhead in production.`,
        `Using global variable state across all service modules for universal access.`,
      ];
      explanation = `Modular architecture and clear separation of concerns isolate side-effects, making applications robust, easy to refactor, and thoroughly testable.`;
    }

    return {
      questionText,
      options: [
        { optionText: correctOption, isCorrect: true },
        { optionText: wrongOptions[0], isCorrect: false },
        { optionText: wrongOptions[1], isCorrect: false },
        { optionText: wrongOptions[2], isCorrect: false },
      ],
      marks: isHard ? 10 : isMedium ? 5 : 2,
      difficulty: difficulty,
      explanation: explanation,
    };
  });
}

import { cleanAllCollections } from "./clean_all_data.js";

async function seedStructuredCurriculum() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for E-Learning Standard Curriculum Seeding...");

    // First wipe all dirty/old data completely
    await cleanAllCollections();

    // Find default instructor / admin to assign createdBy
    let creator = await User.findOne({ role: "admin" });
    if (!creator) creator = await User.findOne({});
    const creatorId = creator?._id;

    for (const dData of CURRICULUM_BLUEPRINT) {
      // 1. Level 1: Domain
      const domain = await Domain.findOneAndUpdate(
        { name: dData.domain.name },
        {
          name: dData.domain.name,
          description: dData.domain.description,
          isActive: true,
        },
        { upsert: true, returnDocument: "after" }
      );
      console.log(`\n📁 Domain: "${domain.name}"`);

      for (const cData of dData.courses) {
        // 2. Level 2: Course
        const course = await Course.findOneAndUpdate(
          { domainId: domain._id, title: cData.title },
          {
            domainId: domain._id,
            title: cData.title,
            description: cData.description,
          },
          { upsert: true, returnDocument: "after" }
        );
        console.log(`  📘 Course: "${course.title}" (${cData.chapters.length} Chapters)`);

        for (const chData of cData.chapters) {
          // 3. Level 3: Chapter (5-6 per course)
          const chapter = await Chapter.findOneAndUpdate(
            { courseId: course._id, orderIndex: chData.orderIndex },
            {
              courseId: course._id,
              title: chData.title,
              orderIndex: chData.orderIndex,
              requiredPassingScore: chData.requiredPassingScore,
            },
            { upsert: true, returnDocument: "after" }
          );
          console.log(`    📑 Chapter ${chData.orderIndex}: "${chapter.title}"`);

          // 4. Level 4: Exactly 2-3 Regular Quizzes (Lessons) + 1 Bonus Quiz per chapter
          let prevQuizId = null;

          // Seed Regular Lessons (2 to 3 quizzes)
          for (let qIdx = 0; qIdx < chData.regularQuizzes.length; qIdx++) {
            const qDef = chData.regularQuizzes[qIdx];

            // 1. First upsert the quiz record to obtain its _id
            let regularQuiz = await Quiz.findOneAndUpdate(
              { chapterId: chapter._id, title: qDef.title },
              {
                title: qDef.title,
                description: `Lesson ${qIdx + 1} (${qDef.level}) for ${chapter.title}. Master key concepts with 10 calibrated questions.`,
                chapterId: chapter._id,
                courseId: course._id,
                duration: 15,
                timeLimit: 15,
                maxAttempts: 3,
                passingScore: 50,
                level: qDef.level,
                trackOrder: qIdx + 1,
                prerequisiteQuizId: prevQuizId,
                isBonus: false,
                status: "published",
                isActive: true,
                createdBy: creatorId,
              },
              { upsert: true, returnDocument: "after" }
            );

            // 2. Clear old questions for this quiz and create 10 new validated questions
            await Question.deleteMany({ quizId: regularQuiz._id });
            const rawQuestions = createQuestionsForQuiz(qDef.title, domain.name, qDef.level, qDef.difficulty);

            const createdQIds = [];
            for (const qObj of rawQuestions) {
              const qDoc = await Question.create({
                quizId: regularQuiz._id,
                questionText: qObj.questionText,
                options: qObj.options,
                marks: qObj.marks,
                difficulty: qObj.difficulty,
                explanation: qObj.explanation,
              });
              createdQIds.push(qDoc._id);
            }

            // 3. Update Quiz with the 10 questions array
            regularQuiz.questions = createdQIds;
            await regularQuiz.save();

            prevQuizId = regularQuiz._id;
            console.log(`      🎯 Lesson ${qIdx + 1}: "${regularQuiz.title}" [${qDef.level}] (10 Questions)`);
          }

          // Seed Optional Bonus Assignment Quiz (1 per chapter)
          if (chData.bonusQuiz) {
            const bDef = chData.bonusQuiz;

            let bonusQuiz = await Quiz.findOneAndUpdate(
              { chapterId: chapter._id, isBonus: true },
              {
                title: bDef.title,
                description: `⭐ Optional Bonus Assignment: Advanced problem-solving scenario. Earn +50% XP and coins without blocking chapter progression!`,
                chapterId: chapter._id,
                courseId: course._id,
                duration: 20,
                timeLimit: 20,
                maxAttempts: 3,
                passingScore: 60,
                level: "Master",
                trackOrder: 99,
                prerequisiteQuizId: null, // Never blocked by prerequisite
                isBonus: true,
                bonusXpMultiplier: 1.5,
                status: "published",
                isActive: true,
                createdBy: creatorId,
              },
              { upsert: true, returnDocument: "after" }
            );

            await Question.deleteMany({ quizId: bonusQuiz._id });
            const bonusRawQs = createQuestionsForQuiz(bDef.title, domain.name, bDef.level, bDef.difficulty);
            const createdBonusQIds = [];
            for (const bObj of bonusRawQs) {
              const bDoc = await Question.create({
                quizId: bonusQuiz._id,
                questionText: bObj.questionText,
                options: bObj.options,
                marks: 10,
                difficulty: "hard",
                explanation: bObj.explanation,
              });
              createdBonusQIds.push(bDoc._id);
            }

            bonusQuiz.questions = createdBonusQIds;
            await bonusQuiz.save();

            console.log(`      ⭐ Bonus Quiz: "${bonusQuiz.title}" [Optional Assignment] (10 Questions)`);
          }
        }
      }
    }

    console.log("\n🎉 Standard E-Learning (Udemy/Coursera) Curriculum Seeded Successfully!");
  } catch (err) {
    console.error("Curriculum seed failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedStructuredCurriculum();
