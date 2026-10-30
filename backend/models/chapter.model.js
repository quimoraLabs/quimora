import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
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
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of chapter ordering per interest domain
chapterSchema.index({ interestId: 1, orderIndex: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", chapterSchema);
export default Chapter;

