import mongoose from "mongoose";

const quizPassAppealSchema = new mongoose.Schema(
  {
    studentId: {
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
    failAttemptsCount: {
      type: Number,
      required: true, // Must be >= 6
    },
    studentNotes: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    coinsDeducted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

quizPassAppealSchema.index({ studentId: 1, quizId: 1, status: 1 });

const QuizPassAppeal = mongoose.model("QuizPassAppeal", quizPassAppealSchema);

export default QuizPassAppeal;
