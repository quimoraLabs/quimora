import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import QuizListPage from "../pages/student/QuizListPage";
import StudentResult from "../pages/student/QuizHistoryPage";
import ExamInstructionsPage from "../pages/student/ExamInstructionsPage";
import TakeExamPage from "../pages/student/TakeExamPage";
import { ResultCard } from "../pages/student/TestResult";

export const StudentRoutes = () => (
  <>
    {/* Student Dashboard Routes (Inside Dashboard Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/student/quizzes" element={<QuizListPage />} />
      <Route path="/student/my-attempts" element={<StudentResult />} />
    </Route>
  </>
);

export const StudentQuizRoutes = () => (
  <>
    {/* Student Fullscreen Quiz Routes (No Sidebar Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student/quiz/rules" element={<ExamInstructionsPage />} />
      <Route path="/student/quiz/start" element={<TakeExamPage />} />
      <Route path="/student/quiz/results" element={<ResultCard />} />
    </Route>
  </>
);
