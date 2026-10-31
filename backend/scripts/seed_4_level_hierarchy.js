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
  {
    domain: {
      name: "Python & Data Science",
      description: "Python core programming, data structures, scientific computing with NumPy, and data manipulation with Pandas.",
    },
    courses: [
      {
        title: "Python Foundations & Applied Programming",
        description: "Comprehensive Python programming track: data structures, object-oriented architecture, file I/O, error handling, and concurrency.",
        chapters: [
          {
            title: "Python Syntax, Data Types & Control Flow",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Python Variables, Numeric Types & Conditional Logic", level: "Beginner", difficulty: "easy" },
              { title: "Python Collections: Lists, Tuples, Dictionaries & Sets", level: "Intermediate", difficulty: "medium" },
              { title: "Comprehensions, Lambda Functions & Generator Expressions", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: High-Efficiency Itertools & Memory Generators", level: "Master", difficulty: "hard" },
          },
          {
            title: "Object-Oriented Python & Functional Patterns",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Classes, Objects, Methods & The __init__ Constructor", level: "Beginner", difficulty: "easy" },
              { title: "Inheritance, Polymorphism & Dunder Magic Methods", level: "Intermediate", difficulty: "medium" },
              { title: "Decorators, Context Managers & Property Encapsulation", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Metaclasses & Custom Descriptor Protocols", level: "Master", difficulty: "hard" },
          },
          {
            title: "File Handling, Exceptions & Standard Library",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "File I/O, Pathlib & Working with JSON/CSV Data", level: "Beginner", difficulty: "easy" },
              { title: "Exception Handling, try-except-finally & Custom Errors", level: "Intermediate", difficulty: "medium" },
              { title: "Python Standard Library, Math, Random & Datetime", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Concurrent File Processing & Resource Locks", level: "Master", difficulty: "hard" },
          },
          {
            title: "Data Structures & Algorithmic Thinking in Python",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Stacks, Queues & Collections Module (deque, Counter)", level: "Beginner", difficulty: "easy" },
              { title: "Recursion, Binary Search & Custom Sorting Key Functions", level: "Intermediate", difficulty: "medium" },
              { title: "Hash Tables, Tree Traversals & Big-O Complexity", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Shortest Path Algorithms & Heapq Priority Queues", level: "Master", difficulty: "hard" },
          },
          {
            title: "Concurrency, Asynchronous Python & Web Requests",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "The requests Module, REST API Ingestion & Serialization", level: "Beginner", difficulty: "easy" },
              { title: "Multithreading vs Multiprocessing & GIL Fundamentals", level: "Intermediate", difficulty: "medium" },
              { title: "asyncio, async/await Syntax & Non-Blocking Event Loops", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: High-Throughput Non-Blocking Async Pipeline", level: "Master", difficulty: "hard" },
          },
        ],
      },
      {
        title: "Data Analysis with NumPy & Pandas",
        description: "Data science essentials: multi-dimensional arrays, dataframes, data cleaning, transformations, grouping, and visualization.",
        chapters: [
          {
            title: "NumPy Arrays & Multi-Dimensional Computing",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "NumPy ndarray Creation, Array Shapes, Data Types & Indexing", level: "Beginner", difficulty: "easy" },
              { title: "Array Slicing, Boolean Masking & Vectorized Operations", level: "Intermediate", difficulty: "medium" },
              { title: "Broadcasting Rules, Matrix Multiplication & Linear Algebra", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Memory Strides, In-Place Mutability & Performance", level: "Master", difficulty: "hard" },
          },
          {
            title: "Pandas Series & DataFrame Foundations",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Pandas Series, DataFrame Creation & CSV Ingestion", level: "Beginner", difficulty: "easy" },
              { title: "Indexing with loc & iloc, Column Selection & Filtering", level: "Intermediate", difficulty: "medium" },
              { title: "Handling Missing Data: isnull, dropna & fillna Strategies", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Large Dataset Chunking & Downcasting Memory Optimization", level: "Master", difficulty: "hard" },
          },
          {
            title: "Data Wrangling, GroupBy & Aggregations",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Descriptive Statistics: mean, median, mode, std & describe", level: "Beginner", difficulty: "easy" },
              { title: "groupby Operations, Multiple Aggregations & transform", level: "Intermediate", difficulty: "medium" },
              { title: "Merging, Joining & Concatenating Multi-Table Datasets", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Hierarchical MultiIndex Reshaping & Pivot Tables", level: "Master", difficulty: "hard" },
          },
          {
            title: "Feature Engineering & Time Series in Pandas",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "String Methods (str accessor) & Categorical Data Types", level: "Beginner", difficulty: "easy" },
              { title: "DateTime Parsing, Timestamps, Resampling & Rolling Windows", level: "Intermediate", difficulty: "medium" },
              { title: "Outlier Detection with IQR/Z-score & Feature Binning", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: High-Frequency Financial Time-Series Resampling Pipeline", level: "Master", difficulty: "hard" },
          },
          {
            title: "Data Visualization & Exploratory Data Analysis",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Matplotlib Fundamentals: Line, Scatter & Bar Charts", level: "Beginner", difficulty: "easy" },
              { title: "Seaborn Statistical Plots: Boxplots, Heatmaps & Pairplots", level: "Intermediate", difficulty: "medium" },
              { title: "Correlation Analysis, Skewness Correction & Distribution Insights", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: End-to-End Automated EDA Pipeline Report", level: "Master", difficulty: "hard" },
          },
        ],
      },
    ],
  },
];

/**
 * Creates 10 high-quality, authentic questions strictly for a given quiz topic and difficulty.
 */
import { getAuthenticQuestions } from "./curriculumQuestionBank.js";
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
            const rawQuestions = getAuthenticQuestions(qDef.title, qDef.level, qDef.difficulty);

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
            const bonusRawQs = getAuthenticQuestions(bDef.title, bDef.level, bDef.difficulty);
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

    // Ensure Interest records match the domains for student onboarding compatibility
    const Interest = (await import("../models/interest.model.js")).default;
    const StudentProfile = (await import("../models/studentProfile.model.js")).default;

    const pythonInterest = await Interest.findOneAndUpdate(
      { slug: "data-science" },
      {
        name: "Python & Data Science",
        slug: "data-science",
        description: "Python programming, data analysis, Pandas, NumPy, and statistics.",
        topicTags: ["python", "pandas", "numpy", "statistics", "analytics"],
        icon: "database",
        isCore: true,
        isActive: true,
      },
      { upsert: true, returnDocument: "after" }
    );

    const webInterest = await Interest.findOneAndUpdate(
      { slug: "web-foundations" },
      {
        name: "Web Development",
        slug: "web-foundations",
        description: "HTML5 semantic structure, CSS3 styling, Flexbox, and core JavaScript basics.",
        topicTags: ["html5", "css3", "javascript", "dom", "flexbox"],
        icon: "globe",
        isCore: true,
        isActive: true,
      },
      { upsert: true, returnDocument: "after" }
    );

    // Sync demo student account student_alex to Python & Data Science
    const studentUser = await User.findOne({ username: "student_alex" });
    if (studentUser) {
      await StudentProfile.findOneAndUpdate(
        { userId: studentUser._id },
        {
          userId: studentUser._id,
          interests: [pythonInterest._id],
          onboardingCompleted: true,
          levelName: "Beginner",
          coinsBalance: 100,
        },
        { upsert: true }
      );
      console.log(`✅ Synced student_alex profile to default active interest: "Python & Data Science"`);
    }
  } catch (err) {
    console.error("Curriculum seed failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedStructuredCurriculum();
