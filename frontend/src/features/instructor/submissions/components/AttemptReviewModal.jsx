import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle2, XCircle, Clock, Award, HelpCircle } from "lucide-react";

export default function AttemptReviewModal({
  isOpen,
  onClose,
  reviewData,
  loading,
}) {
  if (!isOpen) return null;

  const student = reviewData?.student || {};
  const quiz = reviewData?.quiz || {};
  const questionSnapshots = reviewData?.questionSnapshots || [];
  const answers = reviewData?.answers || [];

  // Map answers by questionId for quick lookup
  const answerMap = new Map();
  answers.forEach((ans) => {
    answerMap.set(String(ans.questionId), ans);
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-2xl transition-all border border-main">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-main">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Student Answer Sheet Review
                    </span>
                    <Dialog.Title className="text-xl font-bold font-display text-main mt-0.5">
                      {student.name || "Student"}&apos;s Submission
                    </Dialog.Title>
                    <p className="text-xs text-muted mt-0.5">
                      {student.email} • Quiz: <strong className="text-main">{quiz.title}</strong>
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-main/50 transition cursor-pointer text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-muted font-medium animate-pulse">
                    Loading answer sheet details...
                  </div>
                ) : !reviewData ? (
                  <div className="py-12 text-center text-muted">
                    No attempt details available.
                  </div>
                ) : (
                  <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Summary KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                        <Award className="w-4 h-4 mx-auto text-accent mb-1" />
                        <span className="text-[10px] text-muted uppercase font-semibold">
                          Score
                        </span>
                        <p className="text-lg font-bold text-main">
                          {reviewData.score}%
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                        <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                        <span className="text-[10px] text-muted uppercase font-semibold">
                          Correct Answers
                        </span>
                        <p className="text-lg font-bold text-emerald-500">
                          {reviewData.correctAnswersCount} /{" "}
                          {reviewData.totalQuestions}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                        <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                        <span className="text-[10px] text-muted uppercase font-semibold">
                          Time Spent
                        </span>
                        <p className="text-lg font-bold text-main">
                          {Math.floor((reviewData.timeTaken || 0) / 60)}m{" "}
                          {(reviewData.timeTaken || 0) % 60}s
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                        <HelpCircle className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                        <span className="text-[10px] text-muted uppercase font-semibold">
                          Accuracy
                        </span>
                        <p className="text-lg font-bold text-main">
                          {Math.round(
                            (reviewData.correctAnswersCount /
                              (reviewData.totalQuestions || 1)) *
                              100
                          )}
                          %
                        </p>
                      </div>
                    </div>

                    {/* Question Breakdown List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                        Detailed Question Breakdown ({questionSnapshots.length})
                      </h4>

                      {questionSnapshots.map((q, idx) => {
                        const studentAnswer = answerMap.get(
                          String(q.questionId)
                        );
                        const selectedOpts =
                          studentAnswer?.selectedOptions || [];
                        const isStudentCorrect = studentAnswer?.isCorrect;

                        return (
                          <div
                            key={q.questionId || idx}
                            className={`p-4 rounded-xl border transition ${
                              isStudentCorrect
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : selectedOpts.length === 0
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-red-500/30 bg-red-500/5"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface border border-main text-main">
                                  Q{idx + 1}
                                </span>
                                <span className="text-xs text-muted uppercase">
                                  {q.difficulty} • {q.marks}{" "}
                                  {q.marks === 1 ? "Mark" : "Marks"}
                                </span>
                              </div>

                              <div>
                                {isStudentCorrect ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                  </span>
                                ) : selectedOpts.length === 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                                    Not Attempted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-sm font-semibold text-main mb-3">
                              {q.questionText}
                            </p>

                            {/* Options */}
                            <div className="space-y-1.5">
                              {q.options?.map((opt, oIdx) => {
                                const isSelectedByStudent = selectedOpts.includes(
                                  opt.optionText
                                );
                                const isCorrectChoice = opt.isCorrect;

                                let borderBg =
                                  "border-main/50 bg-surface/50 text-muted";
                                if (isCorrectChoice) {
                                  borderBg =
                                    "border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium";
                                } else if (
                                  isSelectedByStudent &&
                                  !isCorrectChoice
                                ) {
                                  borderBg =
                                    "border-red-500/50 bg-red-500/15 text-red-600 dark:text-red-400 font-medium";
                                }

                                return (
                                  <div
                                    key={opt._id || oIdx}
                                    className={`px-3 py-2 text-xs rounded-lg border flex items-center justify-between ${borderBg}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold">
                                        {String.fromCharCode(65 + oIdx)}.
                                      </span>
                                      <span>{opt.optionText}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                                      {isSelectedByStudent && (
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 font-semibold">
                                          Student Choice
                                        </span>
                                      )}
                                      {isCorrectChoice && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-semibold">
                                          Correct Option
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-main flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-accent text-white hover:opacity-90 transition cursor-pointer"
                  >
                    Close Review
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
