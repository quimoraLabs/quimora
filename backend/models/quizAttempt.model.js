import mongoose from "mongoose";

const answerSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Supports single choice (string), multiple choice (array), or true/false
    selectedOptions: [
      {
        type: String,
        required: true,
      },
    ],
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Tracks how long the user spent specifically on this question (in seconds)
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
); // Disabling _id for sub-documents optimizes database size

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Indexed for rapid user dashboard statistics generation
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
    index: true,
  },
  // Storing a copy of total questions prevents stats breaking if the admin deletes a question later
  totalQuestions: {
    type: Number,
    required: true,
  },
  corectAnswerCount: {
    type: Number,
    required: true,
    default: 0,
  },
  score: {
    type: Number,
    required: true,
    default: 0, // Percentage score (e.g., 85.5) or absolute marks points
  },

  // Detailed mapping profile array of every question handled during the session
  answers: [answerSnapshotSchema],

  // Tracks total time taken to finish the entire exam (in seconds)
  timeTaken: {
    type: Number,
    required: true,
    default: 0,
  },
  status:{
    type:String,
    required:true,
    enum:["started","completed","abandoned"],
    default:"started"
  },
  startedAt:{
    type:Date,
    default:Date.now
  },
  completedAt:{
    type:Date
  }
},{timestamps:true});

// Compound index to quickly find how many times a specific user attempted a specific quiz
quizAttemptSchema.index({ userId: 1, quizId: 1 });

const QuizAttempt = mongoose.model("QuizAttempt",quizAttemptSchema);

export default QuizAttempt;


