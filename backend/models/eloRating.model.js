import mongoose from "mongoose";

const eloRatingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      required: true,
    },
    rating: {
      type: Number,
      default: 1000,
      min: 0,
    },
    highestRating: {
      type: Number,
      default: 1000,
    },
    quizzesAttempted: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

eloRatingSchema.index({ studentId: 1, interestId: 1 }, { unique: true });
eloRatingSchema.index({ studentId: 1, isArchived: 1 });

const EloRating = mongoose.model("EloRating", eloRatingSchema);
export default EloRating;
