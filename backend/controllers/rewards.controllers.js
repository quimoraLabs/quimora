import StudentProfile from "../models/studentProfile.model.js";
import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import CoinTransaction from "../models/coinTransaction.model.js";
import QuizPassAppeal from "../models/quizPassAppeal.model.js";
import {
  purchaseDirectPass,
  purchaseExtraPassAttempt,
  submitPassAppeal,
  reviewPassAppeal,
} from "../services/rewards.service.js";

/**
 * @desc Get student reward summary (coins balance, hint tokens, badges, transactions)
 * @route GET /api/v2/student/rewards/overview
 * @access Private (Student)
 */
export const getStudentRewardsOverview = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }

    const transactions = await CoinTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        coinsBalance: profile.coinsBalance || 0,
        hintTokens: profile.hintTokens || 0,
        unlockedBadges: profile.unlockedBadges || [],
        activeTheme: profile.activeTheme || "default",
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Purchase Direct Pass with Coins
 * @route POST /api/v2/student/rewards/direct-pass
 * @access Private (Student)
 */
export const buyDirectPassHandler = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    const result = await purchaseDirectPass(userId, quizId);
    res.status(200).json({
      success: true,
      message: "Direct Pass successfully redeemed!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Purchase Extra Pass Attempt (+1 maxPassAllowed)
 * @route POST /api/v2/student/rewards/extra-pass-attempt
 * @access Private (Student)
 */
export const buyExtraPassAttemptHandler = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ error: "quizId is required" });
    }

    const result = await purchaseExtraPassAttempt(userId, quizId);
    res.status(200).json({
      success: true,
      message: "Extra Pass Attempt unlocked successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Student submits Admin Appeal when fail count reaches 6
 * @route POST /api/v2/student/quiz/:quizId/appeal-pass
 * @access Private (Student)
 */
export const submitAppealHandler = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();
    const { quizId } = req.params;
    const { studentNotes } = req.body;

    const appeal = await submitPassAppeal(userId, quizId, studentNotes);
    res.status(201).json({
      success: true,
      message: "Appeal submitted to Admin successfully. Awaiting review.",
      data: appeal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Student checks status of active appeal
 * @route GET /api/v2/student/quiz/:quizId/appeal-status
 * @access Private (Student)
 */
export const getAppealStatusHandler = async (req, res, next) => {
  try {
    const userId = req.auth.userId.toString();
    const { quizId } = req.params;

    const appeal = await QuizPassAppeal.findOne({
      studentId: userId,
      quizId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: appeal || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin views all pending pass appeals
 * @route GET /api/v2/admin/appeals
 * @access Private (Admin)
 */
export const getAdminAppealsHandler = async (req, res, next) => {
  try {
    const { status = "pending" } = req.query;
    const query = status === "all" ? {} : { status };

    const appeals = await QuizPassAppeal.find(query)
      .populate("studentId", "name email")
      .populate("quizId", "title")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: appeals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Admin reviews appeal (Approve or Reject)
 * @route PATCH /api/v2/admin/appeals/:appealId/review
 * @access Private (Admin)
 */
export const reviewAdminAppealHandler = async (req, res, next) => {
  try {
    const adminId = req.auth.userId.toString();
    const { appealId } = req.params;
    const { status, adminRemarks, deductCoins } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    const result = await reviewPassAppeal(appealId, adminId, {
      status,
      adminRemarks,
      deductCoins,
    });

    res.status(200).json({
      success: true,
      message: `Appeal successfully ${status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
