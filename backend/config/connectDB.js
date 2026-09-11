import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    const isTest = config.nodeENV === "test";
    let targetURI = isTest
      ? config.mongoURITest || (config.mongoURI ? `${config.mongoURI}_test` : "mongodb://localhost:27017/quimora_test")
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