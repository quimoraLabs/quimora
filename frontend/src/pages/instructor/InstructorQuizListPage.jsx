import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import useQuizStore from "../../features/instructor/quiz/store/useQuizStore";
import DataTable from "../../components/common/DataTable";
import QuizFormModal from "../../features/instructor/quiz/components/QuizForm";
import PaginationBar from "../../features/instructor/quiz/components/PaginationBar";
import QuizHeaderBar from "../../features/instructor/quiz/components/QuizHeaderBar";

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

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Easily scalable to 20 later

  useEffect(() => {
    fetchQuizzesByInstructor();
  }, [fetchQuizzesByInstructor]);

  // Client-side filtering logic
  const filteredQuizzes = useMemo(() => {
    if (!Array.isArray(quizzes)) return [];
    return quizzes.filter((quiz) => {
      const matchesSearch = quiz.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || quiz.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quizzes, searchQuery, selectedStatus]);

  // Pagination calculation
  const totalItems = filteredQuizzes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuizzes.slice(start, start + pageSize);
  }, [filteredQuizzes, currentPage, pageSize]);

  const handleOpenCreateModal = () => {
    setSelectedQuiz(null);
    setForm(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

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
        <td className=" text-main text-sm px-2">{quiz.title}</td>

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
              disabled={quiz?.questions.length===0}
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
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <QuizHeaderBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onOpenCreateModal={handleOpenCreateModal}
            totalQuizzes={quizzes.length}
          />

          <DataTable
            headers={headers}
            data={paginatedQuizzes}
            renderRow={renderRow}
            isView={true}
            isEdit={true}
            isDelete={true}
            type="quiz"
            loading={loading}
            onDelete={deleteQuiz}
            onEditClick={handleEditClick}
          />

          {/* Pagination Component */}
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </motion.div>

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
