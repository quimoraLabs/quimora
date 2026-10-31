import mongoose from "mongoose";
import dotenv from "dotenv";
import Interest from "../models/interest.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

// Granular chapter curriculum mapping for known domain tracks
const GRANULAR_CHAPTER_MAP = {
  "web-foundations": [
    {
      title: "HTML5 Semantic Architecture & Accessibility",
      description: "Master modern document structuring, semantic tags, forms, and accessibility standards.",
      matchTags: ["html", "html5", "semantic-html", "accessibility", "dom"],
    },
    {
      title: "Modern CSS3 Layouts, Flexbox & Grid",
      description: "Build robust, responsive user interfaces using Flexbox, CSS Grid, and adaptive design.",
      matchTags: ["css", "css3", "flexbox", "grid", "responsive"],
    },
    {
      title: "JavaScript Core Runtime & ES6+ Syntax",
      description: "Deep dive into JS event loop, asynchronous execution, closures, prototypes, and ES6+ features.",
      matchTags: ["javascript", "js", "es6", "closures"],
    },
  ],
  "modern-web-frameworks": [
    {
      title: "React Component Architecture & State Hooks",
      description: "Component lifecycles, custom hooks, reconciliation, memoization, and state synchronization.",
      matchTags: ["react", "redux", "nextjs", "hooks"],
    },
    {
      title: "Node.js, Express & Microservice Architecture",
      description: "Build robust backend microservices: middleware pipelines, JWT auth, status codes, and error handlers.",
      matchTags: ["node", "nodejs", "express", "rest-api", "microservices"],
    },
  ],
  "python-data-science": [
    {
      title: "Python Foundational Structures & Functions",
      description: "Core Python memory management, list comprehensions, functional idioms, and error handling.",
      matchTags: ["python", "data-structures", "functions"],
    },
    {
      title: "Scientific Computing with NumPy & Pandas",
      description: "High-performance data manipulation, vectorized multidimensional arrays, and analytics pipelines.",
      matchTags: ["pandas", "numpy", "statistics", "analytics"],
    },
  ],
  "database-systems": [
    {
      title: "Relational Database Design & SQL Optimization",
      description: "Declarative SQL queries, complex JOIN operations, table normalization, and indexing strategies.",
      matchTags: ["sql", "postgresql", "indexing", "queries"],
    },
    {
      title: "Document Databases & NoSQL Systems",
      description: "Distributed schemaless document modeling, aggregation pipelines, caching, and sharding.",
      matchTags: ["mongodb", "redis", "nosql"],
    },
  ],
  "data-structures-algorithms": [
    {
      title: "Linear Data Structures & Asymptotic Complexity",
      description: "Arrays, amortized Big-O analysis, sliding windows, and pointer operations.",
      matchTags: ["arrays", "complexity", "dsa", "algorithms", "strings"],
    },
    {
      title: "Dynamic Stacks, Queues & Linked Lists",
      description: "Recursive pointers, LIFO/FIFO collections, doubly linked sequences, and memory overhead.",
      matchTags: ["stacks", "queues", "trees", "linked-lists"],
    },
  ],
  "artificial-intelligence-ml": [
    {
      title: "Machine Learning Foundations & Supervised Learning",
      description: "Loss minimization, gradient descent, feature scaling, model metrics, and classification bounds.",
      matchTags: ["machine-learning", "ai", "neural-networks"],
    },
    {
      title: "Generative AI Architectures & Large Language Models",
      description: "Transformer attention layers, tokenization, prompt embeddings, and retrieval-augmented systems.",
      matchTags: ["llm", "groq", "generative ai"],
    },
  ],
  "cyber-security": [
    {
      title: "Web Security & OWASP Defense Systems",
      description: "Countering XSS, SQL injection, CSRF attacks, JWT validation, and secure cryptographic handshakes.",
      matchTags: ["security", "jwt", "auth", "encryption", "owasp", "web security"],
    },
  ],
  "cloud-devops": [
    {
      title: "Containerization, Microservices & CI/CD Pipelines",
      description: "Docker multi-stage builds, orchestration fundamentals, container isolation, and automated pipelines.",
      matchTags: ["docker", "aws", "cloud", "ci-cd", "linux", "devops & docker"],
    },
  ],
  "mobile-development": [
    {
      title: "Cross-Platform Mobile Application Architecture",
      description: "Reactive UI state, native bridges, gesture responders, and bundle compilation for iOS and Android.",
      matchTags: ["react-native", "flutter", "mobile", "android", "ios", "react native"],
    },
  ],
};

async function seedChapters() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Granular Chapter Track Organization...");

    const interests = await Interest.find({ isActive: true });
    console.log(`Found ${interests.length} active interests.`);

    for (const interest of interests) {
      // Find quizzes linked to this interest
      const quizzes = await Quiz.find({ interestIds: interest._id }).sort({ createdAt: 1 });
      if (quizzes.length === 0) continue;

      // Determine chapter blueprint for this interest slug/name
      const slug = interest.slug || interest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const mappedBlueprint = Object.entries(GRANULAR_CHAPTER_MAP).find(([key]) => slug.includes(key) || key.includes(slug))?.[1];

      let chapterDefs = [];

      if (mappedBlueprint && mappedBlueprint.length > 0) {
        chapterDefs = mappedBlueprint;
      } else {
        // Fallback: derive granular chapters directly from quiz titles/tags
        chapterDefs = quizzes.map((q) => ({
          title: `${q.title.replace(/ Mastery| Essentials| Architecture| Fundamentals/gi, "")} Track`,
          description: q.description || `In-depth mastery module covering ${q.title}.`,
          matchTags: q.tags || [],
        }));
      }

      // Upsert granular chapters
      const createdChapters = [];
      for (let cIdx = 0; cIdx < chapterDefs.length; cIdx++) {
        const def = chapterDefs[cIdx];
        const chapter = await Chapter.findOneAndUpdate(
          { interestId: interest._id, orderIndex: cIdx + 1 },
          {
            interestId: interest._id,
            title: def.title,
            description: def.description,
            orderIndex: cIdx + 1,
            requiredPassingScore: 50,
            isPublished: true,
          },
          { upsert: true, returnDocument: "after" }
        );
        createdChapters.push({ chapter, def });
      }

      // Clean up any extra chapters with orderIndex beyond createdChapters
      await Chapter.deleteMany({
        interestId: interest._id,
        orderIndex: { $gt: createdChapters.length },
      });

      // Link each quiz to its most specific granular chapter
      let prevQuizId = null;
      for (let qIdx = 0; qIdx < quizzes.length; qIdx++) {
        const quiz = quizzes[qIdx];
        const quizTags = (quiz.tags || []).map((t) => t.toLowerCase());
        const quizTitle = quiz.title.toLowerCase();

        // Best match chapter
        let targetChapter = createdChapters[0].chapter;
        for (const item of createdChapters) {
          const matches = (item.def.matchTags || []).some(
            (tag) => quizTags.includes(tag.toLowerCase()) || quizTitle.includes(tag.toLowerCase())
          );
          if (matches) {
            targetChapter = item.chapter;
            break;
          }
        }

        // If no match by tags, distribute evenly across chapters
        if (!targetChapter && createdChapters.length > 0) {
          targetChapter = createdChapters[qIdx % createdChapters.length].chapter;
        }

        await Quiz.findByIdAndUpdate(quiz._id, {
          chapterId: targetChapter._id,
          trackOrder: qIdx + 1,
          prerequisiteQuizId: prevQuizId,
        });

        prevQuizId = quiz._id;
      }

      console.log(`✅ Track seeded for: "${interest.name}" (${quizzes.length} quizzes mapped to ${createdChapters.length} granular chapters)`);
    }

    console.log("🎉 All Granular Curriculum Tracks organized successfully!");
  } catch (err) {
    console.error("Chapter seed failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedChapters();
