// import React from 'react'
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const otpInputRefs = useRef([]);
  const location = useLocation();
  const email = location.state?.email;
  const { verifyOTPAndChangePassword } = useAuthStore();

  const navigate = useNavigate();

  const neumorphicInput =
    "w-full bg-elevated rounded-xl border border-main py-4 px-12 outline-none text-main placeholder:text-muted focus:border-brand-mid focus:ring-1 focus:ring-brand-mid transition-all duration-200";
  const neumorphicButton =
    "w-full rounded-xl py-4 font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60";
  const neumorphicCard =
    "w-full max-w-md rounded-3xl bg-surface border border-main shadow-card p-8 backdrop-blur-xl transition-colors";

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Password mismatch");
      return;
    }

    if (!/^\d{6}$/.test(otp.join(""))) {
      toast.error("Enter the 6-digit OTP code");
      return;
    }

    setLoading(true);
    const success = await verifyOTPAndChangePassword({
      otpCode: otp.join(""),
      email: email,
      newPassword: password,
    });
    if (success) {
      navigate("/login");
    }
    setLoading(false);
    // console.log("success");
  };

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, otp.length);

    if (!pastedOtp) return;

    const newOtp = [...otp];
    pastedOtp.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pastedOtp.length, otp.length) - 1;
    otpInputRefs.current[focusIndex]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center my-50">
      <motion.div
        key="verify"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={neumorphicCard}
      >
        <button
          //   onClick={prevStep}
          className="absolute left-6 top-6 p-2 rounded-xl text-muted hover:text-main active:shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-surface rounded-2xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Verify & Reset
          </h1>
          <p className="text-slate-500 text-sm">
            Enter the code and your new password
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1">
              OTP Code
            </label>
            <div className="grid grid-cols-6 gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(element) => {
                    otpInputRefs.current[i] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  className="w-full aspect-square text-center text-xl font-bold bg-surface rounded-xl text-slate-700 outline-hidden shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] transition-all"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                placeholder="New password"
                className={neumorphicInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Confirm password"
                className={neumorphicInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button onClick={handleChangePassword}
          disabled={loading}
          className={neumorphicButton}>
           {loading ? "reseting passord...":" Update Password"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;
