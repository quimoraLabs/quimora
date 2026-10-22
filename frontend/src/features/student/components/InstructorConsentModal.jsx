import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../../api/axiosClient";

export default function InstructorConsentModal({
  isOpen,
  quizId,
  quizTitle,
  onConsentConfirmed,
  onCancel,
}) {
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !quizId) return;

    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/quizzes/${quizId}/assigned-instructor`);
        if (res.data?.success && res.data?.data) {
          setInstructor(res.data.data);
        } else {
          setInstructor(null);
        }
      } catch (err) {
        console.error("Could not fetch assigned instructor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [isOpen, quizId]);

  const handleConfirm = async () => {
    if (!agreed) {
      toast.error("Please agree to the telemetry consent before proceeding.");
      return;
    }

    try {
      setSubmitting(true);
      await axiosClient.post(`/student/quiz/${quizId}/consent`);
      toast.success("Consent recorded. Initializing exam session...");
      onConsentConfirmed();
    } catch (err) {
      console.error("Failed to record consent:", err);
      toast.error("Could not record consent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-linear-to-r from-blue-500/10 via-indigo-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Instructor Transparency & Consent
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Pre-Exam Consent
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Quiz: <span className="font-semibold text-slate-800 dark:text-slate-200">{quizTitle}</span>
              </p>
            </div>

            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <p className="text-xs">Fetching verified instructor credentials...</p>
              </div>
            ) : instructor ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {instructor.avatar ? (
                    <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                  ) : (
                    instructor.name?.charAt(0).toUpperCase() || "I"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {instructor.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <UserCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {instructor.bio}
                  </p>
                  {Array.isArray(instructor.expertise) && instructor.expertise.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {instructor.expertise.map((exp, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This assessment is administered directly by Quimora Central Faculty.
                </p>
              </div>
            )}

            {/* Privacy & Telemetry Disclosure Box */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                <Lock className="w-4 h-4 text-indigo-600" />
                Data Transparency Disclosure:
              </div>
              <p className="leading-relaxed">
                By entering this exam, you agree that your detailed attempt data (questions answered, individual response accuracy, and time spent) will be shared with this primary instructor for feedback and evaluation.
              </p>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                I understand and give consent to share my test telemetry with the assigned instructor.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!agreed || submitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                agreed && !submitting
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25 cursor-pointer"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  Consent & Begin Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
