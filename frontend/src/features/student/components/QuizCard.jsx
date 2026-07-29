import {
  ArrowRight,
  Brain,
  Clock3,
  FileQuestion,
  Trophy,
} from "lucide-react";

export default function QuizCard({
  title,
  description,
  timeLimit,
  totalQuestions,
  handleStart,
}) {
  return (
    <div
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      border-main
      bg-surface
      p-6
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-brand-primary/40
      hover:shadow-xl
      hover:shadow-brand-primary/10
    "
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-br from-brand-primary/5 via-brand-mid/5 to-transparent" />

      {/* Header */}
      <div className="relative flex items-start gap-4">
        <div
          className="
          flex h-14 w-14 shrink-0 items-center justify-center
          rounded-2xl
          bg-linear-to-br
          from-brand-primary
          via-brand-mid
          to-brand-end
          shadow-lg
          shadow-brand-primary/20
        "
        >
          <Brain className="h-7 w-7 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-main leading-tight">
              {title}
            </h2>

            <span
              className="
              rounded-full
              bg-emerald-500/10
              px-3
              py-1
              text-xs
              font-semibold
              text-emerald-500
              border
              border-emerald-500/20
            "
            >
              Easy
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-muted">
            {description.length > 90
              ? description.slice(0, 90) + "..."
              : description}
          </p>
        </div>
      </div>

      {/* Divider */}

      <div className="my-5 border-t border-main"></div>

      {/* Stats */}

      <div className="flex flex-wrap items-center gap-5 text-sm">

        <div className="flex items-center gap-2 text-muted">
          <FileQuestion className="h-4 w-4 text-brand-primary" />
          <span>
            <strong className="text-main">{totalQuestions}</strong>{" "}
            Questions
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted">
          <Clock3 className="h-4 w-4 text-brand-primary" />
          <span>
            <strong className="text-main">{timeLimit}</strong>{" "}
            Minutes
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted">
          <Trophy className="h-4 w-4 text-brand-primary" />
          <span>
            <strong className="text-main">100</strong>{" "}
            Marks
          </span>
        </div>
      </div>

      {/* Button */}

      <button
        onClick={handleStart}
        className="
        group
        mt-6
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-2xl
        bg-linear-to-r
        from-brand-primary
        via-brand-mid
        to-brand-end
        py-3.5
        font-semibold
        text-white
        transition-all
        duration-300
        hover:shadow-lg
        hover:shadow-brand-primary/30
      "
      >
        Start Test

        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}