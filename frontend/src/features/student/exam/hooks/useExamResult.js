import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Award } from "lucide-react";
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

  const score = quizResults?.correctAnswersCount ?? 0;
  const totalQuestions = quizResults?.totalQuestions ?? 0;
  const percentage =
    quizResults?.score !== undefined ? Math.round(quizResults.score) : 0;

  const getFeedback = () => {
    if (percentage >= 80) {
      return { message: "Exceptional Performance", icon: Award, tone: "high" };
    }
    if (percentage >= 50) {
      return { message: "Successfully Passed", icon: Trophy, tone: "mid" };
    }
    return { message: "Needs Improvement", icon: Award, tone: "low" };
  };

  const handleCleanExit = (targetRoute = "/student/quizzes") => {
    clearQuizSession();
    navigate(targetRoute);
  };

  return {
    loading,
    quizResults,
    score,
    totalQuestions,
    percentage,
    warningCount: warningCount || 0,
    feedback: getFeedback(),
    handleCleanExit,
  };
};
