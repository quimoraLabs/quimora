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
  Check,
  Search,
  X,
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

const FALLBACK_CORE_INTERESTS = [
  {
    _id: "core-web-foundations",
    name: "Web Foundations (HTML, CSS, JS)",
    slug: "web-foundations",
    description: "HTML5 semantic structure, CSS3 styling, Flexbox, and core JavaScript basics.",
    topicTags: ["html5", "css3", "javascript", "dom", "flexbox"],
    icon: "globe",
    isCore: true,
  },
  {
    _id: "core-modern-web",
    name: "Modern Web & Frameworks",
    slug: "modern-web",
    description: "React, Next.js, Node.js, Express, Redux state management, and REST APIs.",
    topicTags: ["react", "nodejs", "nextjs", "express", "redux"],
    icon: "layers",
    isCore: true,
  },
  {
    _id: "core-data-science",
    name: "Python & Data Science",
    slug: "data-science",
    description: "Python programming, data analysis, Pandas, NumPy, and statistics.",
    topicTags: ["python", "pandas", "numpy", "statistics", "analytics"],
    icon: "database",
    isCore: true,
  },
  {
    _id: "core-database-systems",
    name: "Database Systems (SQL & NoSQL)",
    slug: "database-systems",
    description: "SQL queries, relational databases, PostgreSQL, MongoDB, and Redis caching.",
    topicTags: ["sql", "mongodb", "postgresql", "redis", "indexing"],
    icon: "server",
    isCore: true,
  },
  {
    _id: "core-dsa",
    name: "Data Structures & Algorithms",
    slug: "dsa",
    description: "Arrays, linked lists, trees, graphs, sorting algorithms, and time complexity.",
    topicTags: ["dsa", "algorithms", "arrays", "trees", "complexity"],
    icon: "cpu",
    isCore: true,
  },
  {
    _id: "core-ai-ml",
    name: "Artificial Intelligence & ML",
    slug: "artificial-intelligence",
    description: "Machine learning fundamentals, neural networks, LLMs, and prompt engineering.",
    topicTags: ["ai", "machine-learning", "llm", "neural-networks", "groq"],
    icon: "cpu",
    isCore: true,
  },
  {
    _id: "core-cyber-security",
    name: "Cyber Security & Web Safety",
    slug: "cyber-security",
    description: "Network security, cryptography, JWT authentication, and OWASP standards.",
    topicTags: ["security", "jwt", "auth", "encryption", "owasp"],
    icon: "shield",
    isCore: true,
  },
  {
    _id: "core-cloud-devops",
    name: "Cloud Computing & DevOps",
    slug: "cloud-computing",
    description: "AWS cloud services, Docker containers, CI/CD pipelines, and Linux basics.",
    topicTags: ["docker", "aws", "cloud", "ci-cd", "linux"],
    icon: "cloud",
    isCore: true,
  },
  {
    _id: "core-mobile-apps",
    name: "Mobile App Development",
    slug: "mobile-apps",
    description: "Cross-platform mobile apps with React Native, Flutter, and UI patterns.",
    topicTags: ["react-native", "flutter", "mobile", "android", "ios"],
    icon: "smartphone",
    isCore: true,
  },
];

export default function InterestOnboardingModal({
  isOpen,
  initialSelectedIds = [],
  onClose,
  onComplete,
}) {
  const [interests, setInterests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filteredInterests = interests.filter((interest) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = interest.name?.toLowerCase().includes(q);
    const descMatch = interest.description?.toLowerCase().includes(q);
    const tagMatch = interest.topicTags?.some((tag) => tag.toLowerCase().includes(q));
    return nameMatch || descMatch || tagMatch;
  });

  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(initialSelectedIds) && initialSelectedIds.length > 0) {
        setSelectedIds(
          initialSelectedIds.map((item) =>
            typeof item === "object" ? item?._id || item?.id : item
          )
        );
      }
    }
  }, [isOpen, initialSelectedIds]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/interests");
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setInterests(res.data.data);
      } else {
        setInterests(FALLBACK_CORE_INTERESTS);
      }
    } catch (err) {
      console.error("Failed to load interests from API, falling back to core topics:", err);
      setInterests(FALLBACK_CORE_INTERESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchInterests();
  }, [isOpen]);

  // Support closing modal via Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleInterest = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 10) {
        toast.error("You can select a maximum of 10 interests.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const isCountValid = selectedIds.length >= 1 && selectedIds.length <= 10;

  const handleSubmit = async () => {
    if (!isCountValid) {
      toast.error("Please select at least 1 interest to continue.");
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
        if (onClose) onClose();
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md cursor-pointer"
        onClick={() => {
          if (onClose) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        >
          {/* Header */}
          <div className="relative p-6 md:p-8 bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-b border-slate-200 dark:border-slate-800">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Onboarding
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Choose Your Learning Interests
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
              Select <span className="font-semibold text-indigo-600 dark:text-indigo-400">1 or more topics</span> (up to 10). 
              We'll calibrate your initial Elo rating (1000) and unlock topic-specific challenges.
            </p>

            {/* Selection Counter Pill & Search Bar */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors w-fit ${
                  isCountValid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                }`}
              >
                {isCountValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {selectedIds.length === 0
                    ? "Select at least 1 topic to unlock"
                    : `${selectedIds.length} topic${selectedIds.length === 1 ? "" : "s"} selected`}
                </span>
              </div>

              {/* Quick Tech Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by tech (e.g. HTML, React, Python)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-2xs"
                />
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
            ) : filteredInterests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                {searchQuery.trim() ? (
                  <>
                    <p className="text-sm">No topics matching &quot;{searchQuery}&quot;</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm">Unable to load topics from server.</p>
                    <button
                      type="button"
                      onClick={fetchInterests}
                      className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Retry loading topics
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredInterests.map((interest) => {
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:text-indigo-600"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`font-semibold text-sm truncate transition-colors ${
                                isSelected
                                  ? "text-indigo-950 dark:text-indigo-200"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {interest.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {interest.description || "Adaptive quiz topic"}
                            </p>
                          </div>
                        </div>

                        {/* Checkbox selector: fixed 22px size with shrink-0 so it NEVER squishes */}
                        <div
                          className={`w-5.5 h-5.5 rounded-md shrink-0 flex items-center justify-center transition-all border-2 ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "border-slate-400/60 dark:border-slate-600 bg-white/50 dark:bg-slate-800/80 group-hover:border-indigo-400"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                        </div>
                      </div>

                      {/* Topic Tech Badges Preview */}
                      {Array.isArray(interest.topicTags) && interest.topicTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {interest.topicTags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border transition-colors ${
                                isSelected
                                  ? "bg-indigo-100/90 text-indigo-700 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-700"
                                  : "bg-white/80 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {interest.topicTags.length > 4 && (
                            <span className="text-[10px] font-medium text-slate-400">
                              +{interest.topicTags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 md:px-8 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
            {/* Warning / Guidance note placed directly above the button */}
            <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-medium text-center">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>* You can select up to 10 interests later in your profile.</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isCountValid || submitting}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
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
                  {selectedIds.length > 0
                    ? `Save & Unlock Quizzes (${selectedIds.length} selected)`
                    : "Select at least 1 topic"}
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
