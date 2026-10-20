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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
