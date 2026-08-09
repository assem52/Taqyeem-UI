import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '../authApi';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';
import { Loader2 } from '../../../shared/components/Icons';

const DEV_CODE = '00000';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();

  const canSubmit = useMemo(
    () => email.trim().length > 3 && token.trim().length > 0,
    [email, token],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await verifyEmail({
        email: email.trim(),
        token: token.trim(),
      }).unwrap();
      setMessage(result?.message || 'Email verified successfully.');
      localStorage.setItem('status', 'VERIFIED');
      const loginTarget = next
        ? `/login?next=${encodeURIComponent(next)}`
        : '/login';
      setTimeout(() => navigate(loginTarget), 1000);
    } catch (err) {
      setError(
        err?.data?.message ||
          'Verification failed. Check your email and code.',
      );
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Enter your email to resend verification.');
      return;
    }
    try {
      const result = await resendVerification({
        email: email.trim().toLowerCase(),
      }).unwrap();
      setMessage(
        result?.message ||
          (import.meta.env.DEV
            ? `Dev mode: use code ${DEV_CODE}.`
            : 'If that account needs verification, a new code has been sent.'),
      );
    } catch (err) {
      setError(err?.data?.message || 'Could not resend verification.');
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        import.meta.env.DEV
          ? `Enter the code from your email. Dev escape code: ${DEV_CODE}.`
          : 'Enter the verification code from your email, or open the link we sent you.'
      }
      footer={
        <Link
          to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="text-primary font-semibold hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {error ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {error}
        </div>
      ) : null}
      {message ? (
        <div
          role="status"
          className="border-success/20 bg-success/10 text-success mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="verify-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
            required
          />
        </div>
        <div>
          <label htmlFor="verify-token" className={authLabelClass}>
            Verification code
          </label>
          <input
            id="verify-token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={import.meta.env.DEV ? DEV_CODE : 'Enter code'}
            className={authFieldClass}
            required
          />
          {import.meta.env.DEV ? (
            <p className="text-muted mt-1.5 text-xs">
              Prefer the emailed code. Escape:{' '}
              <span className="text-heading font-semibold">{DEV_CODE}</span>
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className={`${authPrimaryBtnClass} mt-2 inline-flex items-center justify-center gap-2`}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          {isLoading ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="text-primary mt-4 text-sm font-semibold hover:underline disabled:opacity-50"
      >
        {isResending ? 'Sending…' : 'Resend verification email'}
      </button>
    </AuthShell>
  );
}
