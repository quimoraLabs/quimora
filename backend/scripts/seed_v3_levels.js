import mongoose from "mongoose";
import dotenv from "dotenv";
import Level from "../models/level.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

const levelsData = [
  {
    levelName: "Beginner",
    minElo: 0,
    maxElo: 1000,
    badge: "badge_beginner.png",
    description: "Building core foundational knowledge.",
  },
  {
    levelName: "Learner",
    minElo: 1000,
    maxElo: 1200,
    badge: "badge_learner.png",
    description: "Developing consistent domain understanding.",
  },
  {
    levelName: "Intermediate",
    minElo: 1200,
    maxElo: 1400,
    badge: "badge_intermediate.png",
    description: "Demonstrating solid practical application.",
  },
  {
    levelName: "Advanced",
    minElo: 1400,
    maxElo: 1600,
    badge: "badge_advanced.png",
    description: "Solving complex problem scenarios with high precision.",
  },
  {
    levelName: "Master",
    minElo: 1600,
    maxElo: 1800,
    badge: "badge_master.png",
    description: "Demonstrating expert-level proficiency and speed.",
  },
  {
    levelName: "Expert",
    minElo: 1800,
    maxElo: 99999,
    badge: "badge_expert.png",
    description: "Pinnacle domain mastery.",
  },
];

async function seedLevels() {
  try {
    console.log("Connecting to MongoDB for V3 Levels Seed...");
    await mongoose.connect(MONGO_URI);

    const ops = levelsData.map((level) => ({
      updateOne: {
        filter: { levelName: level.levelName },
        update: { $set: level },
        upsert: true,
      },
    }));

    const result = await Level.bulkWrite(ops);
    console.log(`✅ V3 Levels seeded successfully! Upserted/Updated count: ${result.upsertedCount + result.modifiedCount}`);
  } catch (error) {
    console.error("❌ Error seeding V3 Levels:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedLevels();
