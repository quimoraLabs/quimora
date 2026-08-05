import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MoreVertical } from "lucide-react";

const RecentQuizzesTable = ({ quizzes }) => {
  return (
    <div className="lg:col-span-2 bg-surface border border-main rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-main">
            Recent Quizzes
          </h3>
          <p className="text-muted text-xs">
            Manage and view performance of active tests
          </p>
        </div>
        <button className="text-xs text-accent hover:underline font-medium flex items-center gap-1 group">
          View All{" "}
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted">
          <thead className="bg-elevated text-muted text-xs uppercase tracking-wider border-b border-main">
            <tr>
              <th className="py-3 px-4">Quiz Title</th>
              <th className="py-3 px-4">Attempts</th>
              <th className="py-3 px-4">Avg. Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            <AnimatePresence>
              {quizzes.map((quiz, i) => (
                <motion.tr
                  key={quiz.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-elevated/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-main">
                    {quiz.title}
                    <div className="text-xs text-muted font-normal">
                      {quiz.questions} Questions
                    </div>
                  </td>
                  <td className="py-4 px-4">{quiz.attempts}</td>
                  <td className="py-4 px-4 font-semibold text-main">
                    {quiz.avgScore}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        quiz.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-elevated transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentQuizzesTable;
