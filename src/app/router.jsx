
import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "../features/studentQuizzes/pages/DashboardPage";
import QuizGatewayPage from "../features/studentQuizzes/pages/QuizGatewayPage";
import NotFound from "../shared/components/NotFound";

export const router = createBrowserRouter([
    { path: '/', element: <DashboardPage /> },
    { path: '/quizzes/:quizId', element: <QuizGatewayPage /> },
    { path: '*', element: <NotFound /> },
])