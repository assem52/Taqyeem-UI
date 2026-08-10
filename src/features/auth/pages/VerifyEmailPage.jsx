<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
  useGetMeQuery,
} from '../authApi';
import { clearAuthSession } from '../../../shared/utils/authSession';

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem('token');
  const { data: meData } = useGetMeQuery(undefined, { skip: !token });

  const initialEmail =
    meData?.email ||
    location.state?.email ||
    searchParams.get('email') ||
    (token ? localStorage.getItem('email') : '') ||
    '';

  const initialToken = searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [verificationToken, setVerificationToken] = useState(initialToken);
  const [infoMsg, setInfoMsg] = useState(
    location.state?.isJustRegistered
      ? 'Account created! A verification link has been sent to your email address.'
      : 'Please verify your email address to access student quizzes and dashboard.'
  );
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();

  useEffect(() => {
    if (meData?.email) {
      setEmail(meData.email);
    }
  }, [meData]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendSuccess('');
    setResendError('');
    setVerifySuccess('');
    setVerifyError('');

    if (!email.trim()) {
      setResendError('Please enter your email address to resend verification.');
      return;
    }

    try {
      const res = await resendVerification({ email: email.trim().toLowerCase() }).unwrap();
      setResendSuccess(
        res.message || 'If an unverified account exists for this email, a verification link has been sent.'
      );
    } catch (err) {
      setResendError(
        err?.data?.message || 'Unable to send verification email right now. Please try again later.'
      );
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setResendSuccess('');
    setResendError('');
    setVerifySuccess('');
    setVerifyError('');

    if (!email.trim() || !verificationToken.trim()) {
      setVerifyError('Please provide both your email and the verification token.');
      return;
    }

    try {
      const res = await verifyEmail({
        email: email.trim().toLowerCase(),
        token: verificationToken.trim(),
      }).unwrap();

      setVerifySuccess(res.message || 'Email verified successfully!');
      localStorage.setItem('status', 'VERIFIED');

      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1500);
    } catch (err) {
      setVerifyError(
        err?.data?.message || 'Invalid or expired verification token. Please request a new link.'
=======
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
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
      );
    }
  };

<<<<<<< HEAD
  const handleLogout = () => {
    clearAuthSession(dispatch);
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px 32px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          background: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            ✉️
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
            Verify Your Email
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
            {infoMsg}
          </p>
        </div>

        {email && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#334155',
            }}
          >
            Registered Email:{' '}
            <strong style={{ color: '#0f172a' }}>{email}</strong>
          </div>
        )}

        {resendSuccess && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {resendSuccess}
          </div>
        )}

        {resendError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {resendError}
          </div>
        )}

        {verifySuccess && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {verifySuccess} Redirecting...
          </div>
        )}

        {verifyError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {verifyError}
          </div>
        )}

        {/* Verification Token Form */}
        <form onSubmit={handleVerifyToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!email && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600',
                  color: '#334155',
                  fontSize: '13px',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#334155',
                fontSize: '13px',
              }}
            >
              Verification Token
            </label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              placeholder="Paste verification token"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || !verificationToken.trim()}
            style={{
              padding: '12px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isVerifying || !verificationToken.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              opacity: isVerifying || !verificationToken.trim() ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ margin: '20px 0', borderTop: '1px solid #e2e8f0' }} />

        {/* Resend Section */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '13px' }}>
            Didn't receive the email or token expired?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            style={{
              padding: '10px 18px',
              background: '#f1f5f9',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: isResending ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            Return to Sign In
          </button>
        </div>
      </div>
    </div>
=======
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
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
  );
}
