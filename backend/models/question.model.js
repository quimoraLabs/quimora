import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
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
        },
      },
    ],
    required: true,
    validate: [
      {
        validator: (opts) => opts.length >= 2,
        message: "At least 2 options are required",
      },
      {
        validator: (opts) => opts.filter(o => o.isCorrect).length === 1, // single correct
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
    default: "medium",
  },
});

export default questionSchema;