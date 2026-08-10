import { Navigate } from "react-router-dom";
import { useGetMeQuery } from "../features/auth/authApi";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import MessagePage from "../shared/components/MessagePage";
import { AlertCircle } from "../shared/components/Icons";

export function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

/** Role gate — keeps students out of /admin, admins off student home, and unverified students on /verify-email */
export function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  const { data: meData } = useGetMeQuery(undefined, { skip: !token });

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

export function VerifyEmailGate() {
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
