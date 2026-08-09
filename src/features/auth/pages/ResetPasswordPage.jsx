import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../authApi';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      const response = await resetPassword({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        password,
      }).unwrap();
      setMessage(response?.message || 'Password updated.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setErrorMsg(
        err?.data?.message || 'Invalid or expired reset token. Please try again.',
      );
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Paste the reset token from your email (or the API log in development)."
      footer={
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      }
    >
      {message ? (
        <div
          role="status"
          className="border-success/20 bg-success/10 text-success mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {message}
        </div>
      ) : null}
      {errorMsg ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
          />
        </div>
        <div>
          <label htmlFor="reset-token" className={authLabelClass}>
            Reset token
          </label>
          <input
            id="reset-token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className={authFieldClass}
          />
        </div>
        <div>
          <label htmlFor="reset-password" className={authLabelClass}>
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={isLoading} className={`${authPrimaryBtnClass} mt-2`}>
          {isLoading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}
