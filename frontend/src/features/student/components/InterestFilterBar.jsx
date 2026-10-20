import React from "react";
import { Sparkles, Layers } from "lucide-react";

export default function InterestFilterBar({
  interests = [],
  activeInterestId = null,
  onSelectInterest,
}) {
  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      {/* All Topics Pill */}
      <button
        onClick={() => onSelectInterest(null)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
          activeInterestId === null
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500"
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        All Quizzes
      </button>

      {/* Individual Interest Pills */}
      {interests.map((interest) => {
        const id = interest._id || interest.id;
        const isActive = activeInterestId === id;

        return (
          <button
            key={id}
            onClick={() => onSelectInterest(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500"
            }`}
          >
            <span>{interest.name}</span>
            {interest.topicTags && interest.topicTags.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {interest.topicTags[0]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
