import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import QuizListPage from "../pages/student/QuizListPage";
import StudentResult from "../pages/student/QuizHistoryPage";
import ExamInstructionsPage from "../pages/student/ExamInstructionsPage";
import TakeExamPage from "../pages/student/TakeExamPage";
import SingleAttemptResultPage from "../pages/student/SingleAttemptResultPage";
import StudentFullReportPage from "../pages/student/StudentFullReportPage";


import StudentReportsPage from "../pages/student/StudentReportsPage";
import StudentWeakAreasPage from "../pages/student/StudentWeakAreasPage";
import StudentLeaderboardPage from "../pages/student/StudentLeaderboardPage";
import StudentBadgesPage from "../pages/student/StudentBadgesPage";

export const StudentRoutes = () => (
  <>
    {/* Student Dashboard Routes (Inside Dashboard Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/student/quizzes" element={<QuizListPage />} />
      <Route path="/student/reports" element={<StudentReportsPage />} />
      <Route path="/student/my-attempts" element={<StudentResult />} />
      <Route path="/student/weak-areas" element={<StudentWeakAreasPage />} />
      <Route path="/student/leaderboard" element={<StudentLeaderboardPage />} />
      <Route path="/student/badges" element={<StudentBadgesPage />} />
    </Route>
  </>
);

export const StudentQuizRoutes = () => (
  <>
    {/* Student Fullscreen Quiz Routes (No Sidebar Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student/quiz/rules" element={<ExamInstructionsPage />} />
      <Route path="/student/quizzes/:quizId" element={<ExamInstructionsPage />} />
      <Route path="/student/quiz/start" element={<TakeExamPage />} />
      <Route
        path="/student/quiz/results"
        element={<SingleAttemptResultPage />}
      />
      <Route
        path="/student/attempts/:attemptId/report"
        element={<StudentFullReportPage />}
      />
    </Route>
  </>
);
