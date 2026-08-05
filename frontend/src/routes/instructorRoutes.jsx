import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import InstructorQuizzesDashboard from "../pages/dashboards/instructor/quiz/Quiz";
import ViewQuiz from "../pages/dashboards/instructor/quiz/ViewQuiz";
import CreateQuiz from "../pages/dashboards/instructor/quiz/AddQuiz";
import InstructorStudentDash from "../pages/dashboards/instructor/student/StudentDash";

export const InstructorRoutes = () => (
  <Route element={<ProtectedRoutes allowedRoles={["instructor"]} />}>
    <Route path="/instructor" element={<InstructorDashboardPage />} />
    <Route
      path="/instructor/quizzes"
      element={<InstructorQuizzesDashboard />}
    />
    <Route path="/instructor/quizzes/create" element={<CreateQuiz />} />
    <Route path="/instructor/quizzes/:quizId" element={<ViewQuiz />} />
    <Route path="/instructor/students" element={<InstructorStudentDash />} />
  </Route>
);
