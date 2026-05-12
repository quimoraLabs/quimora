import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import { cacheBusterHeaders } from "../../../../utils/httpHeaders";
import { useNavigate } from "react-router-dom";

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

    const handleStart = (quizId) =>{
    if(!quizId){
      toast.error("Invalid Question");
      return;
    }
    navigate("/student/quiz/test/"+quizId);
  }

  return (
    <div className="p-6 text-white bg-neutral-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Available Quizzes</h1>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-4 border border-neutral-700 rounded-lg bg-neutral-800"
            >
              <h2 className="text-xl font-semibold">{quiz.title}</h2>
              <p className="text-neutral-400">{quiz.description}</p>
              <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700" onClick={()=>handleStart(quiz.id)}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No quizzes found. Check your backend!</p>
      )}
    </div>
  );
}

export default StudentQuiz;
