// import React from 'react';

const QuestionDetail = ({ questionData }) => {
  if (!questionData) return <p>No question data available.</p>;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-700">Question Text:</h4>
        <p className="text-gray-900 mt-1">{questionData.questionText}</p>
        <p className="text-gray-900 mt-1">{questionData.marks}</p>
        <p className="text-gray-900 mt-1">{questionData.difficulty}</p>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Options:</h4>
        <ul className="space-y-2">
          {questionData.options?.map((option, index) => (
            <li
              key={index}
              className={`p-3 rounded-md border `}
            >
              {option.optionText}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QuestionDetail;
