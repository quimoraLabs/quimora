// import React from 'react'
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import InputGroup from "../components/InputField";
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

const isBackShow = location.key !== 'default';
  

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
      navigate("/login", { replace: true });
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
    <div className="auth-page">
      <motion.div
        key="verify"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="auth-card"
      >
        {isBackShow && (
          <button
            //   onClick={prevStep}
            className="absolute left-6 top-6 p-2 rounded-xl text-muted hover:text-main transition-all"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-elevated rounded-2xl  flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="auth-title">Verify & Reset</h1>
          <p className="text-muted text-sm">
            Enter the code and your new password
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="auth-label" htmlFor="otp">
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
                  autocomplete="one-time-code"
                  className="w-full aspect-square
                  border border-main bg-elevated 
                  rounded-xl text-center text-xl font-bold text-muted outline-hidden transition-all"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <InputGroup
              type="password"
              placeholder="New password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="auth-icon" />}
            />
            <InputGroup
              type="password"
              placeholder="Confirm password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="auth-icon" />}
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? "reseting passord..." : " Update Password"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;
