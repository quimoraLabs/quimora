import mongoose from "mongoose";

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
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Question",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: { type: [String], default: [] },
    timeLimit: {
      type: Number,
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
  { timestamps: true, versionKey: false }
);

quizSchema.virtual("isAvailable").get(function () {
  const now = new Date();
  return (
    this.status === "published" &&
    this.isActive &&
    (!this.startDate || now >= this.startDate) &&
    (!this.endDate || now <= this.endDate)
  );
});

quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });

quizSchema.index({ status: 1, startDate: 1, endDate: 1 });
quizSchema.index({ createdBy: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;