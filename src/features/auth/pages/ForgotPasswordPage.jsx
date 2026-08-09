import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../authApi';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    try {
      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      }).unwrap();
      setMessage(
        response?.message ||
          'If an account exists for that email, password reset instructions have been sent.',
      );
    } catch (err) {
      setErrorMsg(
        err?.data?.message || 'Could not start password reset. Please try again.',
      );
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email. We’ll send reset instructions if an account exists."
      footer={
        <>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
          {' · '}
          <Link to="/reset-password" className="text-primary font-semibold hover:underline">
            I have a token
          </Link>
        </>
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
          <label htmlFor="forgot-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
            autoComplete="email"
          />
        </div>
        <button type="submit" disabled={isLoading} className={`${authPrimaryBtnClass} mt-2`}>
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}
