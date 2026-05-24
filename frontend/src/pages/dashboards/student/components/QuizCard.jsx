export default function QuizCard({ title, description, timeLimit, totalQuestions, handleStart }) {
  return (

    <div className="group relative w-auto overflow-hidden rounded-2xl border border-border-main bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-mid/50  hover:shadow-2xl hover:shadow-brand-mid/10">
      
      {/* Dynamic Brand linear Glow on Hover */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-start/10 via-brand-mid/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      {/* Top Section */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          
          {/* Static Lightning Bolt Icon Container */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 text-2xl shadow-lg">
            ⚡
          </div>

          {/* Heading and Meta Info */}
          <div>
            <h2 className="text-lg font-bold text-main transition-colors duration-300 group-hover:text-brand-primary">
              {title.slice(0, 25)}{title.length > 25 ? "..." : ""}
            </h2>

            <p className="mt-1 text-sm text-muted">
              {totalQuestions} Questions • {timeLimit} Minutes
            </p>
          </div>
        </div>

        {/* Action Badge component aligned with brand coloring */}
        <span className="rounded-full bg-brand-mid/10 px-3 py-1 text-xs font-semibold text-brand-mid border border-brand-mid/20">
          New
        </span>
      </div>

      {/* Description Snippet */}
      <p className="relative mt-5 text-sm leading-6 text-muted">
        {description.slice(0, 50)}{description.length > 50 ? "..." : ""}
      </p>

      {/* Interactive Action Button mapping to global brand identifiers */}
      <button 
        className="relative mt-6 w-full rounded-xl bg-linear-to-r from-brand-mid to-brand-end py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-end/20 active:scale-[0.98]"
        onClick={handleStart}
      >
        Start Test
      </button>
      
    </div>
  );
}