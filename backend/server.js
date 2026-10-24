import app, { allowedOrigins } from "./app.js";
import connectDB from "./config/connectDB.js";
import config from "./config/config.js";

const PORT = config.port || 5000;

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("❌ Failed to connect to Database on startup:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeENV}`);
    console.log(`📡 API Prefix: ${config.apiPrefix}`);
    console.log(`🔗 Allowed Origins: ${allowedOrigins.join(", ")}`);
  });
};

startServer();
