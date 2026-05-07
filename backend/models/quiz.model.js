import mongoose from "mongoose";
import questionSchema from "./question.model.js";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: [
        {
          validator: (q) => Array.isArray(q) && q.length > 0,
          message: "At least one question is required",
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: { type: [String], default: [] },
    timeLimit: {
      type: Number, // Time limit in minutes
      default: 10,
      min: 5,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true, versionKey: false },
);

quizSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    (delete ret._id,
      delete ret.__v,
      ret.questions.forEach((q) => {
        delete q._id;
        delete q.__v;
        q.options.forEach((opt) => {
          delete opt._id;
          delete opt.__v;
          // delete opt.isCorrect; // 🔒 hide correct answer in JSON output
        });
      }));
    return ret;
  },
});

quizSchema.set("toObject", {
  virtuals: true,
});

quizSchema.virtual("isAvailable").get(function () {
  const now = new Date();
  return (
    this.status === "published" &&
    (!this.startDate || now >= this.startDate) &&
    (!this.endDate || now <= this.endDate)
  );
});

quizSchema.virtual("totalMarks").get(function () {
  return (this.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0);
});

quizSchema.index({ status: 1, startDate: 1, endDate: 1 });
quizSchema.index({ createdBy: 1 });

quizSchema.pre("save", function () {
  if (this.status === "published" && this.questions.length === 0) {
    throw new Error("Cannot publish quiz without questions");
  }
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
