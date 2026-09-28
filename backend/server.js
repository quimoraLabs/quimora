import app, { allowedOrigins } from "./app.js";
import connectDB from "./config/connectDB.js";
import config from "./config/config.js";

const PORT = config.port || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeENV}`);
  console.log(`📡 API Prefix: ${config.apiPrefix}`);
  console.log(`🔗 Allowed Origins: ${allowedOrigins.join(", ")}`);
  
  try {
    await connectDB();
  } catch (error) {
    console.error("❌ Failed to connect to Database:", error);
  }
});
