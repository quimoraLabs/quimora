import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import { cacheBusterHeaders } from "../../../../utils/httpHeaders";
import { useNavigate } from "react-router-dom";
import { enterFullScreen } from "../../components/enterFullScreen";
import QuizCard from "../../components/QuizCard";

function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const { token } = useAuthStore();
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  useEffect(() => {
    const getQuizzes = async () => {
      try {
        const response = await axios.get(`${url}/quizzes/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...cacheBusterHeaders,
          },
        });

        if (response.status === 200) {
          setQuizzes(response.data.data || []);
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to fetch quizzes");
      }
    };

    getQuizzes();
  }, [token, url]);

    const handleStartExamFlow = () => {
    try {
      // 2. Execute your global fullscreen utility natively inside this safe click thread boundary
      enterFullScreen();
      
      // 3. Fire your quiz state activation callback immediately after entering fullscreen
    } catch (error) {
      console.error(error);
      toast.error("Security validation failed. Please check browser permissions.");
    }
  };

  const handleStart = (quiz) => {
    if (!quiz || !quiz.id) {
      toast.error("Invalid Question");
      return;
    }
    handleStartExamFlow();

    navigate("/student/quiz-rules/", { state: { quizId: quiz.id,title: quiz.title,timeLimit: quiz.timeLimit,totalQuestions: quiz.questions.length } });
  };

  return (
    <div className="p-6 text-white bg-transparent min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Available Quizzes</h1>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              title={quiz.title}
              description={quiz.description}
              timeLimit={quiz.timeLimit}
              totalQuestions={quiz.questions.length}
              handleStart={() => handleStart(quiz)}
            />
          ))}
        </div>
      ) : (
        <p>No quizzes found. Check your backend!</p>
      )}
    </div>
  );
}

export default StudentQuiz;
