import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, XCircle } from "lucide-react";
import useStudentQuizStore from "../store/useStudentQuizStore";
import { exitFullScreen } from "./enterFullScreen";

export const useExamResult = () => {
  const navigate = useNavigate();
  const {
    loadPersistedQuizResult,
    clearQuizSession,
    quizResults,
    warningCount,
    loading,
  } = useStudentQuizStore();

  useEffect(() => {
    exitFullScreen();

    if (!quizResults) {
      loadPersistedQuizResult();
    }
  }, [loadPersistedQuizResult, quizResults]);

  // Extract all Backend Metrics directly
  const passed = Boolean(quizResults?.passed);
  const marksObtained = quizResults?.marksObtained ?? 0;
  const totalMarks = quizResults?.totalMarks ?? 0;
  const correctAnswersCount = quizResults?.correctAnswersCount ?? 0;
  const incorrectAnswersCount = quizResults?.incorrectAnswersCount ?? 0;
  const unattemptedCount = quizResults?.unattemptedCount ?? 0;
  const totalQuestions = quizResults?.totalQuestions ?? 0;
  const percentage =
    quizResults?.scorePercentage ??
    (quizResults?.score !== undefined ? Math.round(quizResults.score) : 0);

  const getFeedback = () => {
    if (passed) {
      if (percentage >= 80) {
        return { message: "Exceptional Performance", icon: Award, passed: true };
      }
      return { message: "Successfully Passed", icon: Trophy, passed: true };
    }
    return { message: "Needs Improvement", icon: XCircle, passed: false };
  };

  const handleCleanExit = (targetRoute = "/student/quizzes") => {
    clearQuizSession();
    navigate(targetRoute);
  };

  return {
    loading,
    quizResults,
    passed,
    marksObtained,
    totalMarks,
    correctAnswersCount,
    incorrectAnswersCount,
    unattemptedCount,
    totalQuestions,
    percentage,
    warningCount: warningCount || 0,
    feedback: getFeedback(),
    handleCleanExit,
  };
};