import { useEffect, useState } from "react";
import { Upload, Plus, Sparkles } from "lucide-react";
import useQuestionStore from "../store/useQuestionStore";
import QuestionFormModal from "./questionForm";
import BulkImportModal from "./BulkImportModal";
import AIGenerateModal from "./AIGenerateModal";

const initialFormState = {
  questionText: "",
  options: [
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ],
  marks: 5,
  difficulty: "medium",
};

export default function QuestionManager({ quizId }) {
  const {
    questions,
    loading,
    getQuizQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState(initialFormState);

  // Helper to ensure 4 option objects
  const normalizeOptions = (opts = []) =>
    Array.from({ length: 4 }, (_, i) => ({
      optionText: opts[i]?.optionText || "",
      isCorrect: Boolean(opts[i]?.isCorrect),
    }));

  useEffect(() => {
    if (quizId) {
      getQuizQuestions(quizId);
    }
  }, [quizId]); // Omit getQuizQuestions to prevent infinite re-render loop

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (question) => {
    setEditingQuestion(question);
    setForm({
      questionText: question.questionText || "",
      options: normalizeOptions(question.options), // Clones array safely
      marks: question.marks ?? 5,
      difficulty: question.difficulty || "medium",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setForm(initialFormState);
  };

  const handleSaveQuestion = async (formData) => {
    let success;
    if (editingQuestion) {
      success = await updateQuestion(quizId, editingQuestion._id, formData);
    } else {
      success = await createQuestion(quizId, formData);
    }

    if (success) {
      handleCloseModal();
      getQuizQuestions(quizId);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    const success = await deleteQuestion(quizId, questionId);
    if (success) {
      getQuizQuestions(quizId);
    }
  };

  return (
    <div className="rounded-2xl border border-main bg-surface p-6 shadow-card transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-main mb-6">
        <div>
          <h3 className="text-lg font-bold text-main font-display">
            Questions ({questions?.length || 0})
          </h3>
          <p className="text-xs text-muted">
            Manage, edit, and create questions for this quiz.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2.5 text-xs font-semibold text-purple-400 shadow-xs transition hover:bg-purple-500/20 hover:border-purple-500/50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate with AI
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-main bg-elevated px-3.5 py-2.5 text-xs font-semibold text-main shadow-xs transition hover:border-accent hover:text-accent cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import (CSV/JSON)
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>
        </div>
      </div>

      {loading && (!questions || questions.length === 0) ? (
        <div className="py-12 text-center text-muted font-medium animate-pulse">
          Loading questions...
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="py-12 text-center text-muted border border-dashed border-main rounded-xl">
          No questions added yet. Click "+ Add Question" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q._id || idx}
              className="rounded-xl border border-main bg-elevated p-4 space-y-3 transition hover:border-accent/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase text-muted">
                    {q.difficulty} • {q.marks}{" "}
                    {q.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(q)}
                    className="rounded-xl border border-main bg-surface px-3.5 py-1.5 text-xs font-semibold text-main hover:border-accent transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="rounded-xl border border-red-500/30 bg-surface px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-main">
                {q.questionText}
              </h4>

              {/* Options Grid with Correct Answer Highlighting */}
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={opt._id || oIdx}
                      className={`text-xs px-3 py-2 rounded-lg border flex items-center justify-between ${
                        opt.isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-medium"
                          : "border-main/60 bg-surface/50 text-muted"
                      }`}
                    >
                      <span className="truncate mr-2">
                        <strong className="mr-1">{String.fromCharCode(65 + oIdx)}.</strong>
                        {opt.optionText}
                      </span>
                      {opt.isCorrect && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold shrink-0">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isModalOpen}
        isEditing={Boolean(editingQuestion)}
        onClose={handleCloseModal}
        onSave={handleSaveQuestion}
        form={form}
        setForm={setForm}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        quizId={quizId}
        onImportSuccess={() => getQuizQuestions(quizId)}
      />

      {/* AI Question Generator Modal */}
      <AIGenerateModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        quizId={quizId}
        onImportSuccess={() => getQuizQuestions(quizId)}
      />
    </div>
  );
}
