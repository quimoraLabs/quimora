import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Zap, Loader2, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useQuestionStore from "../../question/store/useQuestionStore";
import useQuizStore from "../../quiz/store/useQuizStore";
import toast from "react-hot-toast";

const SAMPLE_PROMPTS = [
  {
    title: "React Hooks & State",
    topic: "React Hooks & State Management",
    difficulty: "medium",
    context: "Include useEffect edge cases, useState batching, and custom hooks.",
  },
  {
    title: "JS Async & Promises",
    topic: "JavaScript Async & Promises",
    difficulty: "medium",
    context: "Cover event loop, microtasks, Promise.all, and async/await.",
  },
  {
    title: "Python Data Structures",
    topic: "Python Data Structures & OOP",
    difficulty: "easy",
    context: "Cover lists, dicts, class inheritance, and magic methods.",
  },
  {
    title: "Web Security & Auth",
    topic: "Web Security & JWT Authentication",
    difficulty: "hard",
    context: "Focus on XSS, CSRF, CORS, password hashing, and token refresh.",
  },
];

const AiGeneratorBanner = ({ onQuizGenerated }) => {
  const navigate = useNavigate();
  const { generateAIQuestions, importBulkQuestions } = useQuestionStore();
  const { createQuiz } = useQuizStore();

  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndCreate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      // 1. Generate questions via AI
      const questions = await generateAIQuestions({
        topic: topic.trim(),
        count: Number(count),
        difficulty,
        additionalContext: context.trim(),
      });

      if (!questions || questions.length === 0) {
        setIsGenerating(false);
        return;
      }

      // 2. Create new Quiz
      const quizTitle = `${topic.trim()} (AI Quiz)`;
      const quizPayload = {
        title: quizTitle,
        description: `Auto-generated quiz on "${topic.trim()}" powered by Quimora AI.`,
        timeLimit: 15,
        maxAttempts: 1,
      };

      const createdQuiz = await createQuiz(quizPayload);

      if (createdQuiz && (createdQuiz._id || createdQuiz.id)) {
        const quizId = createdQuiz._id || createdQuiz.id;

        // 3. Bulk import generated questions to quiz
        await importBulkQuestions(quizId, questions);

        setIsOpen(false);
        setTopic("");
        setContext("");

        if (onQuizGenerated) onQuizGenerated(createdQuiz);

        // 4. Navigate to new quiz view
        navigate(`/instructor/quizzes/${quizId}`);
      }
    } catch (err) {
      console.error("Failed AI quiz generation:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-surface border border-purple-500/30 rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h4 className="font-display text-sm font-semibold text-main">
            Generate Quiz & Questions with AI
          </h4>
        </div>

        <p className="text-muted text-xs mb-4 leading-relaxed">
          Instantly generate questions and create a full quiz automatically using Groq AI.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Try AI Quiz Generator
        </button>
      </motion.div>

      {/* AI Quiz & Question Generator Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-main rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-main pb-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-base">
                  <Sparkles className="w-5 h-5" /> AI Quiz & Question Builder
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted hover:text-main p-1 rounded-lg hover:bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sample Prompt Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Sample Prompt Suggestions (Click to use)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTopic(p.topic);
                        setDifficulty(p.difficulty);
                        setContext(p.context);
                      }}
                      className="p-2.5 text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <span className="font-semibold block text-main">{p.title}</span>
                      <span className="text-[10px] text-muted line-clamp-1">{p.topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerateAndCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-1">
                    Topic / Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. React Custom Hooks, Machine Learning, World War II"
                    className="w-full px-4 py-2.5 rounded-xl bg-main border border-main text-xs text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-1">
                      Question Count
                    </label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-main border border-main text-xs text-main focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    >
                      {[3, 5, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} Questions
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-1">
                      Difficulty
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: "mixed", label: "Mixed" },
                        { id: "easy", label: "Easy" },
                        { id: "medium", label: "Med" },
                        { id: "hard", label: "Hard" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDifficulty(d.id)}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-all cursor-pointer ${
                            difficulty === d.id
                              ? "bg-purple-600 text-white border-purple-500"
                              : "bg-main text-muted border-main hover:text-main"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-1">
                    Additional Instructions <span className="text-muted font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. Focus on edge cases, memory leaks, and performance..."
                    className="w-full p-3 rounded-xl bg-main border border-main text-xs text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-main">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-muted hover:text-main bg-elevated rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !topic.trim()}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Quiz & Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate & Create Quiz
                      </>
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
