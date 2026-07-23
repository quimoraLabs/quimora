import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { removeSensitiveFields } from "../utils/helper.utils.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    avatar: {
      url: {
        type: String,
      },
      fileId: {
        type: String,
      },
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "admin", "instructor"],
      default: "user",
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: {
        type: Date,
      },
      purpose: {
        type: String,
        enum: ["reset", "verify", "login"],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function () {
  // Hash password only if it has been modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
  }

  // Set default avatar if user is new and avatar URL is missing
  if (this.isNew && !this.avatar?.url) {
    this.avatar = {
      url: `https://api.dicebear.com/9.x/identicon/svg?seed=${this.username}`,
    };
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
// Add this in your User model file temporarily
userSchema.pre('deleteOne', { document: true, query: false }, function() {
    console.log("ALERT: DELETE OPERATION TRIGGERED ON USER:", this._id);
});

userSchema.pre('findOneAndUpdate', function() {
    console.log("Updating document with query:", this.getQuery());
    console.log("Update operation:", this.getUpdate());
    // next();
});


userSchema.set("toJSON", {
  virtuals: true,
  transform: removeSensitiveFields(["password", "_id", "otp", "__v"]),
});

const User = mongoose.model("User", userSchema);
export default User;
