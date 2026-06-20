import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you use react-router for redirects
import useQuizStore from "../../../../store/quizStore"; // Adjust path to store file
import QuizForm from "../components/QuizForm";
import QuestionForm from "../components/QuestionForm";
import toast from "react-hot-toast";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { createQuiz, loading } = useQuizStore();

  const questionTemplate = {
    questionText: "",
    marks: 1,
    difficulty: "easy",
    options: [{ optionText: "", isCorrect: false }],
  };

  const initialData = {
    title: "",
    description: "",
    timeLimit: 5,
    maxAttempts: 1,
    tags: [],
    questions: [{ ...questionTemplate }],
  };

  const [quiz, setQuiz] = useState(initialData);

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...questionTemplate }],
    }));
  };

  // Client-Side Validation & Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate main quiz info
    if (!quiz.title.trim()) {
      return toast.error("Please add a quiz title.");
    }

    // 2. Validate questions and options array
    if (quiz.questions.length === 0) {
      return toast.error("Please add at least one question.");
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Question ${i + 1} text cannot be empty.`);
      }
      if (q.options.length < 2) {
        return toast.error(`Question ${i + 1} must have at least 2 options.`);
      }

      // Check if text is present in all options
      const hasEmptyOption = q.options.some((opt) => !opt.optionText.trim());
      if (hasEmptyOption) {
        return toast.error(`Please fill out all option texts in Question ${i + 1}.`);
      }

      // Check if exactly one option is marked correct
      const correctCount = q.options.filter((opt) => opt.isCorrect).length;
      if (correctCount !== 1) {
        return toast.error(`Please select exactly one correct answer for Question ${i + 1}.`);
      }
    }

    // 3. Fire the store action to post the clean payload
    const success = await createQuiz(quiz);
    if (success) {
      setQuiz(initialData); // Reset form state
      navigate("/instructor/quizzes"); // Route back to management panel
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto bg-main min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-main font-display">Create New Quiz</h2>
        
        {/* Submit Action Header Trigger */}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-primary text-white font-semibold px-6 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
        >
          {loading ? "Saving..." : "Publish Quiz"}
        </button>
      </div>

      {/* Meta Fields Component */}
      <QuizForm quizData={quiz} setQuizData={setQuiz} />

      {/* Question Loop Renderer */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-main mb-4 font-display">Questions Configurations</h3>
        {quiz.questions.map((question, index) => (
          <QuestionForm
            key={index}
            index={index}
            questionData={question}
            setQuizData={setQuiz}
          />
        ))}
      </div>

      {/* Add New Question Blueprint */}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="mt-4 w-full py-3 border-2 border-dashed border-main rounded-xl text-muted font-medium hover:border-brand-primary hover:text-brand-primary transition-colors bg-surface shadow-sm"
      >
        + Add New Question Block
      </button>
    </form>
  );
};

export default CreateQuiz;