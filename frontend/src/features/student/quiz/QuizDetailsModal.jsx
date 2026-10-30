import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BookOpen,
  Clock,
  HelpCircle,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function QuizDetailsModal({ isOpen, onClose, quiz, onStartQuiz }) {
  if (!isOpen || !quiz) return null;

  const totalQuestions = quiz.questions?.length || 15;
  const timeLimit = quiz.timeLimit || 15;
  const maxAttempts = Math.min(Number(quiz.maxAttempts) || 3, 3);
  const attemptsUsed = Number(quiz.attemptsUsed) || 0;
  const attemptsRemaining = quiz.attemptsRemaining !== undefined
    ? Math.min(Number(quiz.attemptsRemaining), Math.max(0, maxAttempts - attemptsUsed))
    : Math.max(0, maxAttempts - attemptsUsed);
  const isExhausted = attemptsRemaining <= 0 || quiz.canAttempt === false;

  const instructorName = quiz.instructor?.name || quiz.createdBy?.name || "Quimora Faculty";
  const instructorDept = quiz.instructor?.department || "Academic Evaluation Wing";

  // Derive syllabus topics from tags, title or questions
  const topics = Array.isArray(quiz.tags) && quiz.tags.length > 0
    ? quiz.tags
    : [quiz.title, "Core Fundamentals", "Applied Problem Solving", "Time Efficiency"];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-surface border border-main rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-main pb-4 mb-4 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" />
                  {quiz.level || "Standard Tier"}
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-main text-muted border border-main">
                  Code: #{String(quiz._id || quiz.id).slice(-6).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-main tracking-tight truncate">
                {quiz.title}
              </h2>
              <p className="text-xs text-muted mt-0.5 line-clamp-2">
                {quiz.description || "Comprehensive skill calibration quiz designed to test concept application and speed under time constraints."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-main rounded-full hover:bg-main transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto space-y-5 pr-1 text-sm">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-main/70 rounded-2xl border border-main text-center">
                <Clock className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-2xs uppercase tracking-wider font-bold text-muted">Duration</p>
                <p className="text-sm font-bold text-main mt-0.5">{timeLimit} Mins</p>
              </div>

              <div className="p-3 bg-main/70 rounded-2xl border border-main text-center">
                <HelpCircle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-2xs uppercase tracking-wider font-bold text-muted">Questions</p>
                <p className="text-sm font-bold text-main mt-0.5">{totalQuestions} Qs</p>
              </div>

              <div className="p-3 bg-main/70 rounded-2xl border border-main text-center">
                <Award className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-2xs uppercase tracking-wider font-bold text-muted">Pass Mark</p>
                <p className="text-sm font-bold text-main mt-0.5">50% Minimum</p>
              </div>

              <div className="p-3 bg-main/70 rounded-2xl border border-main text-center">
                <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-2xs uppercase tracking-wider font-bold text-muted">Attempts</p>
                <p className={`text-sm font-bold mt-0.5 ${isExhausted ? "text-red-500" : "text-main"}`}>
                  {attemptsRemaining} / {maxAttempts} Left
                </p>
              </div>
            </div>

            {/* Evaluator Badge */}
            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {instructorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-main">{instructorName}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Evaluator
                    </span>
                  </div>
                  <p className="text-2xs text-muted">
                    Curriculum Lead &bull; {instructorDept}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-2xs font-semibold px-2 py-0.5 rounded-md bg-surface text-muted border border-main">
                Official Certification
              </span>
            </div>

            {/* Topics & Syllabus Outline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-main">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Syllabus Topics Covered in this Quiz</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-main border border-main text-xs font-semibold text-main hover:border-indigo-500/40 transition-colors"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Test Rules & Proctoring Advisory */}
            <div className="p-3.5 rounded-2xl bg-main/50 border border-main text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-main">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Proctored Session Rules:</span>
              </div>
              <ul className="list-disc list-inside text-muted space-y-1 pl-1">
                <li>Fullscreen lock is enforced throughout the examination.</li>
                <li>Tab switching, window minimize, or dev tools trigger security infraction flags.</li>
                <li>Each question carries ~1 minute standard calculation pace.</li>
              </ul>
            </div>
          </div>

          {/* Modal Footer CTA */}
          <div className="flex items-center justify-between border-t border-main pt-4 mt-4 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-main text-xs font-semibold text-muted hover:text-main hover:bg-main transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onClose();
                onStartQuiz(quiz);
              }}
              disabled={isExhausted}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isExhausted
                  ? "bg-gray-400 dark:bg-zinc-700 opacity-60 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 cursor-pointer hover:scale-[1.02]"
              }`}
            >
              <span>{isExhausted ? "Attempt Limit Reached" : "Proceed to Instructions"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
