import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    levelName: {
      type: String,
      required: true,
      unique: true,
      enum: ["Beginner", "Learner", "Intermediate", "Advanced", "Master", "Expert"],
    },
    minElo: {
      type: Number,
      required: true,
    },
    maxElo: {
      type: Number,
      required: true,
    },
    badge: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

levelSchema.index({ minElo: 1, maxElo: 1 });

const Level = mongoose.model("Level", levelSchema);
export default Level;
