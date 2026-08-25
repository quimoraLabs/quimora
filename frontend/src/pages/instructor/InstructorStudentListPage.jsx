import { useEffect, useState, useMemo } from "react";
import { Users, Award, CheckCircle2, Search, Calendar, BookOpen, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import useInstructorStudents from "../../features/instructor/students/store/useInstructorStudents";
import StatCard from "../../components/common/StatCard";
import StatsGrid from "../../components/common/StatsGrid";

export default function InstructorStudentListPage() {
  const { students, studentsLoading, fetchStudents } = useInstructorStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // High level aggregated stats
  const totalStudents = students.length;
  const overallAvgScore =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.averageScore || 0), 0) /
            totalStudents
        )
      : 0;
  const totalAttempts = students.reduce(
    (acc, s) => acc + (s.totalAttempts || 0),
    0
  );

  return (
    <main className="min-h-screen bg-main px-4 py-8 text-main sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-main pb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Student Performance & Analytics
            </h1>
            <p className="text-muted text-sm mt-1">
              Track student engagement, average scores, and performance history across your quizzes.
            </p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <StatsGrid columns="3">
          <StatCard
            icon={Users}
            title="Total Active Students"
            value={totalStudents}
            change="Enrolled across tests"
            changeType="positive"
            gradient="from-cyan-500 to-blue-600"
            index={0}
          />
          <StatCard
            icon={Award}
            title="Overall Average Score"
            value={`${overallAvgScore}%`}
            change="Class performance average"
            changeType={overallAvgScore >= 50 ? "positive" : "negative"}
            gradient="from-emerald-500 to-teal-600"
            index={1}
          />
          <StatCard
            icon={CheckCircle2}
            title="Total Exam Attempts"
            value={totalAttempts}
            change="All-time submissions"
            changeType="neutral"
            gradient="from-purple-500 to-indigo-600"
            index={2}
          />
        </StatsGrid>

        {/* Filter Bar & Student Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-main bg-surface p-6 shadow-card space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-main">
            <h3 className="text-lg font-bold text-main font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Enrolled Students ({filteredStudents.length})
            </h3>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-main bg-surface pl-9 pr-4 py-2 text-xs text-main placeholder:text-muted outline-none transition focus:border-accent"
              />
            </div>
          </div>

          {studentsLoading ? (
            <div className="py-16 text-center text-muted font-medium animate-pulse">
              Loading student roster and analytics...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-muted border border-dashed border-main rounded-xl space-y-2">
              <Users className="w-10 h-10 mx-auto text-muted/40" />
              <p className="text-base font-semibold text-main">No students found</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                {searchQuery
                  ? "No students match your search criteria. Try a different query."
                  : "When students attempt quizzes published by you, their performance records will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-main">
              <table className="w-full text-left text-sm">
                <thead className="bg-elevated text-xs font-semibold uppercase text-muted tracking-wider border-b border-main">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Quizzes Attempted</th>
                    <th className="py-3.5 px-4">Avg. Score</th>
                    <th className="py-3.5 px-4">Total Attempts</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-main text-main">
                  {filteredStudents.map((student) => {
                    const avgScore = student.averageScore || 0;
                    const scoreColor =
                      avgScore >= 70
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : avgScore >= 40
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20";

                    return (
                      <tr
                        key={student.userId}
                        className="hover:bg-main/20 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent font-bold flex items-center justify-center text-sm border border-accent/20">
                              {student.name?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <div className="font-semibold text-main text-sm">
                                {student.name}
                              </div>
                              <div className="text-xs text-muted">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.isArray(student.quizzesTaken) &&
                            student.quizzesTaken.length > 0 ? (
                              student.quizzesTaken.slice(0, 2).map((quizTitle, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-elevated border border-main text-muted truncate max-w-[140px]"
                                  title={quizTitle}
                                >
                                  {quizTitle}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted">--</span>
                            )}
                            {student.quizzesTaken?.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                                +{student.quizzesTaken.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${scoreColor}`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            {avgScore}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted">
                          <span className="font-semibold text-main">
                            {student.totalAttempts}
                          </span>{" "}
                          {student.totalAttempts === 1 ? "attempt" : "attempts"}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-muted">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted" />
                            {student.lastAttemptDate
                              ? new Date(student.lastAttemptDate).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-main bg-elevated text-xs font-semibold text-main hover:border-accent hover:text-accent transition cursor-pointer"
                          >
                            <span>Summary</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Student Summary Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-main rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-main pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent text-white font-bold flex items-center justify-center text-base">
                  {selectedStudent.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-main">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-muted">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-muted hover:text-main font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                <span className="text-[10px] uppercase font-semibold text-muted">
                  Average Score
                </span>
                <p className="text-xl font-bold text-emerald-500 mt-0.5">
                  {selectedStudent.averageScore}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-elevated border border-main text-center">
                <span className="text-[10px] uppercase font-semibold text-muted">
                  Total Attempts
                </span>
                <p className="text-xl font-bold text-main mt-0.5">
                  {selectedStudent.totalAttempts}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Quizzes Attempted
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {selectedStudent.quizzesTaken?.map((title, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-elevated border border-main text-xs text-main font-medium flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-main flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:opacity-90 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}