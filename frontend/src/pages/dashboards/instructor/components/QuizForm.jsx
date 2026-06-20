// import React from 'react';

const QuizForm = ({ quizData, setQuizData }) => {
  console.log(quizData);
  
  const handleInputChange = (e) => {
    const { name, value,type } = e.target;
    
    setQuizData((prev) => ({
      ...prev,          
       [name]: type === "number" ? Number(value) : value,    
    }));
  };

  return (
    /* ⭐ Used bg-surface, border-main, and text-main here */
    <div className="border border-main p-6 my-4 rounded-xl bg-surface shadow-sm">
      <h3 className="text-xl text-center underline font-bold text-main mb-4 font-display">Quiz Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">Quiz Title</label>
          <input
            type="text"
            name="title"
            value={quizData?.title}
            onChange={handleInputChange}
            placeholder="e.g., React Basics Quiz"
            /* ⭐ Matching styles using border-main, text-main and focus wrapper */
            className="border border-main p-2 rounded bg-main text-main focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-muted">Description</label>
          <textarea
            name="description"
            value={quizData?.description}
            onChange={handleInputChange}
            placeholder="Enter quiz description..."
            className="border border-main p-2 rounded bg-main text-main focus:outline-none focus:border-brand-primary h-20"
          />
        </div>

        {/* Time Limit Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">Time Limit (in minutes)</label>
          <input
            type="number"
            name="timeLimit"
            value={quizData?.timeLimit}
            onChange={handleInputChange}
            min="5"
            className="border border-main p-2 rounded bg-main text-main focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Max Attempts Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted">Max Attempts Allowed</label>
          <input
            type="number"
            name="maxAttempts"
            value={quizData?.maxAttempts}
            onChange={handleInputChange}
            min="1"
            className="border border-main p-2 rounded bg-main text-main focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizForm;