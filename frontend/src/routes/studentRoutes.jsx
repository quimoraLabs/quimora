import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentQuiz from "../pages/student/Quiz";
import StudentResult from "../pages/student/StudentResult";
import { QuizLanding } from "../pages/student/QuizLanding";
import StudentQuizQuestions from "../pages/student/QuizQuestions";
import { ResultCard } from "../pages/student/TestResult";

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
