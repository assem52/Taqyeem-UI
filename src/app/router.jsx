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
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import { useGetMeQuery } from "../features/auth/authApi";

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

/** Role gate — keeps students out of /admin, admins off student home, and unverified students on /verify-email */
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
    return (
      <Navigate
        to={currentRole === 'ADMIN' ? '/admin/quizzes' : '/'}
        replace
      />
    );
  }

  const { data: meData } = useGetMeQuery(undefined, { skip: !token });
  if (meData?.status) {
    localStorage.setItem('status', meData.status);
    if (meData.email) localStorage.setItem('email', meData.email);
  }

  const currentStatus = meData?.status ?? localStorage.getItem('status');
  if (role === 'STUDENT' && currentStatus === 'UNVERIFIED') {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

function VerifyEmailGate() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const { data: meData } = useGetMeQuery(undefined, { skip: !token });
  if (meData?.status) {
    localStorage.setItem('status', meData.status);
    if (meData.email) localStorage.setItem('email', meData.email);
  }

  const currentStatus = meData?.status ?? localStorage.getItem('status');

  if (token && role === 'STUDENT' && currentStatus === 'VERIFIED') {
    return <Navigate to="/" replace />;
  }

  if (token && role === 'ADMIN') {
    return <Navigate to="/admin/quizzes" replace />;
  }

  return <VerifyEmailPage />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailGate /> },
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
