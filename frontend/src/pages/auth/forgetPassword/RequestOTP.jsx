// import React from 'react'
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
// import toast from "react-hot-toast";
function RequestOTP() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestSendOTP } = useAuthStore();

  const neumorphicInput =
    "w-full bg-[#f0f2f5] rounded-2xl py-4 px-12 text-slate-700 outline-hidden transition-all duration-300 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]";
  const neumorphicButton =
    "w-full bg-[#f0f2f5] rounded-2xl py-4 font-semibold text-slate-700 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center justify-center gap-2 group hover:text-blue-600";
  const neumorphicCard =
    "bg-[#f0f2f5] p-8 md:p-12 rounded-[40px] shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] w-full max-w-md relative overflow-hidden";

  const handleNextStep = async () => {
    setLoading(true);
    const success = await requestSendOTP(email);
    if (success) {
      // toast.success("Request OTP successfully");
      navigate("/auth/reset-password", { state: { email: email } });
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center my-50">
      <motion.div
        key="forgot"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={neumorphicCard}
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#f0f2f5] rounded-2xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex items-center justify-center mx-auto mb-6">
            <KeyRound className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Forgot Password?
          </h1>
          <p className="text-slate-500">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className={neumorphicInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button onClick={handleNextStep} className={neumorphicButton}
          disabled={loading}
          >
            {loading ? "requesting..." : "Send Instructions"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Wait, I remember!{" "}
          <button className="text-blue-500 font-medium hover:underline">
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default RequestOTP;
