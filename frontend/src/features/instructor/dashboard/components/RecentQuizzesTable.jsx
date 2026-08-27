import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  MoreVertical,
  BookOpen,
  Layers,
  Eye,
  Trash2,
  Lock,
} from "lucide-react";

const RecentQuizzesTable = ({
  quizzes = [],
  onViewQuiz = () => {},
  onDeleteQuiz = () => {},
}) => {
  return (
    <div className="lg:col-span-2 bg-surface border border-main rounded-2xl p-6 shadow-card transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-main tracking-tight flex items-center gap-2">
            Recent Quizzes
          </h3>
          <p className="text-muted text-xs mt-0.5">
            Manage and monitor performance of active tests
          </p>
        </div>
        <motion.button
          whileHover={{ x: 2 }}
          className="text-xs text-accent hover:opacity-80 font-semibold flex items-center gap-1 group transition-colors px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-137.5 text-left text-sm text-main">
          <thead>
            <tr className="text-muted text-[11px] uppercase tracking-wider border-b border-main bg-elevated/50">
              <th className="py-3 px-4 rounded-l-lg">Quiz Details</th>
              <th className="py-3 px-4">Attempts</th>
              <th className="py-3 px-4">Avg. Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soft">
            <AnimatePresence>
              {quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-muted text-xs"
                  >
                    No quizzes found. Create your first quiz to see stats here.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz, i) => {
                  const isPublished =
                    quiz.status?.toLowerCase() === "published" ||
                    quiz.status?.toLowerCase() === "active";
                  const quizId = quiz._id || quiz.id;

                  return (
                    <motion.tr
                      key={quizId || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                      className="group/row hover:bg-elevated/60 transition-all duration-200"
                    >
                      {/* Quiz Title & Questions */}
                      <td className="py-4 px-4 font-medium text-main">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-accent group-hover/row:scale-105 transition-transform shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-main group-hover/row:text-accent transition-colors line-clamp-1">
                              {quiz.title}
                            </p>
                            <span className="text-[11px] text-muted font-normal flex items-center gap-1 mt-0.5">
                              <Layers className="w-3 h-3 text-muted" />
                              {quiz.totalQuestions || quiz.questions || 0}{" "}
                              Questions
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Attempts */}
                      <td className="py-4 px-4 font-semibold text-main">
                        {quiz.attemptsCount ?? quiz.attempts ?? 0}
                      </td>

                      {/* Avg Score */}
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            quiz.avgScore && quiz.avgScore !== "--"
                              ? "text-emerald-500"
                              : "text-muted"
                          }`}
                        >
                          {quiz.avgScore ? `${quiz.avgScore}` : "--"}
                        </span>
                      </td>

                      {/* Status Tag */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                            isPublished
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-amber-500"
                            }`}
                          />
                          {quiz.status || "Draft"}
                        </span>
                      </td>

                      {/* Headless UI v2 Action Menu */}
                      <td className="py-4 px-4 text-right">
                        <Menu>
                          <MenuButton className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-elevated transition-colors focus:outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </MenuButton>

                          <MenuItems
                            anchor="bottom end"
                            className="z-50 w-44 rounded-xl bg-surface border border-main shadow-card p-1.5 focus:outline-none"
                          >
                            {/* View Action */}
                            <MenuItem>
                              <button
                                onClick={() => onViewQuiz(quizId)}
                                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted data-focus:bg-elevated data-focus:text-main transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-accent" />
                                View Analytics
                              </button>
                            </MenuItem>

                            {/* Disabled Edit Option for Live Quizzes */}
                            {isPublished && (
                              <MenuItem disabled>
                                <div className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium text-muted/40 cursor-not-allowed">
                                  <Lock className="w-3.5 h-3.5" />
                                  Editing locked (Live)
                                </div>
                              </MenuItem>
                            )}

                            {/* Delete Action */}
                            <MenuItem>
                              <button
                                onClick={() => onDeleteQuiz(quizId)}
                                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-500/80 data-focus:bg-red-500/10 data-focus:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Quiz
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentQuizzesTable;
