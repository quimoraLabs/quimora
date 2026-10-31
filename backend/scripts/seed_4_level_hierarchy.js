import mongoose from "mongoose";
import dotenv from "dotenv";
import Domain from "../models/domain.model.js";
import Course from "../models/course.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

const HIERARCHY_DATA = [
  {
    domain: {
      name: "Web Development",
      description: "Frontend, backend, APIs, and modern full-stack web applications.",
    },
    courses: [
      {
        title: "Frontend Foundations",
        description: "Modern HTML5 semantic architecture, CSS3 flexbox & responsive layouts.",
        chapters: [
          {
            title: "HTML5 Semantic Architecture",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "HTML5",
          },
          {
            title: "Modern CSS3 Flexbox & Grid",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "CSS3",
          },
        ],
      },
      {
        title: "JavaScript & Modern Frameworks",
        description: "Core JavaScript runtime, ES6+ semantics, and React component state.",
        chapters: [
          {
            title: "JavaScript Core & Asynchronous Runtime",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "JavaScript",
          },
          {
            title: "React Component Architecture & Hooks",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "React",
          },
          {
            title: "Node.js & Backend Microservices",
            orderIndex: 3,
            requiredPassingScore: 50,
            quizMatchTitle: "Node.js",
          },
        ],
      },
    ],
  },
  {
    domain: {
      name: "Data Science & AI",
      description: "Python data analysis, scientific computation, machine learning, and LLMs.",
    },
    courses: [
      {
        title: "Python Data Analysis",
        description: "Core Python idioms, data structures, and vectorized NumPy/Pandas computation.",
        chapters: [
          {
            title: "Python Core Programming & Memory Structures",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "Python",
          },
          {
            title: "Data Manipulation with Pandas & NumPy",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "Pandas",
          },
        ],
      },
      {
        title: "Artificial Intelligence & LLMs",
        description: "Supervised machine learning algorithms, model loss, and Large Language Models.",
        chapters: [
          {
            title: "Machine Learning Fundamentals & Optimization",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "Machine Learning",
          },
          {
            title: "Large Language Models & Transformer Attention",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "Large Language",
          },
        ],
      },
    ],
  },
  {
    domain: {
      name: "Systems & Database Architecture",
      description: "Data persistence, relational SQL, document NoSQL, and scalable systems.",
    },
    courses: [
      {
        title: "Database Engineering",
        description: "Declarative SQL, transaction indexing, and document-store schema patterns.",
        chapters: [
          {
            title: "Relational Queries & Indexing (SQL)",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "SQL",
          },
          {
            title: "Document NoSQL Systems (MongoDB)",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "MongoDB",
          },
        ],
      },
      {
        title: "Data Structures & Algorithms",
        description: "Asymptotic Big-O complexity, linear buffers, and non-linear pointer topologies.",
        chapters: [
          {
            title: "Arrays, Complexity & Sliding Windows",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "Arrays",
          },
          {
            title: "Stacks, Queues & Sequential Buffers",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "Stacks",
          },
        ],
      },
      {
        title: "Cloud & Security Engineering",
        description: "OWASP defensive security and containerized DevOps pipelines.",
        chapters: [
          {
            title: "Web Security & Cryptographic Handshakes",
            orderIndex: 1,
            requiredPassingScore: 50,
            quizMatchTitle: "Security",
          },
          {
            title: "Docker Containers & Microservices",
            orderIndex: 2,
            requiredPassingScore: 50,
            quizMatchTitle: "Docker",
          },
        ],
      },
    ],
  },
];

async function seedHierarchy() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for 4-Level Hierarchy Seeding...");

    // Drop old index on quimora.chapters if it exists
    try {
      await mongoose.connection.db.collection("chapters").dropIndex("interestId_1_orderIndex_1");
      console.log("Dropped legacy interestId_1_orderIndex_1 index from chapters.");
    } catch {
      // index might not exist or already dropped
    }

    // Clean old chapters so new clean chapters belong strictly to courses
    await Chapter.deleteMany({});
    console.log("Cleaned old chapter records.");

    // Get all existing quizzes
    const allQuizzes = await Quiz.find({ isActive: true });
    console.log(`Found ${allQuizzes.length} existing quizzes in database.`);

    for (const dData of HIERARCHY_DATA) {
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
      console.log(`\n📁 Domain: ${domain.name} (_id: ${domain._id})`);

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
        console.log(`  📘 Course: ${course.title} (_id: ${course._id})`);

        for (const chData of cData.chapters) {
          // 3. Level 3: Chapter
          const chapter = await Chapter.create({
            courseId: course._id,
            title: chData.title,
            orderIndex: chData.orderIndex,
            requiredPassingScore: chData.requiredPassingScore,
          });
          console.log(`    📑 Chapter: ${chapter.title} (Order: ${chapter.orderIndex})`);

          // 4. Level 4: Match and link Quizzes
          const matchedQuiz = allQuizzes.find((q) =>
            q.title.toLowerCase().includes(chData.quizMatchTitle.toLowerCase())
          );

          if (matchedQuiz) {
            await Quiz.findByIdAndUpdate(matchedQuiz._id, {
              chapterId: chapter._id,
              courseId: course._id,
              duration: matchedQuiz.duration || matchedQuiz.timeLimit || 15,
              trackOrder: chData.orderIndex,
            });
            console.log(`      🎯 Quiz Linked: "${matchedQuiz.title}"`);
          }
        }
      }
    }

    console.log("\n🎉 4-Level Hierarchy (Domain -> Course -> Chapter -> Quiz) seeded successfully!");
  } catch (err) {
    console.error("Hierarchy seed error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedHierarchy();
