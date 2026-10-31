import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    // Optional interestId alias for legacy test backwards-compatibility
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 1,
    },
    requiredPassingScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of chapter ordering per course
chapterSchema.index({ courseId: 1, orderIndex: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", chapterSchema);
export default Chapter;
