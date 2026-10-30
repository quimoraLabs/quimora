import mongoose from "mongoose";

const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["random_mind_game", "custom_drill"],
      required: true,
    },
    selectedScope: {
      type: {
        type: String,
        enum: ["topic", "chapter", "subject"],
        default: "topic",
      },
      targetName: {
        type: String,
        default: "",
      },
    },
    topicsCovered: [
      {
        type: String,
        trim: true,
      },
    ],
    questions: [
      {
        questionText: { type: String, required: true },
        options: [
          {
            optionText: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        explanation: { type: String, default: "" },
        topicTag: { type: String, default: "" },
        selectedOptionIndex: { type: Number, default: -1 },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    timeLimitMinutes: {
      type: Number,
      default: 10,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0, // 0 - 100%
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

practiceSessionSchema.index({ userId: 1, mode: 1, createdAt: -1 });

const PracticeSession = mongoose.model("PracticeSession", practiceSessionSchema);
export default PracticeSession;

