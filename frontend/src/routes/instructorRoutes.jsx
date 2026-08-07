import { Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import InstructorDashboardPage from "../pages/instructor/InstructorDashboardPage";
import QuizPage from "../pages/instructor/InstructorQuizListPage";
import InstructorQuizViewPage from "../pages/instructor/InstructorQuizViewPage";
import InstructorStudentListPage from "../pages/instructor/InstructorStudentListPage";

export const InstructorRoutes = () => (
  <Route element={<ProtectedRoutes allowedRoles={["instructor"]} />}>
    <Route path="/instructor" element={<InstructorDashboardPage />} />
    <Route path="/instructor/quizzes" element={<QuizPage />} />
    <Route
      path="/instructor/quizzes/:quizId"
      element={<InstructorQuizViewPage />}
    />
    <Route path="/instructor/students" element={<InstructorStudentListPage />} />
  </Route>
);
