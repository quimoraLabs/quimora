import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import { cacheBusterHeaders } from "../../../../utils/httpHeaders";
import { useParams } from "react-router-dom";

// ... imports ...

function StudentQuizQuestions() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null); // Changed from [] to null
  const [loading, setLoading] = useState(true); // Added loading state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(600);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false); // Add this at the top

  const { token } = useAuthStore();
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // 1. Set up the interval to run every 1 second (1000ms)
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId); // Stop at 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. IMPORTANT: Cleanup function to stop timer if user leaves the page
    return () => clearInterval(intervalId);
  }, [quiz]); // Empty array ensures this only starts once on mount

  useEffect(() => {
    const getQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...cacheBusterHeaders,
          },
        });

        if (response.status === 200) {
          setQuiz(response.data.data);
        }
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };

    getQuizzes();
  }, [token, url, quizId]);

  // Handle Loading State
  if (loading) return <div className="text-white p-6">Loading quiz...</div>;

  // Handle No Data State
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <p className="text-white p-6">No questions found for this quiz.</p>;
  }

  const nextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentQuestion = quiz.questions[currentIndex];

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;



const handleSelect = (optionText) => {
  setAnswers((prev) => {
    const updated = {
      ...prev,
      [currentIndex]: optionText,
    };

    console.log("updated answers:", updated);

    return updated;
  });
};

const calculateScore = () => {
  let score = 0;

  quiz.questions.forEach((q, index) => {
    const userAnswer = answers[index];

    console.log(q.options);
    const correctOpt = q.options.find(
      (opt) => opt.isCorrect === true
    );

    console.log({
      index,
      userAnswer,
      correctAnswer: correctOpt?.optionText,
    });

    if (userAnswer === correctOpt?.optionText) {
      score++;
    }
  });

  return score;
};

  const handleFinalSubmit = () => {
    const score = calculateScore();
    setTotalScore(score);
    setIsFinished(true);
    toast.success(`Quiz Finished!`);
    // Optional: navigate("/student/results", { state: { score } });
  };


  // Define this so the timer doesn't crash
  const handleAutoSubmit = () => {
    toast.error("Time is up!");
    setIsFinished(true);
    handleFinalSubmit();
  };

  if(timer===0){
    handleAutoSubmit();
  }

  return (
    <div className="p-6 text-white bg-neutral-900 min-h-screen flex flex-col items-center justify-center">
      {isFinished ? (
        <div className="w-full max-w-md p-8 border border-neutral-700 rounded-lg bg-neutral-800 text-center">
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl">
            Your Score:{" "}
            <span className="text-green-500 font-mono">{totalScore}</span> /{" "}
            {quiz.questions.length}
          </p>
          <button
            onClick={() => window.location.reload()} // Simple way to restart
            className="mt-6 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="text-xl font-mono">
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
          <div className="w-full max-w-2xl p-6 border border-neutral-700 rounded-lg bg-neutral-800">
            <p className="text-neutral-400 mb-2">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>

            <h2 className="text-2xl font-semibold mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* --- OPTIONS GO HERE (Checkboxes or Radio buttons) --- */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = answers[currentIndex] === option.optionText;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(option.optionText,option.isCorrect)}
                    className={`p-4 border rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-600/20 text-white"
                        : "border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500" : "border-neutral-500"}`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      {option.optionText}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-neutral-700 rounded disabled:opacity-50 hover:bg-neutral-600 transition"
              >
                Previous
              </button>

              {currentIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={handleFinalSubmit}
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentQuizQuestions;
