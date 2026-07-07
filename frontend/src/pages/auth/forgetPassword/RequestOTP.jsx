// import React from 'react'
import { Mail, ArrowRight, KeyRound, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import InputGroup from "../components/InputField";
import toast from "react-hot-toast";
// import toast from "react-hot-toast";
function RequestOTP() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestSendOTP } = useAuthStore();

  const handleNextStep = async () => {
    setLoading(true);
    if(!email) {
      toast.error("Please enter your email");
      setLoading(false);
      return;
    }
    const success = await requestSendOTP(email);
    if (success) {
      // toast.success("Request OTP successfully");
      navigate("/auth/reset-password", { state: { email: email } });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div
        key="forgot"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="auth-card"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-main rounded-2xl  flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-primary/20">
            <KeyRound className="text-main w-8 h-8" />
          </div>
          <h1 className="auth-title">Forgot Password?</h1>

          <p className="text-muted text-sm mt-2">
            We'll send a verification code to your email.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <InputGroup
              label="IDENTIFY YOURSELF..."
              placeholder="MASTER@QUIMORA.COM"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="auth-icon" />}
            />
          </div>

          <button
            onClick={handleNextStep}
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Instructions"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center mt-4 text-muted flex items-center gap-2 justify-center">
          Remember your password?
          <Link
              to="/login"
              className="auth-link flex items-center gap-1 uppercase tracking-wider"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> RETREAT TO ACCESS
            </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default RequestOTP;
