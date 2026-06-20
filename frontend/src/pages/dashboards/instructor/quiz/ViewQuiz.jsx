import { useParams } from "react-router-dom";
import useQuizStore from "../../../../store/quizStore";
import useQuestionStore from "../../../../store/questionStore";
import { useEffect, useState } from "react";
import Loader from "../../../../components/Loader";
import DataTable from "../../components/DataTable";
import { Clock, Award, FileText, Plus, X } from "lucide-react";
import QuestionForm from "../components/QuestionForm";
/* IMPORT HOOK: Bringing in our newly styled theme-agnostic question card layout component */
import QuestionView from "../components/QuestionView"; 

const ViewQuiz = () => {
  const { loading: quizLoading, fetchQuizById, currentQuiz } = useQuizStore();

  const {
    fetchQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    clearCurrentQuestion,
    loading: questionLoading,
  } = useQuestionStore();

  const { quizId } = useParams();
  const questions = currentQuiz?.data?.questions || [];

  // Local state management for the dynamic question data structure
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    marks: "",
    difficulty: "easy",
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });

  // Toggle state to switch between Create Mode view overlays
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch parent quiz configuration upon component mounting sequence
  useEffect(() => {
    fetchQuizById(quizId);
  }, [fetchQuizById, quizId]);

  const difficultyStyles = {
    easy: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    hard: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  };

  /* RENDER ROW METHOD: Maps the standard list columns into the tabular structure frame matrix */
  const renderQuizRow = (question) => {
    const diff = (question.difficulty || "easy").toLowerCase();
    return (
      <>
        <td className="px-6 py-4 font-medium max-w-xs truncate text-main">
          {question.questionText}
        </td>
        <td className="px-6 py-4 text-muted font-mono">
          {question.marks || 0}
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide capitalize ${difficultyStyles[diff] || difficultyStyles.easy}`}
          >
            {diff}
          </span>
        </td>
      </>
    );
  };

  // Trigger state hydration for update targeting execution paths
  const handleEditClickTrigger = async (questionItem) => {
    const questionId = questionItem._id || questionItem.id;

    clearCurrentQuestion();
    setQuestionForm(null);

    const isAvailable = await fetchQuestionById(quizId, questionId);

    if (isAvailable) {
      const storeState = useQuestionStore.getState().currentQuestion;
      const rawQuestionObject = storeState?.question
        ? storeState.question
        : storeState;

      if (rawQuestionObject) {
        setQuestionForm(rawQuestionObject);
      }
    }
  };

  // Dispatch network transaction payload for mutation update pipelines
  const handleUpdateDispatch = async (questionId) => {
    const success = await updateQuestion(quizId, questionId, questionForm);
    if (success) {
      clearCurrentQuestion();
    }
  };

  // Dispatch asynchronous truncation criteria processing parameters
  const handleDeleteDispatch = async (questionId) => {
    await deleteQuestion(quizId, questionId);
  };

  // Handle resource initialization routines for newly instantiated records
  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    const success = await createQuestion(quizId, questionForm);
    if (success) {
      setIsCreateModalOpen(false);
      // Reset local schema bindings back to default uninitialized states
      setQuestionForm({
        questionText: "",
        marks: "",
        difficulty: "easy",
        options: [
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      });
    }
  };

  if (quizLoading) {
    return <Loader />;
  }

  if (!currentQuiz?.data) {
    return (
      <div className="text-center py-10 text-muted">Quiz data not found.</div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-2">
      {/* Quiz Overview Metric Layout */}
      <div className="rounded-xl border border-main bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-brand-primary font-display">
              Quiz Overview
            </span>
            <h1 className="text-2xl font-bold font-display text-main mt-1">
              {currentQuiz.data?.title}
            </h1>
            {currentQuiz.data?.description && (
              <p className="text-muted text-sm mt-2 leading-relaxed">
                {currentQuiz.data?.description}
              </p>
            )}
          </div>

          <hr className="border-main" />

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-main/40 px-3 py-1.5 rounded-lg border border-main">
              <Clock size={16} className="text-brand-mid" />
              <span className="text-muted">Duration:</span>
              <span className="font-semibold text-main">
                {currentQuiz.data?.timeLimit} mins
              </span>
            </div>

            <div className="flex items-center gap-2 bg-main/40 px-3 py-1.5 rounded-lg border border-main">
              <Award size={16} className="text-brand-end" />
              <span className="text-muted">Max Attempts Allowed:</span>
              <span className="font-semibold text-main">
                {currentQuiz.data?.maxAttempts}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-main/40 px-3 py-1.5 rounded-lg border border-main ml-auto sm:ml-0">
              <FileText size={16} className="text-brand-primary" />
              <span className="text-muted">Total Questions:</span>
              <span className="font-semibold text-main">
                {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Database Interface Controller Segment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-main px-1">
            Questions Database
          </h3>
          <button
            onClick={() => {
              setQuestionForm({
                questionText: "",
                marks: "",
                difficulty: "easy",
                options: [
                  { optionText: "", isCorrect: false },
                  { optionText: "", isCorrect: false },
                  { optionText: "", isCorrect: false },
                  { optionText: "", isCorrect: false },
                ],
              });
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary/90 transition-all shadow-sm"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        <DataTable
          /* 🔥 ARCHITECTURAL TRICK: Passing length as key forces DataTable to reset its internal modal states 
            automatically as soon as an item gets deleted from the array list context layer.
          */
          key={questions.length}
          type="question"
          headers={["Question Text", "Marks", "Difficulty"]}
          data={questions}
          renderRow={renderQuizRow}
          isView={true}
          isEdit={true}
          isDelete={true}
          onDelete={handleDeleteDispatch}
          onUpdate={handleUpdateDispatch}
          onEditClick={handleEditClickTrigger}
          loading={questionLoading}
          
          /* FUNCTION HOOK: Cleanly rendering our custom card inside the View Modal Wrapper container */
          renderViewDetails={() => {
            if (questionLoading || !questionForm?.questionText) {
              return (
                <div className="flex flex-col justify-center items-center p-8 gap-2">
                  <Loader />
                  <p className="text-xs text-muted font-medium">
                    Loading question view structure safely...
                  </p>
                </div>
              );
            }
            return (
              <div className="mt-2 text-left">
                <QuestionView
                  question={questionForm}
                  index={questions.findIndex(q => q.id === questionForm.id)}
                  onDelete={handleDeleteDispatch}
                />
              </div>
            );
          }}
          
          renderUpdateForm={() => {
            if (questionLoading || !questionForm?.questionText) {
              return (
                <div className="flex flex-col justify-center items-center p-10 gap-2">
                  <Loader />
                  <p className="text-xs text-muted font-medium">
                    Fetching question details safely...
                  </p>
                </div>
              );
            }
            return (
              <QuestionForm
                questionData={questionForm}
                setQuestionForm={setQuestionForm}
                isUpdate={true}
              />
            );
          }}
        />
      </div>

      {/* Custom Overlay Modal Frame for Record Addition Operations */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-main rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-main bg-main/10">
              <h2 className="text-lg font-bold font-display text-main">
                Create New MCQ Question
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted hover:text-main transition-colors p-1 rounded-lg hover:bg-main/20"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateDispatch}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <QuestionForm
                questionData={questionForm}
                setQuestionForm={setQuestionForm}
                isUpdate={false}
                index={questions.length}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-main">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-main text-muted rounded-lg text-sm font-medium hover:bg-main/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {questionLoading ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewQuiz;