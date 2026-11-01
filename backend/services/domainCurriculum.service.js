import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Interest from "../models/interest.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import { getAuthenticQuestions } from "../scripts/curriculumQuestionBank.js";

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Standard Curricula Blueprints for all primary learning domains
 */
const BLUEPRINTS = {
  "web development": {
    name: "Web Development",
    description: "Frontend, backend, modern frameworks, APIs, and scalable web architectures.",
    courses: [
      {
        title: "Frontend Foundations",
        description: "HTML5 semantic architecture, CSS3 Grid/Flexbox, and responsive standards.",
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

  "python & data science": {
    name: "Python & Data Science",
    description: "Python core programming, data structures, scientific computing with NumPy, and data manipulation with Pandas.",
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

  "database systems": {
    name: "Database Systems & Architecture",
    description: "Relational modeling, SQL mastery, query optimization, indexing, and NoSQL document architectures.",
    courses: [
      {
        title: "Relational Databases & SQL Mastery",
        description: "Master relational algebra, complex SQL joins, indexing, ACID transactions, and normalization.",
        chapters: [
          {
            title: "SQL Query Fundamentals & Filtering",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "SELECT, WHERE, ORDER BY & Projection Basics", level: "Beginner", difficulty: "easy" },
              { title: "Aggregate Functions, GROUP BY & HAVING Clauses", level: "Intermediate", difficulty: "medium" },
              { title: "Subqueries, Correlated Queries & EXISTS", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Complex Multi-Table Analytical Reporting", level: "Master", difficulty: "hard" },
          },
          {
            title: "Table Relationships, Foreign Keys & Joins",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "INNER JOIN, LEFT JOIN & Cross Joins", level: "Beginner", difficulty: "easy" },
              { title: "Self Joins, Full Outer Joins & Set Operations", level: "Intermediate", difficulty: "medium" },
              { title: "Window Functions (ROW_NUMBER, RANK, OVER)", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: High-Scale Partitioned Window Functions", level: "Master", difficulty: "hard" },
          },
          {
            title: "Schema Normalization & ACID Transactions",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "1NF, 2NF & 3NF Normalization Principles", level: "Beginner", difficulty: "easy" },
              { title: "ACID Guarantees & Transaction Isolation Levels", level: "Intermediate", difficulty: "medium" },
              { title: "Deadlocks, Concurrency Control & Row Locks", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Zero-Downtime Schema Migration Architecture", level: "Master", difficulty: "hard" },
          },
          {
            title: "Database Indexing & Query Execution Plans",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "B-Tree vs Hash Indexes & Primary Keys", level: "Beginner", difficulty: "easy" },
              { title: "Composite Indexes & Covering Index Optimization", level: "Intermediate", difficulty: "medium" },
              { title: "EXPLAIN ANALYZE & Query Bottleneck Diagnosis", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Multi-Million Row Query Plan Tuning", level: "Master", difficulty: "hard" },
          },
          {
            title: "Stored Procedures, Triggers & Views",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Views & Materialized Views Implementation", level: "Beginner", difficulty: "easy" },
              { title: "Stored Procedures, Control Flow & Error Handling", level: "Intermediate", difficulty: "medium" },
              { title: "Database Triggers, Audit Logs & Security Constraints", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Enterprise Financial Audit Ledger Trigger System", level: "Master", difficulty: "hard" },
          },
        ],
      },
    ],
  },

  "data structures & algorithms": {
    name: "Data Structures & Algorithms",
    description: "Fundamental and advanced data structures, algorithmic design patterns, and asymptotic complexity analysis.",
    courses: [
      {
        title: "Core Data Structures & Complexity",
        description: "Dynamic arrays, linked lists, stacks, queues, trees, heaps, and hash tables.",
        chapters: [
          {
            title: "Asymptotic Complexity & Array Structures",
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Big-O, Big-Omega & Big-Theta Notation", level: "Beginner", difficulty: "easy" },
              { title: "Dynamic Arrays, Two-Pointers & Sliding Window", level: "Intermediate", difficulty: "medium" },
              { title: "Prefix Sums & Kadane's Maximum Subarray Algorithm", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Amortized Constant-Time Circular Buffer", level: "Master", difficulty: "hard" },
          },
          {
            title: "Linked Lists & Pointer Manipulation",
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Singly Linked Lists & Node Traversal", level: "Beginner", difficulty: "easy" },
              { title: "Doubly Linked Lists & In-Place Reversal", level: "Intermediate", difficulty: "medium" },
              { title: "Floyd's Cycle Detection & Fast-Slow Pointers", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: O(1) LRU Cache Architecture", level: "Master", difficulty: "hard" },
          },
          {
            title: "Stacks, Queues & Monotonic Sequences",
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Stack LIFO Operations & Balanced Parentheses", level: "Beginner", difficulty: "easy" },
              { title: "Queue FIFO Implementations & Deque Structures", level: "Intermediate", difficulty: "medium" },
              { title: "Monotonic Stacks & Next Greater Element Patterns", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Largest Rectangle in Histogram Optimal Stack", level: "Master", difficulty: "hard" },
          },
          {
            title: "Binary Trees, BST & Tree Traversals",
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Binary Tree Depth, Height & DFS Traversals", level: "Beginner", difficulty: "easy" },
              { title: "Binary Search Trees: Search, Insert & Delete", level: "Intermediate", difficulty: "medium" },
              { title: "Lowest Common Ancestor & Diameter of Binary Tree", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: AVL Tree Self-Balancing Rotations", level: "Master", difficulty: "hard" },
          },
          {
            title: "Heaps, Priority Queues & Sorting",
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: "Min-Heap & Max-Heap Array Representations", level: "Beginner", difficulty: "easy" },
              { title: "Heapify, HeapSort & Top-K Frequent Elements", level: "Intermediate", difficulty: "medium" },
              { title: "MergeSort, QuickSort Partitioning & Stability", level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: "Bonus Challenge: Median Finder in Data Streams with Dual Heaps", level: "Master", difficulty: "hard" },
          },
        ],
      },
    ],
  },
};

/**
 * Creates dynamic blueprint for any custom topic
 */
function createDynamicBlueprint(rawTopic) {
  const cleanTopic = rawTopic.trim();
  return {
    name: cleanTopic,
    description: `Comprehensive academic and practical curriculum for ${cleanTopic}, featuring sequential chapter mastery and certification exams.`,
    courses: [
      {
        title: `${cleanTopic} Foundations & Core Architecture`,
        description: `Fundamental principles, architectural mechanisms, and idiomatic practices in ${cleanTopic}.`,
        chapters: [
          {
            title: `${cleanTopic} Syntax, Fundamentals & Environment Setup`,
            orderIndex: 1,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: `${cleanTopic} Core Fundamentals & Nomenclature`, level: "Beginner", difficulty: "easy" },
              { title: `${cleanTopic} Data Types & Flow Mechanics`, level: "Intermediate", difficulty: "medium" },
              { title: `${cleanTopic} Idiomatic Conventions & Best Practices`, level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: `Bonus Challenge: ${cleanTopic} High-Speed Core Evaluation`, level: "Master", difficulty: "hard" },
          },
          {
            title: `${cleanTopic} Structural Patterns & Design Mechanics`,
            orderIndex: 2,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: `${cleanTopic} Modular Architecture & Composition`, level: "Beginner", difficulty: "easy" },
              { title: `${cleanTopic} State & Execution Pipeline`, level: "Intermediate", difficulty: "medium" },
              { title: `${cleanTopic} Resilient Error Handling & Recovery`, level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: `Bonus Challenge: ${cleanTopic} Production Design Audit`, level: "Master", difficulty: "hard" },
          },
          {
            title: `${cleanTopic} Performance Profiling & Optimization`,
            orderIndex: 3,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: `${cleanTopic} Memory Consumption & Throughput`, level: "Beginner", difficulty: "easy" },
              { title: `${cleanTopic} Concurrency, Caching & Scaling`, level: "Intermediate", difficulty: "medium" },
              { title: `${cleanTopic} Benchmarking & Bottleneck Identification`, level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: `Bonus Challenge: ${cleanTopic} Ultra-Low Latency Optimization`, level: "Master", difficulty: "hard" },
          },
          {
            title: `${cleanTopic} Security, Auditing & Standards Compliance`,
            orderIndex: 4,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: `${cleanTopic} Threat Modeling & Input Sanitation`, level: "Beginner", difficulty: "easy" },
              { title: `${cleanTopic} Authentication, Access & Permissions`, level: "Intermediate", difficulty: "medium" },
              { title: `${cleanTopic} Industry Compliance & Automated Testing`, level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: `Bonus Challenge: ${cleanTopic} Zero-Trust Architectural Hardening`, level: "Master", difficulty: "hard" },
          },
          {
            title: `${cleanTopic} Enterprise Capstone & System Integration`,
            orderIndex: 5,
            requiredPassingScore: 50,
            regularQuizzes: [
              { title: `${cleanTopic} Continuous Integration & Automated Delivery`, level: "Beginner", difficulty: "easy" },
              { title: `${cleanTopic} Distributed Microservices & Event Streams`, level: "Intermediate", difficulty: "medium" },
              { title: `${cleanTopic} Cloud Native Deployment & Observability`, level: "Advanced", difficulty: "hard" },
            ],
            bonusQuiz: { title: `Bonus Challenge: ${cleanTopic} Mission-Critical Scalable Deployment`, level: "Master", difficulty: "hard" },
          },
        ],
      },
    ],
  };
}

export class DomainCurriculumService {
  /**
   * Resolves the matching blueprint for any topic
   */
  static getBlueprint(topicName) {
    if (!topicName || typeof topicName !== "string") {
      return BLUEPRINTS["web development"];
    }
    const t = topicName.toLowerCase().trim();

    if (t.includes("python") || t.includes("data science") || t.includes("pandas") || t.includes("numpy")) {
      return BLUEPRINTS["python & data science"];
    }
    if (t.includes("web") || t.includes("html") || t.includes("css") || t.includes("react") || t.includes("javascript")) {
      return BLUEPRINTS["web development"];
    }
    if (t.includes("sql") || t.includes("database") || t.includes("postgres") || t.includes("mongo")) {
      return BLUEPRINTS["database systems"];
    }
    if (t.includes("algorithm") || t.includes("dsa") || t.includes("data structure") || t.includes("binary tree")) {
      return BLUEPRINTS["data structures & algorithms"];
    }

    return createDynamicBlueprint(topicName);
  }

  /**
   * Ensures that a Domain and its complete 4-level hierarchy exists for a given interest or topic name.
   * If it doesn't exist, it AUTOMATICALLY CREATES it on the fly!
   */
  static async ensureDomainForTopic(topicNameOrInterest) {
    let rawTopic = "";
    if (typeof topicNameOrInterest === "string") {
      rawTopic = topicNameOrInterest;
    } else if (topicNameOrInterest && typeof topicNameOrInterest === "object") {
      rawTopic = topicNameOrInterest.name || topicNameOrInterest.slug || "";
    }

    if (!rawTopic.trim()) {
      rawTopic = "Web Development";
    }

    const blueprint = this.getBlueprint(rawTopic);
    const domainName = blueprint.name;

    // 1. Check if domain already exists
    let domain = await Domain.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(domainName)}$`, "i") },
    });

    if (!domain) {
      domain = await Domain.create({
        name: domainName,
        description: blueprint.description,
        isActive: true,
      });
      console.log(`[AutoDomain] Created new Domain: "${domain.name}"`);
    }

    // 2. Check if courses exist for this domain
    const courseCount = await Course.countDocuments({ domainId: domain._id });
    if (courseCount > 0) {
      return domain;
    }

    console.log(`[AutoDomain] Auto-generating curriculum hierarchy for domain "${domain.name}"...`);

    let creator = await User.findOne({ role: "admin" });
    if (!creator) creator = await User.findOne({});
    const creatorId = creator?._id;

    for (const cData of blueprint.courses) {
      // Level 2: Course
      const course = await Course.create({
        domainId: domain._id,
        title: cData.title,
        description: cData.description,
      });

      for (const chData of cData.chapters) {
        // Level 3: Chapter
        const chapter = await Chapter.create({
          courseId: course._id,
          title: chData.title,
          orderIndex: chData.orderIndex,
          requiredPassingScore: chData.requiredPassingScore,
        });

        // Level 4: Regular Lessons
        let prevQuizId = null;
        for (let qIdx = 0; qIdx < chData.regularQuizzes.length; qIdx++) {
          const qDef = chData.regularQuizzes[qIdx];
          const quiz = await Quiz.create({
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
            status: "published",
            isActive: true,
            createdBy: creatorId,
            tags: [domain.name, course.title, chapter.title],
          });

          // 10 questions per quiz
          const rawQs = getAuthenticQuestions(qDef.title, qDef.level, qDef.difficulty);
          const qIds = [];
          for (const qObj of rawQs) {
            const qDoc = await Question.create({
              quizId: quiz._id,
              questionText: qObj.questionText,
              options: qObj.options,
              marks: qObj.marks,
              difficulty: qObj.difficulty,
              explanation: qObj.explanation,
            });
            qIds.push(qDoc._id);
          }

          quiz.questions = qIds;
          await quiz.save();
          prevQuizId = quiz._id;
        }

        // Level 4: Bonus Quiz (Optional Assignment)
        if (chData.bonusQuiz) {
          const bDef = chData.bonusQuiz;
          const bonusQuiz = await Quiz.create({
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
            isBonus: true,
            bonusXpMultiplier: 1.5,
            status: "published",
            isActive: true,
            createdBy: creatorId,
            tags: [domain.name, course.title, chapter.title, "bonus"],
          });

          const rawBonusQs = getAuthenticQuestions(bDef.title, bDef.level, bDef.difficulty);
          const bIds = [];
          for (const bObj of rawBonusQs) {
            const bDoc = await Question.create({
              quizId: bonusQuiz._id,
              questionText: bObj.questionText,
              options: bObj.options,
              marks: 10,
              difficulty: "hard",
              explanation: bObj.explanation,
            });
            bIds.push(bDoc._id);
          }
          bonusQuiz.questions = bIds;
          await bonusQuiz.save();
        }
      }
    }

    console.log(`[AutoDomain] Successfully built 4-level hierarchy for "${domain.name}"!`);
    return domain;
  }

  /**
   * Auto-ensures domains for all interests selected by a student
   */
  static async ensureDomainsForStudent(userId) {
    if (!userId) return [];
    const profile = await StudentProfile.findOne({ userId }).populate("interests");
    if (!profile || !profile.interests || profile.interests.length === 0) {
      return [];
    }

    const ensuredDomains = [];
    for (const interest of profile.interests) {
      if (interest) {
        const domain = await this.ensureDomainForTopic(interest);
        if (domain && !ensuredDomains.some((d) => d._id.toString() === domain._id.toString())) {
          ensuredDomains.push(domain);
        }
      }
    }
    return ensuredDomains;
  }
}

export default DomainCurriculumService;
