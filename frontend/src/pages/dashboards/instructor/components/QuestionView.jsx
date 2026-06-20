// import React from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react'; 

const QuestionView = ({ question, index, onDelete }) => {
  
  // Dynamic helper returning status colors that preserve strict readability on both light and dark surfaces
  const getDifficultyStyles = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': 
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium';
      case 'medium': 
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium';
      case 'hard': 
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 font-medium';
      default: 
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20 font-medium';
    }
  };

  return (
    /* MAIN CONTAINER: Completely structural, using theme tokens for automated adaptive look */
    <div className="w-full bg-surface border border-main rounded-xl p-6 mb-4 shadow-sm transition-all duration-200 hover:border-brand-primary/40">
      
      {/* SECTION 1: HEADER CONTROLS AND METADATA */}
      <div className="flex items-center justify-between border-b border-main pb-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Question Index Badge: Utilizes system brand tokens directly */}
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md">
            Q. {index + 1}
          </span>
          {/* Status badge computing visible tone mappings across canvases */}
          <span className={`text-xs px-2.5 py-1 rounded-md border ${getDifficultyStyles(question.difficulty)}`}>
            {question.difficulty || 'Medium'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Points allocation badge wrapped inside structural surface styles */}
          <span className="text-sm font-medium text-muted bg-main px-3 py-1 rounded-full border border-main">
            {question.marks || 0} Marks
          </span>
          
          {/* Isolated action container hosting single delete trigger lifecycle */}
          <div className="flex items-center border-l border-main pl-3">
            <button 
              onClick={() => onDelete(question._id)} 
              className="text-muted hover:text-rose-500 p-1.5 rounded-lg hover:bg-main transition-colors"
              title="Delete this question"
              aria-label="Delete question item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: QUESTION HEADING TEXT DISCOVERY LAYER */}
      <h3 className="font-display text-base md:text-lg font-semibold text-main mb-5 leading-relaxed">
        {question.questionText}
      </h3>

      {/* SECTION 3: MULTIPLE-CHOICE RESPONSES ARRAY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option, idx) => {
          // Flatten evaluation check formatting rules
          const isCorrect = option.isCorrect === true || option.isCorrect === 'true';
          
          return (
            <div
              key={option._id || idx}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-medium'
                  : 'bg-main/30 border-main text-main hover:bg-main/70'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Ordered options character mapper (A, B, C, D) shifting state contexts */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  isCorrect 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-surface border-main text-muted'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-normal">{option.optionText}</span>
              </div>

              {/* Vector overlay icon tracking authenticated affirmative logic */}
              {isCorrect && (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default QuestionView;