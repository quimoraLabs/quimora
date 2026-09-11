import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    const isTest = process.env.NODE_ENV === "test" || config.nodeENV === "test";
    let targetURI = isTest
      ? process.env.MONGO_URI_TEST || config.mongoURITest || "mongodb://localhost:27017/quimora_test"
      : config.mongoURI;

    const conn = await mongoose.connect(targetURI);
    const dbName = conn.connection.name;

    if (isTest) {
      console.log(`🧪 [TEST DB] MongoDB connected to: ${dbName} (${targetURI})`);
    } else {
      console.log(`🍃 MongoDB connected to database: ${dbName}`);
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;