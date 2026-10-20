import mongoose from "mongoose";

const quizAssignmentSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      unique: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["primary", "backup"],
      default: "primary",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

quizAssignmentSchema.index({ instructorId: 1 });

const QuizAssignment = mongoose.model(
  "QuizAssignment",
  quizAssignmentSchema
);
export default QuizAssignment;
