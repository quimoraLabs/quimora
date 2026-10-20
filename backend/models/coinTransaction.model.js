import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // Positive for earned, negative for spent
    },
    type: {
      type: String,
      enum: [
        "QUIZ_SCORE_REWARD",
        "BONUS_90_PERCENT",
        "BONUS_FIRST_TRY_PASS",
        "STORE_EXTRA_PASS_ATTEMPT",
        "STORE_DIRECT_PASS",
        "STORE_HINT_TOKEN",
        "STORE_COSMETIC_BADGE",
        "ADMIN_APPEAL_DEDUCTION",
      ],
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
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

coinTransactionSchema.index({ userId: 1, createdAt: -1 });

const CoinTransaction = mongoose.model(
  "CoinTransaction",
  coinTransactionSchema
);

export default CoinTransaction;
