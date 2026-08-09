import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "../features/studentQuizzes/pages/DashboardPage";
import QuizGatewayPage from "../features/studentQuizzes/pages/QuizGatewayPage";
import AdminFollowUpPage from "../features/adminFollowUp/pages/AdminFollowUpPage";
import AdminQuizzesListPage from "../features/adminQuizzes/pages/AdminQuizzesListPage";
import QuizWorkspacePage from "../features/adminQuizzes/pages/QuizWorkspacePage";
import AdminAttemptReviewPage from "../features/adminQuizzes/pages/AdminAttemptReviewPage";
import QuestionBankPage from "../features/questionBank/pages/QuestionBankPage";
import InvitationPage from "../features/studentQuizzes/pages/InvitationPage";
import QuizAttemptPage from "../features/studentQuizzes/pages/QuizAttemptPage";
import QuizResultsPage from "../features/studentQuizzes/pages/QuizResultsPage";
import NotFound from "../shared/components/NotFound";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import MessagePage from "../shared/components/MessagePage";
import { AlertCircle } from "../shared/components/Icons";

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = localStorage.getItem('role');
  if (!currentRole) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== role) {
    const home = currentRole === 'ADMIN' ? '/admin/quizzes' : '/';
    return (
      <MessagePage
        icon={AlertCircle}
        title="Wrong account type"
        description={
          role === 'ADMIN'
            ? 'This area is for instructors only. Sign in with an admin account, or go back to your learner home.'
            : 'This area is for learners only. Sign in with a student account, or go back to your instructor home.'
        }
        buttonText={currentRole === 'ADMIN' ? 'Go to instructor home' : 'Go to learner home'}
        buttonLink={home}
      />
    );
  }

  return children;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RequireRole role="STUDENT">
          <DashboardPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/quizzes/:quizId',
    element: (
      <RequireAuth>
        <RequireRole role="STUDENT">
          <QuizGatewayPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/quizzes/:quizId/attempt',
    element: (
      <RequireAuth>
        <RequireRole role="STUDENT">
          <QuizAttemptPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/quizzes/:quizId/results',
    element: (
      <RequireAuth>
        <RequireRole role="STUDENT">
          <QuizResultsPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <Navigate to="/admin/quizzes" replace />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/quizzes',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <AdminQuizzesListPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/quizzes/:quizId',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <QuizWorkspacePage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/quizzes/:quizId/questions',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <QuestionBankPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/attempts/:attemptId',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <AdminAttemptReviewPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/follow-up',
    element: (
      <RequireAuth>
        <RequireRole role="ADMIN">
          <AdminFollowUpPage />
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/invite/:token',
    element: <InvitationPage />,
  },
  { path: '*', element: <NotFound /> },
]);
