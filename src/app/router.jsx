import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "../features/studentQuizzes/pages/DashboardPage";
import QuizGatewayPage from "../features/studentQuizzes/pages/QuizGatewayPage";
import AdminFollowUpPage from "../features/adminFollowUp/pages/AdminFollowUpPage";
import AdminQuizzesListPage from "../features/adminQuizzes/pages/AdminQuizzesListPage";
import NotFound from "../shared/components/NotFound";

export const router = createBrowserRouter([
    { path: '/', element: <DashboardPage /> },
    { path: '/quizzes/:quizId', element: <QuizGatewayPage /> },
    { path: '/admin', element: <Navigate to="/admin/quizzes" replace /> },
    { path: '/admin/quizzes', element: <AdminQuizzesListPage /> },
    { path: '/admin/follow-up', element: <AdminFollowUpPage /> },
    { path: '*', element: <NotFound /> },
])