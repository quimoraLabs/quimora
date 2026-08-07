import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Loader2, X } from "lucide-react";

const AiGeneratorBanner = ({ onQuizGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Free tier usage stored in state/localStorage
  const [remainingGenerations, setRemainingGenerations] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (remainingGenerations <= 0 || !prompt.trim()) return;

    setIsGenerating(true);

    // Simulate API Call for Free Tier AI Generation
    setTimeout(() => {
      const mockGeneratedQuiz = {
        id: Date.now(),
        title: prompt,
        questions: 5,
        attempts: 0,
        avgScore: "--",
        status: "Draft",
      };

      setRemainingGenerations((prev) => prev - 1);
      setIsGenerating(false);
      setIsOpen(false);
      setPrompt("");
      if (onQuizGenerated) onQuizGenerated(mockGeneratedQuiz);
    }, 2000);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden bg-linear-to-br from-blue-900/40 via-purple-900/30 to-surface border border-blue-500/30 rounded-2xl p-5 shadow-card"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
          <Zap className="w-3 h-3" /> {remainingGenerations} Free Left
        </div>

        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h4 className="font-display text-sm font-semibold text-main">
            Generate Quiz with AI
          </h4>
        </div>

        <p className="text-muted text-xs mb-4 leading-relaxed">
          Instantly generate questions and answers using text notes or topic
          prompts.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          disabled={remainingGenerations === 0}
          className="w-full py-2.5 bg-accent text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {remainingGenerations > 0
            ? "Try AI Quiz Generator"
            : "Free Limit Reached"}
        </button>
      </motion.div>

      {/* Free Tier AI Generation Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-main rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  <Sparkles className="w-4 h-4" /> AI Quiz Builder (Free Tier)
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted hover:text-main"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Enter Topic or Paste Notes
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. React custom hooks lifecycle, state management"
                    className="w-full p-3 rounded-xl bg-elevated border border-main text-xs text-main focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs text-muted hover:text-main"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiGeneratorBanner;
