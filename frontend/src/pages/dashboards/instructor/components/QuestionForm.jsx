// import { useState } from "react";

const QuestionForm = ({ questionData, index, setQuizData }) => {
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddOption = () => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        options: [...updatedQuestions[index].options, { optionText: "", isCorrect: false }]
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      let updatedOptions = [...updatedQuestions[index].options];
      
      if (field === "isCorrect" && value === true) {
        updatedOptions = updatedOptions.map((opt, optIdx) => ({
          ...opt,
          isCorrect: optIdx === optionIndex, 
        }));
      } else {
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          [field]: value
        };
      }
      
      updatedQuestions[index] = { ...updatedQuestions[index], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleDeleteOption = (optionIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[index].options.filter(
        (_, optIdx) => optIdx !== optionIndex
      );
      updatedQuestions[index] = { ...updatedQuestions[index], options: updatedOptions };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleDeleteQuestion = () => {
    setQuizData((prev) => {
      const updatedQuestions = prev.questions.filter((_, qIdx) => qIdx !== index);
      return { ...prev, questions: updatedQuestions };
    });
  };

  return (
    /* ⭐ Swapped background with bg-surface, borders with border-main */
    <div className="border border-main p-5 my-4 rounded-xl bg-surface relative shadow-sm">
      
      {/* Question Header */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg text-main font-display">Question {index + 1}</h4>
        
        <button
          type="button"
          onClick={handleDeleteQuestion}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium px-2 py-1 rounded-md transition-colors"
        >
          🗑️ Delete Question
        </button>
      </div>
      
      {/* Question Input */}
      <div className="my-2">
        <input 
          name="questionText"
          value={questionData.questionText || ""} 
          onChange={handleInputChange}
          placeholder="Enter question text"
          /* ⭐ Using bg-main here so input field fields contrast with the surface card container */
          className="border border-main p-2 w-full rounded-md bg-main text-main focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* Options Subsection */}
      {/* ⭐ Styled the accent border using border-brand-primary */}
      <div className="mt-4 pl-4 border-l-2 border-brand-primary">
        <h5 className="font-semibold text-sm text-muted mb-2">Options:</h5>
        
        {questionData.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center gap-2 my-2">
            
            {/* Radio Selection */}
            <input 
              type="radio"
              name={`correct-option-${index}`} 
              checked={option.isCorrect}
              onChange={() => handleOptionChange(optIndex, "isCorrect", true)}
              className="w-4 h-4 cursor-pointer accent-brand-primary"
            />
            
            {/* Option Input Field */}
            <input 
              type="text"
              value={option.optionText}
              placeholder={`Option ${optIndex + 1}`}
              onChange={(e) => handleOptionChange(optIndex, "optionText", e.target.value)}
              className="border border-main p-1.5 flex-1 rounded-md bg-main text-main text-sm focus:outline-none focus:border-brand-primary"
            />

            {/* Delete Option Trigger */}
            {questionData.options.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteOption(optIndex)}
                className="text-muted hover:text-red-500 font-bold px-2 text-sm transition-colors"
                title="Delete Option"
              >
                ❌
              </button>
            )}
          </div>
        ))}

        {/* Add Option Trigger */}
        <button 
          type="button"
          onClick={handleAddOption}
          /* ⭐ Using customized bg-brand-primary utility */
          className="mt-2 text-xs bg-brand-primary hover:opacity-90 text-white px-3 py-1.5 rounded-md shadow-sm transition-opacity"
        >
          + Add Option
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;