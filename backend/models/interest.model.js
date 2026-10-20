import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    topicTags: [
      {
        type: String,
        trim: true,
      },
    ],
    icon: {
      type: String,
      default: "",
    },
    isCore: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

interestSchema.index({ topicTags: 1 });
interestSchema.index({ isCore: 1 });
interestSchema.index({ createdBy: 1 });

const Interest = mongoose.model("Interest", interestSchema);
export default Interest;
