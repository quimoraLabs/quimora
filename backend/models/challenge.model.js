import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["weekly_sprint", "monthly_cup"],
      default: "weekly_sprint",
      required: true,
    },
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interest",
      default: null,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (val) {
          return val > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    bannerImage: {
      type: String,
      default: null,
    },
    prizeDescription: {
      type: String,
      default: "Top 3 students receive Platinum Star Badges and Certificate Honors",
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    participantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

challengeSchema.virtual("status").get(function () {
  const now = new Date();
  if (now < this.startTime) return "upcoming";
  if (now > this.endTime) return "ended";
  return "active";
});

challengeSchema.set("toJSON", { virtuals: true });
challengeSchema.set("toObject", { virtuals: true });

challengeSchema.index({ type: 1, startTime: 1, endTime: 1 });

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;

