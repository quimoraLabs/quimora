// import React from "react";

const QuestionForm = ({
  questionData,
  index,
  setQuestionForm,
  setQuizData,
  isUpdate = false,
}) => {
  console.log(questionData);
  const updateQuestionForm = setQuestionForm || setQuizData;

  // 1. Smart Input Handler (Works for both single object and array format states)
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    updateQuestionForm((prev) => {
      if (prev && Array.isArray(prev.questions)) {
        // Array nested state update (For Multiple Creation Mode)
        const updatedQuestions = [...prev.questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
        return { ...prev, questions: updatedQuestions };
      } else {
        // Single object state update (For single modal creation or single update)
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  // 2. Add Option
  const handleAddOption = () => {
    updateQuestionForm((prev) => {
      if (prev && Array.isArray(prev.questions)) {
        const updatedQuestions = [...prev.questions];
        const currentOptions = updatedQuestions[index]?.options || [];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          options: [...currentOptions, { optionText: "", isCorrect: false }],
        };
        return { ...prev, questions: updatedQuestions };
      } else {
        const currentOptions = prev?.options || [];
        return {
          ...prev,
          options: [...currentOptions, { optionText: "", isCorrect: false }],
        };
      }
    });
  };

  // 3. Option Change Handler
  const handleOptionChange = (optionIndex, field, value) => {
    updateQuestionForm((prev) => {
      if (prev && Array.isArray(prev.questions)) {
        const updatedQuestions = [...prev.questions];
        let updatedOptions = [...(updatedQuestions[index]?.options || [])];

        if (field === "isCorrect" && value === true) {
          updatedOptions = updatedOptions.map((opt, optIdx) => ({
            ...opt,
            isCorrect: optIdx === optionIndex,
          }));
        } else {
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            [field]: value,
          };
        }

        updatedQuestions[index] = {
          ...updatedQuestions[index],
          options: updatedOptions,
        };
        return { ...prev, questions: updatedQuestions };
      } else {
        let updatedOptions = [...(prev?.options || [])];

        if (field === "isCorrect" && value === true) {
          updatedOptions = updatedOptions.map((opt, optIdx) => ({
            ...opt,
            isCorrect: optIdx === optionIndex,
          }));
        } else {
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            [field]: value,
          };
        }
        return { ...prev, options: updatedOptions };
      }
    });
  };

  // 4. Delete Option
  const handleDeleteOption = (optionIndex) => {
    updateQuestionForm((prev) => {
      if (prev && Array.isArray(prev.questions)) {
        const updatedQuestions = [...prev.questions];
        const updatedOptions = (updatedQuestions[index]?.options || []).filter(
          (_, optIdx) => optIdx !== optionIndex,
        );
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          options: updatedOptions,
        };
        return { ...prev, questions: updatedQuestions };
      } else {
        const updatedOptions = (prev?.options || []).filter(
          (_, optIdx) => optIdx !== optionIndex,
        );
        return { ...prev, options: updatedOptions };
      }
    });
  };

  return (
    <div className="border border-main p-5 my-4 rounded-xl bg-surface relative shadow-sm text-left">
      {/* Question Header */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg text-main font-display">
          {isUpdate ? (
            <span className="text-sm bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">
              ✏️ Editing Question Mode
            </span>
          ) : (
            `Question ${index !== undefined && !isNaN(index) ? Number(index) + 1 : 1}`
          )}
        </h4>
      </div>

      {/* Main Form Fields Grid */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">
            Question Text
          </label>
          <input
            name="questionText"
            value={questionData?.questionText || ""}
            onChange={handleInputChange}
            placeholder="Enter question text"
            className="border border-main p-2 w-full rounded-md bg-main text-main focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              Marks
            </label>
            <input
              type="number"
              name="marks"
              value={questionData?.marks || 1}
              onChange={handleInputChange}
              min="1"
              placeholder="e.g. 5"
              className="border border-main p-2 w-full rounded-md bg-main text-main focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={questionData?.difficulty || "easy"}
              onChange={handleInputChange}
              className="border border-main p-2 w-full rounded-md bg-main text-main focus:outline-none focus:border-brand-primary"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Options Section */}
      {!isUpdate && (
        <div className="mt-4 pl-4 border-l-2 border-brand-primary">
          <h5 className="font-semibold text-sm text-muted mb-2">Options:</h5>

          {questionData?.options?.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2 my-2">
              <input
                type="radio"
                name={`correct-option-${index}`}
                checked={option.isCorrect}
                onChange={() => handleOptionChange(optIndex, "isCorrect", true)}
                className="w-4 h-4 cursor-pointer accent-brand-primary"
              />

              <input
                type="text"
                value={option.optionText}
                placeholder={`Option ${optIndex + 1}`}
                onChange={(e) =>
                  handleOptionChange(optIndex, "optionText", e.target.value)
                }
                className="border border-main p-1.5 flex-1 rounded-md bg-main text-main text-sm focus:outline-none focus:border-brand-primary"
              />

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

          <button
            type="button"
            onClick={handleAddOption}
            className="mt-2 text-xs bg-brand-primary hover:opacity-90 text-white px-3 py-1.5 rounded-md shadow-sm transition-opacity"
          >
            + Add Option
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
