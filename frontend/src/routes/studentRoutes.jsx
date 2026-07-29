import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import StudentDashboard from "../pages/dashboards/student/dashboard/StudentDashboard";
import StudentQuiz from "../pages/dashboards/student/dashboard/quiz/Quiz";
import StudentResult from "../pages/dashboards/student/result/StudentResult";
import { QuizLanding } from "../pages/dashboards/student/dashboard/quiz/QuizLanding";
import StudentQuizQuestions from "../pages/dashboards/student/dashboard/quiz/QuizQuestions";
import { ResultCard } from "../pages/dashboards/student/dashboard/quiz/TestResult";

export const StudentRoutes = () => (
  <>
    {/* Student Dashboard Routes (Inside Dashboard Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/quizzes" element={<StudentQuiz />} />
      <Route path="/student/my-attempts" element={<StudentResult />} />
    </Route>
  </>
);

export const StudentQuizRoutes = () => (
  <>
    {/* Student Fullscreen Quiz Routes (No Sidebar Layout) */}
    <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
      <Route path="/student/quiz/rules" element={<QuizLanding />} />
      <Route path="/student/quiz/start" element={<StudentQuizQuestions />} />
      <Route path="/student/quiz/results" element={<ResultCard />} />
    </Route>
  </>
);
