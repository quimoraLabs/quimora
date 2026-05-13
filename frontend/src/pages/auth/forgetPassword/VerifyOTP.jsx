// import React from 'react'
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const email = location.state?.email;
  const { verifyOTPAndChangePassword } = useAuthStore();

  const navigate = useNavigate();

  const neumorphicInput =
    "w-full bg-[#f0f2f5] rounded-2xl py-4 px-12 text-slate-700 outline-hidden transition-all duration-300 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]";
  const neumorphicButton =
    "w-full bg-[#f0f2f5] rounded-2xl py-4 font-semibold text-slate-700 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center justify-center gap-2 group hover:text-blue-600";
  const neumorphicCard =
    "bg-[#f0f2f5] p-8 md:p-12 rounded-[40px] shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] w-full max-w-md relative overflow-hidden";

  const handleChangePassword = async () => {
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Password mismatch");
      return;
    }
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
          className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 active:shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#f0f2f5] rounded-2xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex items-center justify-center mx-auto mb-6">
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
                  type="text"
                  maxLength={1}
                  className="w-full aspect-square text-center text-xl font-bold bg-[#f0f2f5] rounded-xl text-slate-700 outline-hidden shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] transition-all"
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[i] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && i < 6) {
                      e.currentTarget.nextSibling?.focus();
                    }
                  }}
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
