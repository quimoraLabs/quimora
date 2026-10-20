import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    interests: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Interest",
        },
      ],
      validate: [
        function (val) {
          return val.length <= 10;
        },
        "Student cannot select more than 10 interests",
      ],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalQuizzesAttempted: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    coinsBalance: {
      type: Number,
      default: 100, // Starter welcome gift
      min: 0,
    },
    hintTokens: {
      type: Number,
      default: 3, // Starter hints
      min: 0,
    },
    unlockedBadges: [
      {
        badgeId: String,
        title: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    activeTheme: {
      type: String,
      default: "default",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
