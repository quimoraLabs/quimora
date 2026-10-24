import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    const isTest = process.env.NODE_ENV === "test" || config.nodeENV === "test";
    let targetURI = isTest
      ? process.env.MONGO_URI_TEST || config.mongoURITest || "mongodb://localhost:27017/quimora_test"
      : config.mongoURI;

    if (!targetURI) {
      throw new Error("No MongoDB connection URI found in environment variables. Please configure MONGO_URI.");
    }

    const conn = await mongoose.connect(targetURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const dbName = conn.connection.name;

    if (isTest) {
      console.log(`🧪 [TEST DB] MongoDB connected to: ${dbName} (${targetURI})`);
    } else {
      console.log(`🍃 MongoDB connected to database: ${dbName}`);
      // Background sanitize and catalog quiz seeding (non-blocking)
      import("../services/catalogSeeder.service.js")
        .then(async ({ sanitizeMaxAttempts, seedCatalogQuizzes }) => {
          await sanitizeMaxAttempts();
          await seedCatalogQuizzes();
        })
        .catch((err) => {
          console.warn("⚠️ [STARTUP SEEDER] Background catalog seed warning:", err.message);
        });
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;