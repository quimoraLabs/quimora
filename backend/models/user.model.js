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
  if (this.isNew) {
    if (!this.avatar) this.avatar = {};
    if (!this.avatar.url) {
      this.avatar.url = `https://api.dicebear.com/9.x/identicon/svg?seed=${this.username}`;
    }
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret._id;
    delete ret.otp;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
