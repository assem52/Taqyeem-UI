import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation } from '../authApi';
import AppHeader from '../../../shared/components/AppHeader';
import { Loader2 } from '../../../shared/components/Icons';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();

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
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err?.data?.message || 'Verification failed. Check your email and token.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-soft"
        >
          <h1 className="text-2xl font-bold text-heading">Verify your email</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the email and verification token from your registration message.
          </p>

          {error ? (
            <p className="mt-4 rounded-button border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-button border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
              {message}
            </p>
          ) : null}

          <label className="mt-6 block text-sm font-medium text-heading" htmlFor="verify-email">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-input border border-border bg-background px-3.5 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />

          <label className="mt-4 block text-sm font-medium text-heading" htmlFor="verify-token">
            Verification token
          </label>
          <input
            id="verify-token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1.5 w-full rounded-input border border-border bg-background px-3.5 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-button bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-hover disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="mr-2" />}
            Verify email
          </button>
        </form>
      </main>
    </div>
  );
}
