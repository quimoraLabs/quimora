import mongoose from "mongoose";

/**
 * Returns the current date formatted as YYYY-MM-DD in Asia/Kolkata (IST).
 */
export function getTodayDateIST() {
  const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" };
  const formatter = new Intl.DateTimeFormat("en-CA", options); // en-CA gives YYYY-MM-DD
  return formatter.format(new Date());
}

const practiceProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Overall Practice Gamification
    practiceLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    practiceXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String,
      default: null, // YYYY-MM-DD (IST)
    },

    // --- MODE 1: Random Mind-Game Tracker ---
    randomDrillDate: {
      type: String,
      default: null, // YYYY-MM-DD (IST)
    },
    randomDrillCompletedToday: {
      type: Boolean,
      default: false,
    },
    mode1LastResult: {
      score: { type: Number, default: 0 },
      correctCount: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      completedAt: { type: Date, default: null },
    },

    // --- MODE 2: Custom Daily Practice Tracker ---
    customPracticeDate: {
      type: String,
      default: null, // YYYY-MM-DD (IST)
    },
    customDailyTarget: {
      type: Number,
      default: 0, // 0 = Not set yet today; 1-4 = Committed
      min: 0,
      max: 4,
    },
    customAttemptsDoneToday: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    // Weak Topic Accuracy Tracking (<60% accuracy flagged)
    topicMastery: [
      {
        topicTag: {
          type: String,
          required: true,
          trim: true,
        },
        accuracy: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        totalQuestionsAnswered: {
          type: Number,
          default: 0,
        },
        correctAnswersCount: {
          type: Number,
          default: 0,
        },
        totalDrillsCompleted: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ["critical", "improving", "ready"],
          default: "critical",
        },
        lastPracticedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Checks and auto-resets daily target cycles using Asia/Kolkata (IST) midnight boundaries.
 */
practiceProfileSchema.methods.checkAndResetDailyCycles = function () {
  const todayIST = getTodayDateIST();

  // Reset Mode 1 if new calendar date in IST
  if (this.randomDrillDate !== todayIST) {
    this.randomDrillDate = todayIST;
    this.randomDrillCompletedToday = false;
  }

  // Reset Mode 2: reset target and attempts done if new calendar date in IST
  if (this.customPracticeDate !== todayIST) {
    this.customPracticeDate = todayIST;
    this.customDailyTarget = 0; // Forces setting today's new target
    this.customAttemptsDoneToday = 0;
  }
};

const PracticeProfile = mongoose.model("PracticeProfile", practiceProfileSchema);
export default PracticeProfile;
