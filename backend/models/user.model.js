import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
        expires: 0,
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
  if (!this.isModified("password")) return;
  if (!this.avatar.url) {
    this.avatar.url = `https://api.dicebear.com/9.x/identicon/svg?seed=${this.username}`;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
