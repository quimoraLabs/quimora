import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import Interest from "../models/interest.model.js";
import EloRating from "../models/eloRating.model.js";
import { autoGenerateTopicQuiz } from "../services/aiQuizGenerator.service.js";
import { seedCatalogQuizzes } from "../services/catalogSeeder.service.js";
import mongoose from "mongoose";
import { redisCache } from "../config/redis.js";
import {
  assertQuizExists,
  assertUserExists,
} from "../utils/assertion.utils.js";
import { formatUniversalResponse } from "../utils/universalFormatter.utils.js";
import { isDuplicateQuiz } from "../utils/duplicate.utils.js";

/**
 * @desc    Fetch active and published available quizzes for students
 * @route   GET /api/v2/quizzes/student
 * @access  Private (Student)
 * @returns {Object} Paginated list of student available quizzes
 */
export const getAvailableQuizzesForStudents = async (req, res, next) => {
  try {
    const now = new Date();
    let { page = 1, limit = 10, interestId, level } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);

    const userId = req.auth?.userId;

    const cacheKey = userId
      ? `quizzes:student:${userId}:i${interestId || "all"}:lvl${level || "all"}:p${page}:l${limit}`
      : `quizzes:student:all:i${interestId || "all"}:lvl${level || "all"}:p${page}:l${limit}`;

    const cachedData = await redisCache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Step 1: Ensure quizzes exist for student's selected interests & level before querying
    if (userId) {
      const studentProf = await StudentProfile.findOne({ userId }).populate("interests");
      if (studentProf && Array.isArray(studentProf.interests) && studentProf.interests.length > 0) {
        // Filter target interests: either specific interestId requested or all student profile interests
        const targetInterests = interestId
          ? studentProf.interests.filter(
              (i) => i._id?.toString() === interestId.toString()
            )
          : studentProf.interests;

        for (const interest of targetInterests) {
          // Calculate student's level in this interest for track progression
          const eloDoc = await EloRating.findOne({ studentId: userId, interestId: interest._id });
          const currentRating = eloDoc?.rating || studentProf.overallElo || 1000;
          let currentLevel = "Beginner";
          if (currentRating >= 1800) currentLevel = "Expert";
          else if (currentRating >= 1600) currentLevel = "Master";
          else if (currentRating >= 1400) currentLevel = "Advanced";
          else if (currentRating >= 1200) currentLevel = "Intermediate";
          else if (currentRating >= 1000) currentLevel = "Learner";

          const targetLevel = level || currentLevel;

          const existingCount = await Quiz.countDocuments({
            interestIds: interest._id,
            status: "published",
            isActive: true,
          });

          if (existingCount === 0) {
            if (interest.slug) {
              await seedCatalogQuizzes(interest.slug);
            }
            const postSeedCount = await Quiz.countDocuments({
              interestIds: interest._id,
              status: "published",
              isActive: true,
            });
            if (postSeedCount === 0) {
              await autoGenerateTopicQuiz(interest, targetLevel);
            }
          }
        }
      }
    }

    // Step 2: Build strict query (no generic un-tagged quiz leakage)
    const query = {
      status: "published",
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    };

    if (userId) {
      const profile = await StudentProfile.findOne({ userId });
      if (interestId && mongoose.Types.ObjectId.isValid(interestId)) {
        query.interestIds = new mongoose.Types.ObjectId(interestId);
      } else if (profile && Array.isArray(profile.interests) && profile.interests.length > 0) {
        query.interestIds = { $in: profile.interests };
      }
    } else if (interestId && mongoose.Types.ObjectId.isValid(interestId)) {
      query.interestIds = new mongoose.Types.ObjectId(interestId);
    }

    if (level) {
      query.level = level;
    }

    const totalItems = await Quiz.countDocuments(query);

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name email")
      .populate("interestIds", "name slug")
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Compute student's attempts and decoupled progress for each quiz
    let attemptsMap = {};
    let progressMap = {};
    if (userId && quizzes.length > 0) {
      const quizIds = quizzes.map((q) => q._id);

      const [attempts, progresses] = await Promise.all([
        QuizAttempt.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              quizId: { $in: quizIds },
            },
          },
          {
            $group: {
              _id: "$quizId",
              count: { $sum: 1 },
            },
          },
        ]),
        StudentQuizProgress.find({
          userId: new mongoose.Types.ObjectId(userId),
          quizId: { $in: quizIds },
        }).lean(),
      ]);

      attempts.forEach((a) => {
        attemptsMap[a._id.toString()] = a.count;
      });

      progresses.forEach((p) => {
        progressMap[p.quizId.toString()] = p;
      });
    }

    const formattedQuizzes = quizzes.map((quiz) => {
      const quizObj = quiz.toObject ? quiz.toObject() : { ...quiz };
      const attemptsUsed = attemptsMap[quizObj._id.toString()] || 0;
      const prog = progressMap[quizObj._id.toString()] || {
        passAttemptsCount: 0,
        maxPassAllowed: 3,
        failAttemptsCount: 0,
        isLocked: false,
        lockReason: "NONE",
        appealStatus: "NONE",
      };

      const passAttemptsCount = prog.passAttemptsCount || 0;
      const maxPassAllowed = prog.maxPassAllowed || 3;
      const failAttemptsCount = prog.failAttemptsCount || 0;
      const maxFailAllowed = 6;
      const isLocked =
        prog.isLocked ||
        failAttemptsCount >= maxFailAllowed ||
        passAttemptsCount >= maxPassAllowed;

      const lockReason =
        prog.lockReason !== "NONE"
          ? prog.lockReason
          : failAttemptsCount >= maxFailAllowed
          ? "FAIL_LIMIT_EXCEEDED"
          : passAttemptsCount >= maxPassAllowed
          ? "PASS_LIMIT_REACHED"
          : "NONE";

      // Strictly clamp maxAttempts to 3 (prevent any 10 from leaking)
      const rawMax = Number(quizObj.maxAttempts);
      const maxAttempts = (rawMax > 0 && rawMax <= 3) ? rawMax : 3;
      quizObj.maxAttempts = maxAttempts;
      const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

      return {
        ...quizObj,
        level: quizObj.level || "Beginner",
        maxAttempts,
        attemptsRemaining,
        attemptsUsed,
        passAttemptsCount,
        maxPassAllowed,
        failAttemptsCount,
        maxFailAllowed,
        isLocked,
        lockReason,
        appealStatus: prog.appealStatus || "NONE",
        hasPassedOnce: prog.hasPassedOnce || false,
        canAttempt: !isLocked,
      };
    });

    const responsePayload = {
      success: true,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
        limit,
      },
      data: formattedQuizzes,
    };

    await redisCache.set(cacheKey, responsePayload, 10);

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new quiz
 * @route   POST /api/v2/quizzes
 * @access  Private (Instructor/Admin)
 * @returns {Object} Created quiz details
 */
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, timeLimit, maxAttempts, startDate, endDate, tags = [], interestIds = [] } = req.body;
    const userId = req.auth.userId;
    await assertUserExists(userId, false);

    const isDuplicate = await isDuplicateQuiz(title, userId);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: "A quiz with this title already exists.",
      });
    }

    // Auto-map interestIds if not provided by inspecting matching Interests in DB
    let finalInterestIds = Array.isArray(interestIds) ? [...interestIds] : [];
    if (finalInterestIds.length === 0) {
      const searchTerms = [title, description, ...(Array.isArray(tags) ? tags : [])]
        .filter(Boolean)
        .map((t) => t.toString().trim().toLowerCase());

      const allInterests = await Interest.find({ isActive: true }).lean();
      for (const interest of allInterests) {
        const iName = (interest.name || "").toLowerCase();
        const iSlug = (interest.slug || "").toLowerCase();
        const iTags = (interest.topicTags || []).map((t) => t.toLowerCase());

        const isMatch = searchTerms.some((term) =>
          term.includes(iName) || iName.includes(term) ||
          term.includes(iSlug) || iSlug.includes(term) ||
          iTags.some((t) => term.includes(t) || t.includes(term))
        );

        if (isMatch) {
          finalInterestIds.push(interest._id);
        }
      }
    }

    const quiz = new Quiz({
      title,
      description,
      timeLimit,
      maxAttempts: Math.min(Number(maxAttempts) || 3, 3),
      startDate,
      endDate,
      createdBy: userId,
      tags,
      interestIds: finalInterestIds,
      status: req.body.status || "published",
      isActive: true,
    });
    await quiz.save();

    await redisCache.delPattern("quizzes:student:*");

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch quizzes created by the logged-in instructor
 * @route   GET /api/v2/quizzes/instructor
 * @access  Private (Instructor)
 * @returns {Object} Paginated list of instructor quizzes
 */
export const getQuizzesByInstructor = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const totalItems = await Quiz.countDocuments({
      createdBy: req.auth.userId.toString(),
    });

    await assertUserExists(req.auth.userId, false);

    const quizzes = await Quiz.find({
      createdBy: req.auth.userId.toString(),
    })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!quizzes) {
      return res.status(404).json({
        message: "Quizzes not found",
      });
    }
    const formattedQuizzes = formatUniversalResponse(quizzes);
    const totalPages = Math.ceil(formattedQuizzes.length / limit);
    res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit,
      },
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all quizzes system-wide (Admin list)
 * @route   GET /api/v2/quizzes
 * @access  Private (Admin)
 * @returns {Object} Paginated list of system quizzes
 */
export const getQuizzes = async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(1, parseInt(page, 10));
    limit = Math.max(1, parseInt(limit, 10));

    const totalItems = await Quiz.countDocuments();

    const quizzes = await Quiz.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedQuizzes = quizzes.length
      ? formatUniversalResponse(quizzes, "createdBy", ["name", "email"])
      : [];

    res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
        limit,
      },
      data: formattedQuizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single quiz details by ID with stats
 * @route   GET /api/v2/quizzes/:quizId
 * @access  Public / Authenticated
 * @returns {Object} Detailed quiz metadata and statistics
 */
export const getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const result = formatUniversalResponse(quiz, "createdBy", [
      "name",
      "email",
    ]);

    const totalAttempts = await QuizAttempt.countDocuments({
      quizId,
      status: "completed",
    });

    result.stats = {
      attempts: totalAttempts,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing quiz details
 * @route   PATCH /api/v2/quizzes/:quizId
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated quiz object
 */
export const updateQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();
    const data = req.body;

    const quiz = await assertQuizExists(quizId);
    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to update this quiz" });
    }

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      if (data.title.trim() !== quiz.title) {
        const isDuplicate = await isDuplicateQuiz(data.title.trim(), userId, quizId);
        if (isDuplicate) {
          return res.status(409).json({ error: "A quiz with this title already exists" });
        }
      }
    }

    const allowedFields = [
      "title",
      "description",
      "tags",
      "interestIds",
      "timeLimit",
      "startDate",
      "endDate",
      "maxAttempts",
      "status",
      "isActive",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        filteredData[field] = data[field];
      }
    });

    if (filteredData.maxAttempts !== undefined) {
      filteredData.maxAttempts = Math.min(Number(filteredData.maxAttempts) || 3, 3);
    }

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const hasChanges = Object.keys(filteredData).some(
      (key) => JSON.stringify(filteredData[key]) !== JSON.stringify(quiz[key])
    );

    if (!hasChanges) {
      return res.status(400).json({
        error: "No changes detected in the provided data",
      });
    }

    const finalStartDate = filteredData.startDate ? new Date(filteredData.startDate) : quiz.startDate;
    const finalEndDate = filteredData.endDate ? new Date(filteredData.endDate) : quiz.endDate;

    if (finalStartDate && finalEndDate && finalEndDate <= finalStartDate) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    Object.assign(quiz, filteredData);
    const updatedQuiz = await quiz.save();
    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete quiz and cascading questions/attempts
 * @route   DELETE /api/v2/quizzes/:quizId
 * @access  Private (Instructor/Admin)
 * @returns {Object} Success message
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();
    const role = req.auth.role;

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId && role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access to delete this quiz" });
    }

    await quiz.deleteOne();

    await Question.deleteMany({ quizId });
    await QuizAttempt.deleteMany({ quizId });
    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: "Quiz and its associated questions and attempts deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change publishing status of a quiz ('draft' | 'published')
 * @route   PATCH /api/v2/quizzes/:quizId/status
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated quiz status
 */
export const changeQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    if (status !== "draft" && status !== "published") {
      return res.status(400).json({ error: "Invalid status" });
    }

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this resource" });
    }

    if (quiz.status === status) {
      return res.status(400).json({ error: `Quiz is already ${status}` });
    }

    if (status === "published") {
      const questionCount = await Question.countDocuments({ quizId });
      if (questionCount === 0) {
        return res.status(400).json({
          error: "Cannot publish a quiz containing zero active questions",
        });
      }
    }

    quiz.status = status;
    await quiz.save();
    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: `Quiz status updated to ${status} successfully`,
      data: { status: quiz.status },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle quiz active status (true / false)
 * @route   PATCH /api/v2/quizzes/:quizId/active
 * @access  Private (Instructor/Admin)
 * @returns {Object} Updated active state
 */
export const toggleQuizActiveStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.auth.userId.toString();

    const quiz = await assertQuizExists(quizId);

    if (quiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();
    await redisCache.delPattern("quizzes:student:*");

    res.status(200).json({
      success: true,
      message: `Quiz ${quiz.isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: quiz.isActive },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clone/duplicate an existing quiz and its questions
 * @route   POST /api/v2/quizzes/:quizId/clone
 * @access  Private (Instructor/Admin)
 * @returns {Object} Cloned quiz payload and question count
 */
export const cloneQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId || req.params.id;
    const userId = req.auth.userId.toString();

    const sourceQuiz = await assertQuizExists(quizId);

    if (sourceQuiz.createdBy.toString() !== userId && req.auth.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to clone this quiz" });
    }

    let clonedTitle = `${sourceQuiz.title} (Copy)`;
    let isDuplicate = await isDuplicateQuiz(clonedTitle, userId);
    if (isDuplicate) {
      clonedTitle = `${sourceQuiz.title} (Copy ${Date.now().toString().slice(-4)})`;
    }

    const clonedQuiz = new Quiz({
      title: clonedTitle,
      description: sourceQuiz.description,
      timeLimit: sourceQuiz.timeLimit,
      passingScore: sourceQuiz.passingScore,
      maxAttempts: sourceQuiz.maxAttempts,
      status: "draft",
      isActive: true,
      createdBy: userId,
      tags: sourceQuiz.tags || [],
      interestIds: sourceQuiz.interestIds || [],
    });
    await clonedQuiz.save();

    const sourceQuestions = await Question.find({ quizId: sourceQuiz._id }).lean();
    if (sourceQuestions.length > 0) {
      const clonedQuestions = sourceQuestions.map((q) => {
        const { _id, createdAt, updatedAt, quizId, ...rest } = q;
        return {
          ...rest,
          quizId: clonedQuiz._id,
        };
      });
      await Question.insertMany(clonedQuestions);
    }

    res.status(201).json({
      success: true,
      message: "Quiz duplicated successfully",
      data: {
        quiz: clonedQuiz,
        clonedQuestionsCount: sourceQuestions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
