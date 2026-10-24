import Interest from "../models/interest.model.js";
import StudentProfileService from "../services/studentProfile.service.js";
import { redisCache } from "../config/redis.js";

const CORE_DEFAULT_INTERESTS = [
  {
    name: "Web Foundations (HTML, CSS, JS)",
    slug: "web-foundations",
    description: "HTML5 semantic structure, CSS3 styling, Flexbox, and core JavaScript basics.",
    topicTags: ["html5", "css3", "javascript", "dom", "flexbox"],
    icon: "globe",
    isCore: true,
    isActive: true,
  },
  {
    name: "Modern Web & Frameworks",
    slug: "modern-web",
    description: "React, Next.js, Node.js, Express, Redux state management, and REST APIs.",
    topicTags: ["react", "nodejs", "nextjs", "express", "redux"],
    icon: "layers",
    isCore: true,
    isActive: true,
  },
  {
    name: "Python & Data Science",
    slug: "data-science",
    description: "Python programming, data analysis, Pandas, NumPy, and statistics.",
    topicTags: ["python", "pandas", "numpy", "statistics", "analytics"],
    icon: "database",
    isCore: true,
    isActive: true,
  },
  {
    name: "Database Systems (SQL & NoSQL)",
    slug: "database-systems",
    description: "SQL queries, relational databases, PostgreSQL, MongoDB, and Redis caching.",
    topicTags: ["sql", "mongodb", "postgresql", "redis", "indexing"],
    icon: "server",
    isCore: true,
    isActive: true,
  },
  {
    name: "Data Structures & Algorithms",
    slug: "dsa",
    description: "Arrays, linked lists, trees, graphs, sorting algorithms, and time complexity.",
    topicTags: ["dsa", "algorithms", "arrays", "trees", "complexity"],
    icon: "cpu",
    isCore: true,
    isActive: true,
  },
  {
    name: "Artificial Intelligence & ML",
    slug: "artificial-intelligence",
    description: "Machine learning fundamentals, neural networks, LLMs, and prompt engineering.",
    topicTags: ["ai", "machine-learning", "llm", "neural-networks", "groq"],
    icon: "cpu",
    isCore: true,
    isActive: true,
  },
  {
    name: "Cyber Security & Web Safety",
    slug: "cyber-security",
    description: "Network security, cryptography, JWT authentication, and OWASP standards.",
    topicTags: ["security", "jwt", "auth", "encryption", "owasp"],
    icon: "shield",
    isCore: true,
    isActive: true,
  },
  {
    name: "Cloud Computing & DevOps",
    slug: "cloud-computing",
    description: "AWS cloud services, Docker containers, CI/CD pipelines, and Linux basics.",
    topicTags: ["docker", "aws", "cloud", "ci-cd", "linux"],
    icon: "cloud",
    isCore: true,
    isActive: true,
  },
  {
    name: "Mobile App Development",
    slug: "mobile-apps",
    description: "Cross-platform mobile apps with React Native, Flutter, and UI patterns.",
    topicTags: ["react-native", "flutter", "mobile", "android", "ios"],
    icon: "smartphone",
    isCore: true,
    isActive: true,
  },
];

/**
 * @desc    Get all active interests
 * @route   GET /api/v2/interests
 * @access  Public
 */
export const getInterests = async (req, res, next) => {
  try {
    let interests = await Interest.find({ isActive: true }).sort({ isCore: -1, name: 1 });

    // Auto-seed core interests if database collection is empty (e.g. on fresh production deployment)
    if (!interests || interests.length === 0) {
      try {
        await Interest.insertMany(CORE_DEFAULT_INTERESTS, { ordered: false });
        interests = await Interest.find({ isActive: true }).sort({ isCore: -1, name: 1 });
      } catch (seedErr) {
        // If unique index collision or partial insert, re-query
        interests = await Interest.find({ isActive: true }).sort({ isCore: -1, name: 1 });
      }
    }

    res.status(200).json({
      success: true,
      count: interests.length,
      data: interests,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current student profile with interests and Elo ratings
 * @route   GET /api/v2/interests/student/profile or /api/v2/student/profile
 * @access  Private (Student)
 */
export const getStudentProfile = async (req, res, next) => {
  try {
    const profileData = await StudentProfileService.getStudentProfile(req.auth.userId);
    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Complete initial student onboarding with 5-6 interests
 * @route   POST /api/v2/interests/student/onboarding or /api/v2/student/interests/onboarding
 * @access  Private (Student)
 */
export const completeStudentOnboarding = async (req, res, next) => {
  try {
    const { interestIds } = req.body;
    if (!interestIds || !Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: "interestIds array is required",
      });
    }

    const profile = await StudentProfileService.completeOnboarding(
      req.auth.userId,
      interestIds
    );

    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * @desc    Update student interests post-onboarding (up to 10)
 * @route   PUT /api/v2/interests/student/interests or /api/v2/student/interests
 * @access  Private (Student)
 */
export const updateStudentInterests = async (req, res, next) => {
  try {
    const { interestIds } = req.body;
    if (!interestIds || !Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: "interestIds array is required",
      });
    }

    const profile = await StudentProfileService.updateInterests(
      req.auth.userId,
      interestIds
    );

    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: "Student interests updated successfully",
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
