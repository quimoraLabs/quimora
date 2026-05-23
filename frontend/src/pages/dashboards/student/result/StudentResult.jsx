import { useEffect, useState } from "react";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import ResultModal from "../components/ResultModal";
import useAttemptQuizStore from "../../../../store/useAttemptQuizStore";
import Loader from "../../../../components/Loader";
import { formatDate } from "../../../../utils/formatDate";

// const dummyAttempts = [
//   {
//     id: "1",
//     quizTitle: "JavaScript Fundamentals",
//     category: "Coding",
//     score: 85,
//     totalQuestions: 20,
//     correctAnswers: 17,
//     incorrectAnswers: 3,
//     timeTaken: "12:45",
//     date: "2026-05-18",
//     status: "Passed",
//   },
//   {
//     id: "2",
//     quizTitle: "Git & GitHub Basics",
//     category: "Coding",
//     score: 40,
//     totalQuestions: 10,
//     correctAnswers: 4,
//     incorrectAnswers: 6,
//     timeTaken: "05:20",
//     date: "2026-05-19",
//     status: "Failed",
//   },
// ];

export default function StudentResult() {
  const { studentAllResults } = useAttemptQuizStore();

useEffect(() => {
  studentAllResults();
}, [studentAllResults]);

const { quizResults,loading } = useAttemptQuizStore();
console.log(quizResults);


 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const openReport = (attempt) => {
    setSelectedAttempt(attempt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAttempt(null);
  };

  if(loading) {
    return <Loader />;
}

  return (
    <div className="p-4 md:p-6 min-h-screen text-slate-100 relative">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Your Quiz Attempts
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your past performance and detailed test analysis.
        </p>
      </div>

      {/* Attempts Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#151f32] text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="p-4">Quiz Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Score</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Time Taken</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {quizResults?.map((attempt) => {
                const isPassed = attempt.score >= 50;
                return (
                  <tr key={attempt.id} className="hover:bg-slate-800/40 transition-colors duration-150">
                    <td className="p-4 font-medium text-white">
                      <div>
                        {attempt.quizId.title}
                        {/* <span className="ml-2 inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                          {attempt.category}
                        </span> */}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(attempt.completedAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {attempt.correctAnswersCount}/{attempt.totalQuestions} Qns
                    </td>
                    <td className="p-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {attempt.timeTaken} mins
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* FIX: Trigger modal on click */}
                      <button 
                        onClick={() => openReport(attempt)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                      >
                        View Report
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REPORT MODAL --- */}
      {isModalOpen && selectedAttempt && (
        <ResultModal selectedAttempt={selectedAttempt} closeModal={closeModal} />
      )}
    </div>
  );
}