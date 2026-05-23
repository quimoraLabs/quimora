export default function QuizCard({title, description, timeLimit, totalQuestions, handleStart}) {
  return (
      <div className="group relative w-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20">
        {/* Gradient Glow */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        {/* Top Section */}
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 text-2xl shadow-lg">
              ⚡
            </div>

            {/* Text */}
            <div>
              <h2 className="text-lg font-bold text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {totalQuestions} Questions • {timeLimit} Minutes
              </p>
            </div>
          </div>

          {/* Badge */}
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
            New
          </span>
        </div>

        {/* Description */}
        <p className="relative mt-5 text-sm leading-6 text-slate-300">
          {description}
        </p>

        {/* Button */}
        <button 
          className="relative mt-6 w-full rounded-xl bg-linear-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
          onClick={handleStart}
        >
          Start Test
        </button>
      </div>
    // </div>
  );
}
