// import React from 'react'
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
// import toast from "react-hot-toast";
function RequestOTP() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestSendOTP } = useAuthStore();

  const neumorphicInput =
    "w-full bg-elevated rounded-xl border border-main py-4 px-12 outline-none text-main placeholder:text-muted focus:border-brand-mid focus:ring-1 focus:ring-brand-mid transition-all duration-200";
  const neumorphicButton =
    "w-full rounded-xl py-4 font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-60";
  const neumorphicCard =
    "w-full max-w-md rounded-3xl bg-surface border border-main shadow-card p-8 backdrop-blur-xl transition-colors";

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
    <div className="min-h-screen flex items-center justify-center bg-main px-4">
      <motion.div
        key="forgot"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={neumorphicCard}
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-main rounded-2xl  flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-primary/20">
            <KeyRound className="text-main w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main">Forgot Password?</h1>

          <p className="text-muted mt-2">
            We'll send a verification code to your email.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email"
              className={neumorphicInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={handleNextStep}
            className={neumorphicButton}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Instructions"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center mt-8 text-muted">
          Remember your password?
          <Link
            to="/login"
            className="text-accent font-semibold hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default RequestOTP;
