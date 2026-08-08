import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "../features/studentQuizzes/pages/DashboardPage";
import QuizGatewayPage from "../features/studentQuizzes/pages/QuizGatewayPage";
import AdminFollowUpPage from "../features/adminFollowUp/pages/AdminFollowUpPage";
import AdminQuizzesListPage from "../features/adminQuizzes/pages/AdminQuizzesListPage";
import QuestionBankPage from "../features/questionBank/pages/QuestionBankPage";
import InvitationPage from "../features/studentQuizzes/pages/InvitationPage";
import QuizAttemptPage from "../features/studentQuizzes/pages/QuizAttemptPage";
import NotFound from "../shared/components/NotFound";
import LoginPage from "../features/auth/pages/LoginPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
    { path: '/', element: <DashboardPage /> },
    { path: '/quizzes/:quizId', element: <QuizGatewayPage /> },
    { path: '/admin', element: <Navigate to="/admin/quizzes" replace /> },
    { path: '/admin/quizzes', element: <AdminQuizzesListPage /> },
    { path: '/admin/quizzes/:quizId/questions', element: <QuestionBankPage /> },
    { path: '/admin/follow-up', element: <AdminFollowUpPage /> },
    { path: '/quizzes/:quizId/attempt', element: <QuizAttemptPage /> },
    { path: '/invite/:token', element: <InvitationPage /> },
    { path: '*', element: <NotFound /> },
]);