
import { useNavigate } from "react-router-dom";

// Store & Utils
import useStudentQuizStore from "../../features/student/store/useStudentQuizStore";
import { exitFullScreen } from "../../features/student/utils/enterFullScreen";

// Exam Feature Hooks & Components
import { useExamProctoring } from "../../features/student/components/exam/hooks/useExamProctoring";
import { ExamTimer } from "../../features/student/components/exam/components/ExamTimer";
import { FullscreenLockOverlay } from "../../features/student/components/exam/components/FullscreenLockOverlay";
import { Watermark } from "../../features/student/components/exam/components/Watermark";

export default function TakeExamPage() {
  const navigate = useNavigate();

  // Active Exam Store
  const {
    attemptQuiz,
    attemptId,
    currentIndex,
    timer,
    answers,
    loading,
    isFinished,
    incrementWarning,
    selectOption,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAttempt,
  } = useStudentQuizStore();

  // Proctoring Hook
  const {
    isFullscreenLocked,
    hasExitedOnce,
    triggerFullscreenLock,
    isSubmittingRef,
  } = useExamProctoring({
    isFinished,
    attemptQuiz,
    incrementWarning,
    navigate,
  });

  // Guard: Redirect or fallback if no active attempt
  if (!attemptQuiz || !attemptId) {
    return (
      <div className="p-6 bg-main min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-muted font-semibold">
          No active quiz session initialization found.
        </p>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="px-4 py-2 bg-accent rounded text-white font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-main min-h-screen flex items-center justify-center text-main font-medium">
        Processing secure transaction submission...
      </div>
    );
  }

  const currentQuestion = attemptQuiz.questions[currentIndex];

  const handleSelectOptionIndex = (optionIndex) => {
    selectOption(currentQuestion._id, [optionIndex]);
  };

  const handleFinalSubmit = async () => {
    try {
      isSubmittingRef.current = true;
      const submitted = await submitAttempt(navigate);
      if (submitted) {
        exitFullScreen();
        return;
      }
      isSubmittingRef.current = false;
    } catch (err) {
      isSubmittingRef.current = false;
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen bg-main text-main select-none">
      {/* Background Security Watermark */}
      <Watermark />

      {/* Proctoring / Screen Lock Overlay */}
      <FullscreenLockOverlay
        isFullscreenLocked={isFullscreenLocked}
        hasExitedOnce={hasExitedOnce}
        onReenter={triggerFullscreenLock}
      />

      {/* Main Exam Environment */}
      <div className="p-6 min-h-screen flex flex-col items-center justify-center">
        {/* Floating Timer */}
        <ExamTimer timer={timer} />

        {/* Question Card */}
        <div className="w-full mx-4 max-w-3xl p-6 md:p-8 border border-soft rounded-2xl bg-surface shadow-card transition-all">
          <p className="text-muted mb-2 font-medium">
            Question {currentIndex + 1} of {attemptQuiz.questions.length}
          </p>

          <h2 className="text-2xl font-semibold mb-6">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => {
              const storedSelections = answers[currentQuestion._id];
              const isSelected =
                storedSelections !== undefined &&
                typeof storedSelections === "string" &&
                storedSelections.split(",").includes(option._id);

              return (
                <div
                  key={option._id || idx}
                  onClick={() => handleSelectOptionIndex(idx)}
                  className={`p-4 border rounded-md cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-main bg-elevated text-main"
                      : "border-main bg-surface hover:bg-elevated text-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: isSelected
                          ? "var(--color-brand-mid)"
                          : "var(--color-border-main)",
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "var(--color-brand-mid)" }}
                        />
                      )}
                    </div>
                    <span>{option.optionText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentIndex === 0}
              className="px-5 py-2 bg-surface border border-soft rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-elevated transition font-medium"
            >
              Previous
            </button>

            {currentIndex === attemptQuiz.questions.length - 1 ? (
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 bg-accent rounded-md hover:opacity-95 transition font-bold tracking-wide shadow-lg text-white"
              >
                Submit Examination
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="px-5 py-2 bg-accent rounded-md hover:opacity-95 transition font-medium text-white"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
