// src/features/quiz/components/FullscreenLockOverlay.jsx

export function FullscreenLockOverlay({
  isFullscreenLocked,
  hasExitedOnce,
  onReenter,
}) {
  if (isFullscreenLocked) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 text-center backdrop-blur-md">
      {hasExitedOnce ? (
        <div className="max-w-md bg-elevated p-8 border border-accent/20 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-2xl font-black text-accent uppercase tracking-wide">
            Security Protocol Violation
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            You exited full-screen mode. According to exam rules, taking the
            test on a smaller screen is not allowed.
          </p>
          <button
            onClick={onReenter}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold"
          >
            Re-Enter Fullscreen Hall
          </button>
        </div>
      ) : (
        <div className="max-w-md bg-elevated p-8 border border-soft rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-2xl font-black text-accent uppercase tracking-wide">
            Examination Hall Entry
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Click below to set up the secure proctoring environment and begin
            the test.
          </p>
          <button
            onClick={onReenter}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold"
          >
            Start & Initialize Exam
          </button>
        </div>
      )}
    </div>
  );
}
