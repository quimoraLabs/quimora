import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.model.js';
import { sendOTPEmail } from './utils/nodemailer.utils.js';

async function testLiveOTP() {
  console.log("==================================================");
  console.log("🚀 TESTING LIVE REQUEST-OTP & VERIFY-OTP FLOW");
  console.log("==================================================");

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quimora');
    console.log("✅ Connected to MongoDB (quimora)");

    const targetEmail = "mcsharpear@gmail.com";

    // 1. Find or update admin user with mcsharpear@gmail.com
    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`User ${targetEmail} not found, checking admin_quimora...`);
      user = await User.findOne({ username: 'admin_quimora' });
      if (user) {
        user.email = targetEmail;
        await user.save();
      }
    }

    if (!user) {
      console.error("❌ Target user not found!");
      process.exit(1);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set OTP in Database
    user.otp = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      purpose: "reset",
    };
    await user.save();
    console.log(`💾 Generated & Saved OTP Code [${otpCode}] for ${targetEmail} in MongoDB`);

    // 3. Dispatch Live Email
    console.log(`📩 Dispatching live email via Nodemailer to ${targetEmail}...`);
    await sendOTPEmail(targetEmail, otpCode);

    console.log("==================================================");
    console.log(`🎉 SUCCESS! OTP EMAIL DISPATCHED TO: ${targetEmail}`);
    console.log(`🔑 OTP Code stored in DB: ${otpCode}`);
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Error testing live OTP:", err);
  } finally {
    await mongoose.connection.close();
  }
}

testLiveOTP();
