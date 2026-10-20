import mongoose from "mongoose";

const studentQuizProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    // Decoupled Pass and Fail Trackers
    passAttemptsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPassAllowed: {
      type: Number,
      default: 3, // Base cap: 3 passes (expandable via store purchase)
    },
    failAttemptsCount: {
      type: Number,
      default: 0,
      min: 0, // STRICTLY NON-DECREASING: Never cleared or reduced
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    hasPassedOnce: {
      type: Boolean,
      default: false,
    },
    directPassUsed: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      enum: ["NONE", "FAIL_LIMIT_EXCEEDED", "PASS_LIMIT_REACHED"],
      default: "NONE",
    },
    appealStatus: {
      type: String,
      enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
      default: "NONE",
    },
    bonusFirstAttemptClaimed: {
      type: Boolean,
      default: false,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

studentQuizProgressSchema.index({ userId: 1, quizId: 1 }, { unique: true });

const StudentQuizProgress = mongoose.model(
  "StudentQuizProgress",
  studentQuizProgressSchema
);

export default StudentQuizProgress;
