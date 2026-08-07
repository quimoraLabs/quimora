import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import useQuizStore from "../../features/instructor/quiz/store/useQuizStore"; // Adjust path to store
import DataTable from "../../components/common/DataTable"; // Adjust path
import QuizFormModal from "../../features/instructor/quiz/components/QuizForm"; // Adjust path

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  timeLimit: 20,
  maxAttempts: 1,
  startDate: "",
  endDate: "",
};

export default function InstructorQuizListPage() {
  const {
    quizzes,
    loading,
    fetchQuizzesByInstructor,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    changeQuizStatus,
  } = useQuizStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    fetchQuizzesByInstructor();
  }, [fetchQuizzesByInstructor]);

  const handleOpenCreateModal = () => {
    setSelectedQuiz(null);
    setForm(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  console.log(quizzes);

  const handleEditClick = (quiz) => {
    setSelectedQuiz(quiz);
    setForm({
      title: quiz.title || "",
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 20,
      maxAttempts: quiz.maxAttempts || 1,
      startDate: quiz.startDate ? quiz.startDate.split("T")[0] : "",
      endDate: quiz.endDate ? quiz.endDate.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  // Handles both Creation & Update, ensuring modal closes cleanly
  const handleSaveQuiz = async (formData) => {
    let success;
    if (selectedQuiz) {
      const quizId = selectedQuiz._id || selectedQuiz.id;
      success = await updateQuiz(quizId, formData);
    } else {
      success = await createQuiz(formData);
    }

    if (success) {
      setIsModalOpen(false);
      setForm(INITIAL_FORM_STATE);
      setSelectedQuiz(null);
    }
  };

  const headers = [
    <span className="w-2/5 inline-block">Title</span>,
    <span className="w-1/5 inline-block">Duration (Min)</span>,
    <span className="w-1/5 inline-block">Status</span>,
  ];

  const renderRow = (quiz) => {
    const quizId = quiz._id || quiz.id;

    return (
      <>
        <td className=" text-main text-sm px-2">
          {quiz.title}
        </td>

        <td className="pl-10 text-muted whitespace-nowrap text-left">
          {quiz.timeLimit}
        </td>
        <td className="px-2 whitespace-nowrap">
          {quiz.status === "published" ? (
            <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
              Published
            </span>
          ) : (
            <button
              type="button"
              disabled={quiz?.questions.length}
              onClick={() => changeQuizStatus(quizId, "published")}
              className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Draft
            </button>
          )}
        </td>
      </>
    );
  };

  return (
    <main className="min-h-screen bg-main px-4 py-8 text-main sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Instructor workspace
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Quizzes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Create, organize, and publish assessments for your learners.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold shadow-lg shadow-brand-mid/10 transition hover:opacity-90"
          >
            <Plus size={17} />
            Create quiz
          </button>
        </motion.div>

        <DataTable
          headers={headers}
          data={quizzes}
          renderRow={renderRow}
          isView={true}
          isEdit={true}
          isDelete={true}
          type="quiz"
          loading={loading}
          onDelete={deleteQuiz}
          onEditClick={handleEditClick}
        />

        <QuizFormModal
          isOpen={isModalOpen}
          quiz={selectedQuiz}
          form={form}
          setForm={setForm}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuiz(null);
          }}
          onSave={handleSaveQuiz}
        />
      </div>
    </main>
  );
}
