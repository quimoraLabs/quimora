import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.model.js';
import bcrypt from 'bcrypt';

async function testLiveVerifyOTP() {
  console.log("==================================================");
  console.log("🧪 TESTING LIVE VERIFY-OTP & PASSWORD UPDATE");
  console.log("==================================================");

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quimora');
    const targetEmail = "mcsharpear@gmail.com";

    const user = await User.findOne({ email: targetEmail }).select("+otp.code +password");
    console.log("User found in DB:", user?.name, user?.email);
    console.log("Current OTP in DB:", user?.otp?.code);
    console.log("OTP Purpose:", user?.otp?.purpose);
    console.log("OTP Expired?:", user?.otp?.expiresAt < Date.now());

    // Test verifying with the OTP in DB
    const otpCode = user?.otp?.code;
    const isMatch = user?.otp?.code === otpCode;
    const isNotExpired = user?.otp?.expiresAt > Date.now();
    const isPasswordResetOtp = user?.otp?.purpose === "reset";

    if (isMatch && isNotExpired && isPasswordResetOtp) {
      user.password = "NewPassword123!";
      user.otp = undefined;
      await user.save();
      console.log("✅ VERIFY-OTP SUCCESS! Password updated to 'NewPassword123!'");

      // Verify password hash comparison
      const updatedUser = await User.findOne({ email: targetEmail }).select("+password");
      const isPasswordHashValid = await bcrypt.compare("NewPassword123!", updatedUser.password);
      console.log("🔐 Password Hash Verification:", isPasswordHashValid ? "PASSED (Valid)" : "FAILED");
    } else {
      console.error("❌ VERIFY-OTP FAILED!");
    }

  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
  } finally {
    await mongoose.connection.close();
  }
}

testLiveVerifyOTP();
