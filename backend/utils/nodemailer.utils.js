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
