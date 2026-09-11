import dotenv from "dotenv";

dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is missing.");
}

export default {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  mongoURITest: process.env.MONGO_URI_TEST,
  jwtSecret: process.env.JWT_SECRET,
  emailPass: process.env.EMAIL_PASS,
  emailUser: process.env.EMAIL_USER,
  imagekitPublic: process.env.IMAGEKIT_PUBLIC_KEY,
  imagekitPrivate: process.env.IMAGEKIT_PRIVATE_KEY,
  imagekitEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  nodeENV: process.env.NODE_ENV,
  groqApiKey: process.env.GROQ_API_KEY,
  apiPrefix: process.env.API_PREFIX || "/api/v1"
};
