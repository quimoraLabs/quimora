import nodemailer from 'nodemailer'
import config from '../config/config.js';

export const generateOTPTemplate = (otpCode) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
      </div>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        Hello, <br><br>
        We received a request to reset your password. Use the verification code below to proceed. This code is valid for <strong>10 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; background: #f0f7ff; padding: 10px 25px; border-radius: 5px; border: 1px dashed #4A90E2;">
          ${otpCode}
        </span>
      </div>
      <p style="font-size: 14px; color: #888;">
        If you did not request this, please ignore this email or contact support if you have concerns.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} Quimora. All rights reserved.
      </p>
    </div>
  `;
};

export const generateReattemptApprovalTemplate = (
  userName,
  quizTitle,
  reattemptLink,
  expiresInHours = 2
) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e1e1e1; border-radius: 12px; background-color: #ffffff;">
      
      <!-- Top Icon Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background-color: #e8f5e9; color: #2e7d32; border-radius: 50%; display: inline-block; line-height: 60px; font-size: 30px; font-weight: bold;">
          ✓
        </div>
        <h2 style="color: #2e7d32; margin: 10px 0 0 0; font-size: 22px;">Re-attempt Approved!</h2>
        <p style="color: #777; font-size: 13px; margin-top: 4px;">Quimora Examination Portal</p>
      </div>
      
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        Hello <strong>${userName || "Student"}</strong>,
      </p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        Great news! Your request for a re-attempt on <strong>"${quizTitle}"</strong> has been reviewed and <span style="color: #2e7d32; font-weight: bold;">APPROVED</span>.
      </p>

      <!-- Warning Box with Clock Emoji -->
      <div style="background-color: #fff8e1; border-left: 4px solid #ffa000; padding: 12px 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #b78103; font-weight: 500;">
          ⏱️ <strong>Time Limit Notice:</strong> This activation link will automatically expire in <strong>${expiresInHours} Hours</strong>.
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reattemptLink}" 
           target="_blank" 
           style="background-color: #2e7d32; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 15px; font-weight: bold; border-radius: 6px; display: inline-block;">
          🚀 Start Re-attempt Session
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
      
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} Quimora. All rights reserved.
      </p>
    </div>
  `;
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPass, // Use an App Password here
  },
});

export const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: config.emailUser,
    to: email,
    subject: "Your Password Reset OTP",
     html: generateOTPTemplate(otpCode),
  };
  await transporter.sendMail(mailOptions);
};


