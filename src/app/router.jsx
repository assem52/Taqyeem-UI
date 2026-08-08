import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "../features/studentQuizzes/pages/DashboardPage";
import QuizGatewayPage from "../features/studentQuizzes/pages/QuizGatewayPage";
import AdminFollowUpPage from "../features/adminFollowUp/pages/AdminFollowUpPage";
import AdminQuizzesListPage from "../features/adminQuizzes/pages/AdminQuizzesListPage";
import InvitationPage from "../features/studentQuizzes/pages/InvitationPage";
import QuizAttemptPage from "../features/studentQuizzes/pages/QuizAttemptPage";
import NotFound from "../shared/components/NotFound";
import LoginPage from "../features/auth/pages/LoginPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { 
      path: '/', 
      element: <RequireAuth><DashboardPage /></RequireAuth> 
    },
    { 
      path: '/quizzes/:quizId', 
      element: <RequireAuth><QuizGatewayPage /></RequireAuth> 
    },
    { 
      path: '/admin', 
      element: <RequireAuth><Navigate to="/admin/quizzes" replace /></RequireAuth> 
    },
    { 
      path: '/admin/quizzes', 
      element: <RequireAuth><AdminQuizzesListPage /></RequireAuth> 
    },
    { 
      path: '/admin/follow-up', 
      element: <RequireAuth><AdminFollowUpPage /></RequireAuth> 
    },
    { 
      path: '/quizzes/:quizId/attempt', 
      element: <RequireAuth><QuizAttemptPage /></RequireAuth> 
    },
    { 
      path: '/invite/:token', 
      element: <InvitationPage /> 
    },
    { path: '*', element: <NotFound /> },
]);