import mongoose from "mongoose";

const instructorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    expertise: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      validate: [
        function (val) {
          return val.length >= 1;
        },
        "Instructor must specify at least 1 area of expertise",
      ],
      default: ["General"],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const InstructorProfile = mongoose.model(
  "InstructorProfile",
  instructorProfileSchema
);
export default InstructorProfile;
