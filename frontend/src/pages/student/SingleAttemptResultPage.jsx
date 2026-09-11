import { motion } from "motion/react";
import Loader from "../../components/common/Loader";
import { useExamResult } from "../../features/student/exam/hooks/useExamResult";
import { ResultHeader } from "../../features/student/exam/components/ResultHeader";
import { ResultMetrics } from "../../features/student/exam/components/ResultMetrics";
import { ResultSummary } from "../../features/student/exam/components/ResultSummary";
import { ResultActions } from "../../features/student/exam/components/ResultActions";

const SingleAttemptResultPage = () => {
  const {
    loading,
    quizResults,
    passed,
    marksObtained,
    totalMarks,
    correctAnswersCount,
    incorrectAnswersCount,
    unattemptedCount,
    percentage,
    warningCount,
    feedback,
    handleCleanExit,
  } = useExamResult();

  if (loading) {
    return <Loader />;
  }

  if (!quizResults) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-main text-main p-6">
        <p className="mb-4 font-semibold text-lg">
          No assessment records found for this view session.
        </p>
        <button
          onClick={() => handleCleanExit("/student/quizzes")}
          className="px-6 py-3 bg-accent text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-main text-main">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-surface rounded-3xl shadow-card border border-soft overflow-hidden"
      >
        <ResultHeader feedback={feedback} />

        <div className="p-8 md:p-12 space-y-8">
          <ResultMetrics
            marksObtained={marksObtained}
            totalMarks={totalMarks}
            percentage={percentage}
            passed={passed}
          />
          <ResultSummary
            correctAnswersCount={correctAnswersCount}
            incorrectAnswersCount={incorrectAnswersCount}
            unattemptedCount={unattemptedCount}
            warningCount={warningCount}
          />
          <ResultActions 
            onExit={handleCleanExit} 
            attemptId={quizResults?.attemptId || quizResults?._id || quizResults?.id} 
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SingleAttemptResultPage;