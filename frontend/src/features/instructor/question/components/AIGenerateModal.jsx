import { useState, useEffect } from "react";
import { Sparkles, Loader2, Trash2, CheckCircle2, AlertCircle, X, Plus } from "lucide-react";
import useQuestionStore from "../store/useQuestionStore";

export default function AIGenerateModal({ isOpen, onClose, quizId, initialTopic = "", onImportSuccess }) {
  const { generateAIQuestions, importBulkQuestions } = useQuestionStore();

  const [topic, setTopic] = useState(initialTopic);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [additionalContext, setAdditionalContext] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);

  useEffect(() => {
    if (isOpen && initialTopic) {
      setTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    const result = await generateAIQuestions({
      topic: topic.trim(),
      count: parseInt(count, 10),
      difficulty,
      additionalContext: additionalContext.trim(),
    });

    setIsGenerating(false);
    if (result && Array.isArray(result) && result.length > 0) {
      setGeneratedQuestions(result);
    }
  };

  const handleRemoveQuestion = (indexToRemove) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleImportAll = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    setIsImporting(true);
    const success = await importBulkQuestions(quizId, generatedQuestions);
    setIsImporting(false);

    if (success) {
      setGeneratedQuestions(null);
      onClose();
      if (onImportSuccess) onImportSuccess();
    }
  };

  const handleReset = () => {
    setGeneratedQuestions(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface border border-main rounded-2xl shadow-2xl overflow-hidden my-8 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-main bg-gradient-to-r from-purple-950/40 via-surface to-surface">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-main font-display">
                Generate Questions with Groq AI
              </h3>
              <p className="text-xs text-muted">
                Create instant multiple-choice questions for your quiz
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-main hover:bg-elevated rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {!generatedQuestions ? (
            /* Step 1: Input Prompt Form */
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-2">
                  Topic / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React Hooks, Machine Learning Fundamentals, World War II History"
                  className="w-full px-4 py-2.5 bg-main border border-main rounded-xl text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                />
              </div>

              {/* Sample Prompt Suggestions */}
              <div>
                <label className="block text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Sample Prompt Suggestions (Click to fill)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "⚛️ React Hooks",
                      t: "React Hooks & State Management",
                      d: "medium",
                      c: "Focus on useEffect edge cases, useState batching, and custom hooks.",
                    },
                    {
                      label: "⚡ JS Async/Await",
                      t: "JavaScript Promises & Async/Await",
                      d: "medium",
                      c: "Include event loop, microtasks, Promise.all, and error handling.",
                    },
                    {
                      label: "🐍 Python OOP",
                      t: "Python Data Structures & OOP",
                      d: "easy",
                      c: "Cover lists, dictionaries, class inheritance, and magic methods.",
                    },
                    {
                      label: "🗄️ SQL & Indexing",
                      t: "Database Queries & SQL Indexing",
                      d: "hard",
                      c: "Focus on complex JOINs, B-Tree indexes, and transaction isolation.",
                    },
                    {
                      label: "🔐 Web Security",
                      t: "Web Security & JWT Authentication",
                      d: "medium",
                      c: "Include XSS, CSRF, CORS, password hashing, and token refresh.",
                    },
                    {
                      label: "🌐 Node.js REST API",
                      t: "Node.js & Express REST API Design",
                      d: "medium",
                      c: "Cover middleware execution order, HTTP status codes, and error handlers.",
                    },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTopic(preset.t);
                        setDifficulty(preset.d);
                        setAdditionalContext(preset.c);
                      }}
                      className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-xs rounded-lg transition-all cursor-pointer text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Question Count */}
                <div>
                  <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-main border border-main rounded-xl text-sm text-main focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                  >
                    {[1, 2, 3, 5, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Question{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-2">
                    Target Difficulty
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "mixed", label: "🔀 Mixed" },
                      { id: "easy", label: "🟢 Easy" },
                      { id: "medium", label: "🟡 Medium" },
                      { id: "hard", label: "🔴 Hard" },
                    ].map((diff) => (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => setDifficulty(diff.id)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          difficulty === diff.id
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                            : "bg-main text-muted border-main hover:text-main"
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-xs font-semibold text-main uppercase tracking-wider mb-2">
                  Additional Instructions <span className="text-muted font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g. Focus on useEffect edge cases and memory leaks..."
                  className="w-full px-4 py-2.5 bg-main border border-main rounded-xl text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-muted hover:text-main bg-elevated hover:bg-main rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Questions
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Interactive Preview List */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  Generated {generatedQuestions.length} AI question(s) for &quot;{topic}&quot;. Review before importing.
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  Generate Again
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-main border border-main rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase rounded-md border border-purple-500/20">
                          {q.difficulty} • {q.marks} Marks
                        </span>
                        <p className="font-semibold text-sm text-main">
                          {idx + 1}. {q.questionText}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                        title="Remove question from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border ${
                            opt.isCorrect
                              ? "bg-green-500/10 border-green-500/30 text-green-400 font-medium"
                              : "bg-surface border-main text-muted"
                          }`}
                        >
                          <span className="truncate">{opt.optionText}</span>
                          {opt.isCorrect && (
                            <span className="text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Footer Actions */}
              <div className="pt-3 border-t border-main flex items-center justify-between">
                <span className="text-xs text-muted">
                  {generatedQuestions.length} question(s) selected
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-main bg-elevated rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Prompt
                  </button>
                  <button
                    type="button"
                    onClick={handleImportAll}
                    disabled={isImporting || generatedQuestions.length === 0}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing to Quiz...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Import All to Quiz
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
