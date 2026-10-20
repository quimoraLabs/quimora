import mongoose from "mongoose";
import dotenv from "dotenv";
import Interest from "../models/interest.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

const interestsData = [
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, Backend, and Full-Stack web engineering concepts.",
    topicTags: ["javascript", "react", "node", "express", "css", "html"],
    icon: "globe",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Data analysis, machine learning, statistics, and visualization.",
    topicTags: ["python", "pandas", "numpy", "statistics", "sql"],
    icon: "database",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Mobile Apps",
    slug: "mobile-apps",
    description: "iOS, Android, React Native, and cross-platform app development.",
    topicTags: ["react-native", "flutter", "swift", "kotlin", "mobile"],
    icon: "smartphone",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Neural networks, deep learning, LLMs, and prompt engineering.",
    topicTags: ["ai", "machine-learning", "llm", "neural-networks", "groq"],
    icon: "cpu",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    description: "Network security, cryptography, ethical hacking, and web security.",
    topicTags: ["security", "jwt", "auth", "encryption", "owasp"],
    icon: "shield",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description: "AWS, Azure, GCP, microservices, and serverless architectures.",
    topicTags: ["aws", "cloud", "docker", "kubernetes", "serverless"],
    icon: "cloud",
    isCore: true,
    createdBy: null,
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "CI/CD pipelines, infrastructure as code, containerization, and monitoring.",
    topicTags: ["devops", "ci-cd", "docker", "git", "linux"],
    icon: "terminal",
    isCore: true,
    createdBy: null,
  },
  {
    name: "Database Systems",
    slug: "database-systems",
    description: "Relational, NoSQL, in-memory databases, and query optimization.",
    topicTags: ["mongodb", "redis", "postgresql", "sql", "mongoose"],
    icon: "server",
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
