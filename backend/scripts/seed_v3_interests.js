import mongoose from "mongoose";
import dotenv from "dotenv";
import Interest from "../models/interest.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

const interestsData = [
  {
    name: "Web Foundations (HTML, CSS, JS)",
    slug: "web-foundations",
    description: "HTML5 semantic structure, CSS3 styling, Flexbox, and core JavaScript basics.",
    topicTags: ["html5", "css3", "javascript", "dom", "flexbox"],
    icon: "globe",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Modern Web & Frameworks",
    slug: "modern-web",
    description: "React, Next.js, Node.js, Express, Redux state management, and REST APIs.",
    topicTags: ["react", "nodejs", "nextjs", "express", "redux"],
    icon: "layers",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Python & Data Science",
    slug: "data-science",
    description: "Python programming, data analysis, Pandas, NumPy, and statistics.",
    topicTags: ["python", "pandas", "numpy", "statistics", "analytics"],
    icon: "database",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Database Systems (SQL & NoSQL)",
    slug: "database-systems",
    description: "SQL queries, relational databases, PostgreSQL, MongoDB, and Redis caching.",
    topicTags: ["sql", "mongodb", "postgresql", "redis", "indexing"],
    icon: "server",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Data Structures & Algorithms",
    slug: "dsa",
    description: "Arrays, linked lists, trees, graphs, sorting algorithms, and time complexity.",
    topicTags: ["dsa", "algorithms", "arrays", "trees", "complexity"],
    icon: "cpu",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Artificial Intelligence & ML",
    slug: "artificial-intelligence",
    description: "Machine learning fundamentals, neural networks, LLMs, and prompt engineering.",
    topicTags: ["ai", "machine-learning", "llm", "neural-networks", "groq"],
    icon: "cpu",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Cyber Security & Web Safety",
    slug: "cyber-security",
    description: "Network security, cryptography, JWT authentication, and OWASP standards.",
    topicTags: ["security", "jwt", "auth", "encryption", "owasp"],
    icon: "shield",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Cloud Computing & DevOps",
    slug: "cloud-computing",
    description: "AWS cloud services, Docker containers, CI/CD pipelines, and Linux basics.",
    topicTags: ["docker", "aws", "cloud", "ci-cd", "linux"],
    icon: "cloud",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Mobile App Development",
    slug: "mobile-apps",
    description: "Cross-platform mobile apps with React Native, Flutter, and UI patterns.",
    topicTags: ["react-native", "flutter", "mobile", "android", "ios"],
    icon: "smartphone",
    isCore: true,
    createdBy: null,
  },
];

async function seedInterests() {
  try {
    console.log("Connecting to MongoDB for V3 Interests Seed...");
    await mongoose.connect(MONGO_URI);

    const ops = interestsData.map((item) => ({
      updateOne: {
        filter: { slug: item.slug },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await Interest.bulkWrite(ops);
    console.log(
      `✅ V3 Interests seeded successfully! Upserted/Updated count: ${result.upsertedCount + result.modifiedCount}`
    );
  } catch (error) {
    console.error("❌ Error seeding V3 Interests:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedInterests();
