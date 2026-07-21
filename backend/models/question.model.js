import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [
        {
          optionText: {
            type: String,
            required: true,
            trim: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
            default: false,
            select: false,
          },
        },
      ],
      required: true,
      validate: [
        {
          validator: (opts) => opts.length === 4,
          message: "A standard multiple-choice question must contain exactly 4 options.",
        },
        {
          validator: (opts) => opts.filter((o) => o.isCorrect).length === 1, // single correct
          message: "Exactly one correct answer required",
        },
      ],
    },

    marks: {
      type: Number,
      default: 1,
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Hides correct option flag on basic payload transformations
questionSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.options && Array.isArray(ret.options)) {
      ret.options.forEach((opt) => {
        delete opt.isCorrect;
      });
    }
    return ret;
  },
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
