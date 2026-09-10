import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import useQuizStore from "../../features/instructor/quiz/store/useQuizStore";
import DataTable from "../../components/common/DataTable";
import QuizFormModal from "../../features/instructor/quiz/components/QuizForm";
import PaginationBar from "../../features/instructor/quiz/components/PaginationBar";
import QuizHeaderBar from "../../features/instructor/quiz/components/QuizHeaderBar";
import PostQuizCreateModal from "../../features/instructor/quiz/components/PostQuizCreateModal";
import AIGenerateModal from "../../features/instructor/question/components/AIGenerateModal";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  timeLimit: 20,
  maxAttempts: 1,
  startDate: "",
  endDate: "",
};

export default function InstructorQuizListPage() {
  const navigate = useNavigate();
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

  // Post-quiz creation AI prompt state
  const [newlyCreatedQuiz, setNewlyCreatedQuiz] = useState(null);
  const [isPostCreateOpen, setIsPostCreateOpen] = useState(false);
  const [isAIQuestionsModalOpen, setIsAIQuestionsModalOpen] = useState(false);

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
    let result;
    if (selectedQuiz) {
      const quizId = selectedQuiz._id || selectedQuiz.id;
      result = await updateQuiz(quizId, formData);
      if (result) {
        setIsModalOpen(false);
        setForm(INITIAL_FORM_STATE);
        setSelectedQuiz(null);
      }
    } else {
      result = await createQuiz(formData);
      if (result) {
        setIsModalOpen(false);
        setForm(INITIAL_FORM_STATE);
        setSelectedQuiz(null);
        const quizId = result._id || result.id;
        if (quizId) {
          setNewlyCreatedQuiz({ id: quizId, title: formData.title || "New Quiz" });
          setIsPostCreateOpen(true);
        }
      }
    }
  };

  const headers = [
    <span key="title" className="w-2/5 inline-block">Title</span>,
    <span key="duration" className="w-1/5 inline-block">Duration (Min)</span>,
    <span key="status" className="w-1/5 inline-block">Status</span>,
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
              disabled={quiz?.questions?.length === 0}
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

        {/* Post-Quiz Creation Question Prompt Modal */}
        <PostQuizCreateModal
          isOpen={isPostCreateOpen}
          quizTitle={newlyCreatedQuiz?.title || "New Quiz"}
          onConfirmAI={() => {
            setIsPostCreateOpen(false);
            setIsAIQuestionsModalOpen(true);
          }}
          onSkipManual={() => {
            setIsPostCreateOpen(false);
            if (newlyCreatedQuiz?.id) {
              navigate(`/instructor/quizzes/${newlyCreatedQuiz.id}`);
            }
          }}
        />

        {/* AI Question Generator Modal */}
        {newlyCreatedQuiz?.id && (
          <AIGenerateModal
            isOpen={isAIQuestionsModalOpen}
            onClose={() => {
              setIsAIQuestionsModalOpen(false);
              navigate(`/instructor/quizzes/${newlyCreatedQuiz.id}`);
            }}
            quizId={newlyCreatedQuiz.id}
            initialTopic={newlyCreatedQuiz.title}
            onImportSuccess={() => {
              setIsAIQuestionsModalOpen(false);
              navigate(`/instructor/quizzes/${newlyCreatedQuiz.id}`);
            }}
          />
        )}
      </div>
    </main>
  );
}
