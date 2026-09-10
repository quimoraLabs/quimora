import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function PostQuizCreateModal({
  isOpen,
  quizTitle,
  onConfirmAI,
  onSkipManual,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-surface border border-main rounded-2xl p-6 shadow-2xl space-y-5 text-center overflow-hidden"
        >
          {/* Top Decorative Glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Success Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-display text-main">
              Quiz Created Successfully! 🎉
            </h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Do you want to automatically generate at least 5 multiple-choice questions for &quot;<span className="text-main font-semibold">{quizTitle}</span>&quot; using Quimora AI?
            </p>
          </div>

          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-purple-300">
              AI will craft 5 accurate MCQs with correct options tailored to this topic in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={onConfirmAI}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Yes, Generate 5 Questions with AI
            </button>

            <button
              type="button"
              onClick={onSkipManual}
              className="w-full py-2.5 bg-elevated hover:bg-main text-muted hover:text-main font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              No, I&apos;ll add questions manually
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
