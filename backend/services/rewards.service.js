import StudentQuizProgress from "../models/studentQuizProgress.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import CoinTransaction from "../models/coinTransaction.model.js";
import QuizPassAppeal from "../models/quizPassAppeal.model.js";
import Quiz from "../models/quiz.model.js";

const COSTS = {
  DIRECT_PASS: 350,
  EXTRA_PASS_ATTEMPT: 250,
  HINT_TOKEN: 50,
};

/**
 * Record attempt results, evaluate pass vs fail, and award coins
 */
export const recordAttemptRewards = async (userId, quizId, scorePercentage) => {
  let progress = await StudentQuizProgress.findOne({ userId, quizId });
  if (!progress) {
    progress = new StudentQuizProgress({ userId, quizId });
  }

  let profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    profile = new StudentProfile({ userId });
  }

  const isPass = scorePercentage >= 50;
  let coinsAwarded = 0;
  const breakdown = [];

  if (isPass) {
    // Check if student already exhausted their allowed passes
    if (progress.passAttemptsCount >= progress.maxPassAllowed || (progress.isLocked && progress.lockReason === "PASS_LIMIT_REACHED")) {
      progress.isLocked = true;
      progress.lockReason = "PASS_LIMIT_REACHED";
      await progress.save();
      const err = new Error(
        `Pass attempt limit (${progress.maxPassAllowed}) reached for this quiz.`
      );
      err.statusCode = 403;
      throw err;
    }

    // 1. Increment pass counter strictly capped at maxPassAllowed (never exceeds)
    progress.passAttemptsCount = Math.min(progress.passAttemptsCount + 1, progress.maxPassAllowed);
    progress.hasPassedOnce = true;

    // 2. Base Coins calculation based on score percentage
    const baseCoins = Math.round(scorePercentage * 1.5);
    coinsAwarded += baseCoins;
    breakdown.push({ label: "Score Performance", amount: baseCoins });

    // 3. High Scorer 90%+ Bonus
    if (scorePercentage >= 90) {
      const bonus90 = 75;
      coinsAwarded += bonus90;
      breakdown.push({ label: "90%+ Mastery Bonus", amount: bonus90 });
    }

    // 4. First-Attempt Pass Bonus
    if (
      progress.passAttemptsCount === 1 &&
      progress.failAttemptsCount === 0 &&
      !progress.bonusFirstAttemptClaimed
    ) {
      const firstTryBonus = 100;
      coinsAwarded += firstTryBonus;
      progress.bonusFirstAttemptClaimed = true;
      breakdown.push({ label: "First Try Pass Bonus", amount: firstTryBonus });
    }

    // Lock immediately once maximum allowed passes reached
    if (progress.passAttemptsCount >= progress.maxPassAllowed) {
      progress.isLocked = true;
      progress.lockReason = "PASS_LIMIT_REACHED";
    }
  } else {
    // FAIL: Check if student already exhausted their 6 allowed fail attempts
    if (progress.failAttemptsCount >= 6 || (progress.isLocked && progress.lockReason === "FAIL_LIMIT_EXCEEDED")) {
      progress.isLocked = true;
      progress.lockReason = "FAIL_LIMIT_EXCEEDED";
      await progress.save();
      const err = new Error("Quiz is locked due to reaching 6 failed attempts. Please submit an Admin Appeal to proceed.");
      err.statusCode = 403;
      throw err;
    }

    // STRICTLY increment fail counter only, capped at 6 (never exceeds 6)
    progress.failAttemptsCount = Math.min(progress.failAttemptsCount + 1, 6);

    // Modest participation coins
    const participation = Math.max(5, Math.round(scorePercentage * 0.5));
    coinsAwarded += participation;
    breakdown.push({ label: "Attempt Participation", amount: participation });

    // Lock immediately if 6 failed attempts reached
    if (progress.failAttemptsCount >= 6) {
      progress.isLocked = true;
      progress.lockReason = "FAIL_LIMIT_EXCEEDED";
    }
  }

  // Update progress metadata
  progress.totalSubmissions += 1;
  progress.bestScore = Math.max(progress.bestScore, scorePercentage);
  progress.lastAttemptAt = new Date();
  await progress.save();

  // Credit coins to student profile
  profile.coinsBalance = (profile.coinsBalance || 0) + coinsAwarded;
  profile.totalAttempts = (profile.totalAttempts || 0) + 1;
  profile.lastAttemptAt = new Date();
  await profile.save();

  // Record audit transaction
  await CoinTransaction.create({
    userId,
    quizId,
    amount: coinsAwarded,
    type: isPass ? "QUIZ_SCORE_REWARD" : "QUIZ_SCORE_REWARD",
    balanceAfter: profile.coinsBalance,
    description: `Earned ${coinsAwarded} coins on quiz attempt (${scorePercentage}%)`,
  });

  return {
    progress,
    coinsAwarded,
    breakdown,
    newBalance: profile.coinsBalance,
    isPass,
  };
};

/**
 * Buy Direct Pass / Skip Quiz using Coins
 * RULES:
 * 1. failAttemptsCount must be < 6 (if >= 6, admin appeal required)
 * 2. passAttemptsCount must be < maxPassAllowed (strictly capped at 3 or unlocked limit)
 * 3. failAttemptsCount NEVER decrements
 */
export const purchaseDirectPass = async (userId, quizId) => {
  let progress = await StudentQuizProgress.findOne({ userId, quizId });
  if (!progress) {
    progress = new StudentQuizProgress({ userId, quizId });
  }

  // Guard 1: Cannot exceed maximum allowed passes without buying extra pass attempt
  if (progress.passAttemptsCount >= progress.maxPassAllowed) {
    const err = new Error(
      `Cannot apply Direct Pass: Maximum pass limit (${progress.maxPassAllowed}) already reached for this quiz.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Guard 2: If fail attempts >= 6, direct coin purchase is blocked (requires Admin appeal)
  if (progress.failAttemptsCount >= 6) {
    const err = new Error(
      "Direct Pass with coins is unavailable because you have reached 6 fail attempts. Please submit an Admin Appeal."
    );
    err.statusCode = 403;
    throw err;
  }

  const profile = await StudentProfile.findOne({ userId });
  if (!profile || (profile.coinsBalance || 0) < COSTS.DIRECT_PASS) {
    const err = new Error(
      `Insufficient coins. Required: ${COSTS.DIRECT_PASS} coins. Current balance: ${profile?.coinsBalance || 0}`
    );
    err.statusCode = 400;
    throw err;
  }

  // Deduct coins
  profile.coinsBalance -= COSTS.DIRECT_PASS;
  await profile.save();

  // Apply Direct Pass (FAIL COUNT IS NEVER REDUCED OR CLEARED)
  progress.passAttemptsCount += 1;
  progress.hasPassedOnce = true;
  progress.directPassUsed = true;

  if (progress.passAttemptsCount >= progress.maxPassAllowed) {
    progress.isLocked = true;
    progress.lockReason = "PASS_LIMIT_REACHED";
  }
  await progress.save();

  // Audit transaction
  await CoinTransaction.create({
    userId,
    quizId,
    amount: -COSTS.DIRECT_PASS,
    type: "STORE_DIRECT_PASS",
    balanceAfter: profile.coinsBalance,
    description: `Redeemed Direct Pass for quiz (${COSTS.DIRECT_PASS} coins)`,
  });

  return {
    success: true,
    progress,
    newBalance: profile.coinsBalance,
  };
};

/**
 * Buy Extra Pass Attempt (+1 maxPassAllowed)
 */
export const purchaseExtraPassAttempt = async (userId, quizId) => {
  let progress = await StudentQuizProgress.findOne({ userId, quizId });
  if (!progress) {
    progress = new StudentQuizProgress({ userId, quizId });
  }

  const profile = await StudentProfile.findOne({ userId });
  if (!profile || (profile.coinsBalance || 0) < COSTS.EXTRA_PASS_ATTEMPT) {
    const err = new Error(
      `Insufficient coins. Required: ${COSTS.EXTRA_PASS_ATTEMPT} coins. Current balance: ${profile?.coinsBalance || 0}`
    );
    err.statusCode = 400;
    throw err;
  }

  // Deduct coins
  profile.coinsBalance -= COSTS.EXTRA_PASS_ATTEMPT;
  await profile.save();

  // Unlock an extra pass attempt
  progress.maxPassAllowed += 1;
  if (progress.lockReason === "PASS_LIMIT_REACHED" && progress.failAttemptsCount < 6) {
    progress.isLocked = false;
    progress.lockReason = "NONE";
  }
  await progress.save();

  await CoinTransaction.create({
    userId,
    quizId,
    amount: -COSTS.EXTRA_PASS_ATTEMPT,
    type: "STORE_EXTRA_PASS_ATTEMPT",
    balanceAfter: profile.coinsBalance,
    description: `Purchased +1 extra pass attempt allotment (${COSTS.EXTRA_PASS_ATTEMPT} coins)`,
  });

  return {
    success: true,
    progress,
    newBalance: profile.coinsBalance,
  };
};

/**
 * Submit Admin Appeal when failAttemptsCount >= 6
 */
export const submitPassAppeal = async (userId, quizId, studentNotes = "") => {
  const progress = await StudentQuizProgress.findOne({ userId, quizId });
  if (!progress || progress.failAttemptsCount < 6) {
    const err = new Error(
      "Admin appeal can only be submitted if you have reached 6 or more fail attempts."
    );
    err.statusCode = 400;
    throw err;
  }

  // Check if there is already a pending appeal
  const existingPending = await QuizPassAppeal.findOne({
    studentId: userId,
    quizId,
    status: "pending",
  });

  if (existingPending) {
    const err = new Error("An appeal for this quiz is already pending Admin review.");
    err.statusCode = 400;
    throw err;
  }

  const appeal = await QuizPassAppeal.create({
    studentId: userId,
    quizId,
    failAttemptsCount: progress.failAttemptsCount,
    studentNotes,
    status: "pending",
  });

  progress.appealStatus = "PENDING";
  await progress.save();

  return appeal;
};

/**
 * Admin Review Appeal (Approve or Reject)
 */
export const reviewPassAppeal = async (
  appealId,
  adminId,
  { status, adminRemarks = "", deductCoins = false }
) => {
  const appeal = await QuizPassAppeal.findById(appealId);
  if (!appeal) {
    const err = new Error("Appeal request not found");
    err.statusCode = 404;
    throw err;
  }

  if (appeal.status !== "pending") {
    const err = new Error(`Appeal is already ${appeal.status}`);
    err.statusCode = 400;
    throw err;
  }

  const progress = await StudentQuizProgress.findOne({
    userId: appeal.studentId,
    quizId: appeal.quizId,
  });

  if (status === "approved") {
    appeal.status = "approved";
    appeal.reviewedBy = adminId;
    appeal.reviewedAt = new Date();
    appeal.adminRemarks = adminRemarks;

    if (progress) {
      // Ensure there is room for the pass attempt
      if (progress.passAttemptsCount >= progress.maxPassAllowed) {
        progress.maxPassAllowed += 1;
      }
      progress.passAttemptsCount += 1;
      progress.hasPassedOnce = true;
      progress.directPassUsed = true;
      progress.isLocked = false;
      progress.lockReason = "NONE";
      progress.appealStatus = "APPROVED";
      await progress.save();
    }

    if (deductCoins) {
      const profile = await StudentProfile.findOne({ userId: appeal.studentId });
      if (profile && profile.coinsBalance >= COSTS.DIRECT_PASS) {
        profile.coinsBalance -= COSTS.DIRECT_PASS;
        appeal.coinsDeducted = COSTS.DIRECT_PASS;
        await profile.save();

        await CoinTransaction.create({
          userId: appeal.studentId,
          quizId: appeal.quizId,
          amount: -COSTS.DIRECT_PASS,
          type: "ADMIN_APPEAL_DEDUCTION",
          balanceAfter: profile.coinsBalance,
          description: `Coins deducted for Admin approved Direct Pass waiver`,
        });
      }
    }
  } else if (status === "rejected") {
    appeal.status = "rejected";
    appeal.reviewedBy = adminId;
    appeal.reviewedAt = new Date();
    appeal.adminRemarks = adminRemarks;

    if (progress) {
      progress.appealStatus = "REJECTED";
      await progress.save();
    }
  }

  await appeal.save();
  return { appeal, progress };
};
