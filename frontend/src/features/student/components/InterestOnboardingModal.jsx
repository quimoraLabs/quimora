import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Globe,
  Database,
  Smartphone,
  Cpu,
  Shield,
  Cloud,
  Server,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../../api/axiosClient";

const ICON_MAP = {
  globe: Globe,
  database: Database,
  smartphone: Smartphone,
  cpu: Cpu,
  shield: Shield,
  cloud: Cloud,
  server: Server,
  layers: Layers,
};

export default function InterestOnboardingModal({ isOpen, onComplete }) {
  const [interests, setInterests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchInterests = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/interests");
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setInterests(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load interests:", err);
        toast.error("Could not load interest topics. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [isOpen]);

  const toggleInterest = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 6) {
        toast.error("You can select a maximum of 6 interests during onboarding.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const isCountValid = selectedIds.length >= 5 && selectedIds.length <= 6;

  const handleSubmit = async () => {
    if (!isCountValid) {
      toast.error("Please select 5 or 6 interests to complete onboarding.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.post("/interests/student/onboarding", {
        interestIds: selectedIds,
      });

      if (res.data?.success) {
        toast.success("Welcome aboard! Your personalized quizzes are ready.");
        if (onComplete) onComplete(res.data.data);
      }
    } catch (err) {
      console.error("Error saving onboarding interests:", err);
      const msg = err.response?.data?.message || "Failed to save interests. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Onboarding
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Choose Your Learning Interests
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
              Select <span className="font-semibold text-indigo-600 dark:text-indigo-400">5 to 6 topics</span>. 
              We'll calibrate your initial Elo rating (1000) and unlock topic-specific challenges.
            </p>

            {/* Selection Counter Pill */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  isCountValid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : selectedIds.length > 6
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                }`}
              >
                {isCountValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {selectedIds.length} of 5-6 selected
                  {selectedIds.length < 5 && ` (need ${5 - selectedIds.length} more)`}
                  {isCountValid && " — Perfect!"}
                </span>
              </div>
            </div>
          </div>

          {/* Body / Interests Grid */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Loading topics & skill bands...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {interests.map((interest) => {
                  const isSelected = selectedIds.includes(interest._id);
                  const IconComponent = ICON_MAP[interest.icon] || Globe;

                  return (
                    <div
                      key={interest._id}
                      onClick={() => toggleInterest(interest._id)}
                      className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-500 shadow-md shadow-indigo-500/10 dark:bg-indigo-950/40 dark:border-indigo-500"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:text-indigo-600"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4
                              className={`font-semibold text-sm transition-colors ${
                                isSelected
                                  ? "text-indigo-950 dark:text-indigo-200"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {interest.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {interest.description || "Adaptive quiz topic"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Topic Tags Preview */}
                      {Array.isArray(interest.topicTags) && interest.topicTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {interest.topicTags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                  : "bg-slate-200/60 text-slate-600 dark:bg-slate-750 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              * You can add up to 10 interests later in your profile.
            </span>

            <button
              onClick={handleSubmit}
              disabled={!isCountValid || submitting}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                isCountValid && !submitting
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25 cursor-pointer"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                <>
                  Unlock Quizzes
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
