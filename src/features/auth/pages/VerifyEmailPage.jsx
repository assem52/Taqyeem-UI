import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
  useGetMeQuery,
} from '../authApi';
import { clearAuthSession } from '../../../shared/utils/authSession';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';
import { CheckCircle2, AlertCircle, Loader2 } from '../../../shared/components/Icons';

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
  const [infoMsg] = useState(
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

  const [prevMeEmail, setPrevMeEmail] = useState(meData?.email);
  if (meData?.email && meData.email !== prevMeEmail) {
    setPrevMeEmail(meData.email);
    setEmail(meData.email);
  }

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
      );
    }
  };

  const handleLogout = () => {
    clearAuthSession(dispatch);
    navigate('/login', { replace: true });
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={infoMsg}
      footer={
        <button
          type="button"
          onClick={handleLogout}
          className="text-primary font-semibold hover:underline"
        >
          Return to Sign In
        </button>
      }
    >
      {email ? (
        <div className="border-border bg-background text-heading mb-5 rounded-button border px-3.5 py-2.5 text-center text-sm font-medium">
          Registered Email: <span className="font-bold text-heading">{email}</span>
        </div>
      ) : null}

      {resendSuccess ? (
        <div
          role="status"
          className="border-success/20 bg-success/10 text-success mb-5 flex items-start gap-2 rounded-button border px-3.5 py-2.5 text-sm"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{resendSuccess}</span>
        </div>
      ) : null}

      {resendError ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-5 flex items-start gap-2 rounded-button border px-3.5 py-2.5 text-sm"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{resendError}</span>
        </div>
      ) : null}

      {verifySuccess ? (
        <div
          role="status"
          className="border-success/20 bg-success/10 text-success mb-5 flex items-start gap-2 rounded-button border px-3.5 py-2.5 text-sm font-semibold"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{verifySuccess} Redirecting…</span>
        </div>
      ) : null}

      {verifyError ? (
        <div
          role="alert"
          className="border-danger/20 bg-danger/5 text-danger mb-5 flex items-start gap-2 rounded-button border px-3.5 py-2.5 text-sm"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{verifyError}</span>
        </div>
      ) : null}

      {/* Verification Token Form */}
      <form onSubmit={handleVerifyToken} className="space-y-4">
        {!email && (
          <div>
            <label htmlFor="verify-email-input" className={authLabelClass}>
              Email Address
            </label>
            <input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className={authFieldClass}
              autoComplete="email"
            />
          </div>
        )}

        <div>
          <label htmlFor="verify-token-input" className={authLabelClass}>
            Verification Token
          </label>
          <input
            id="verify-token-input"
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            placeholder="Paste verification token"
            className={authFieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying || !verificationToken.trim()}
          className={`${authPrimaryBtnClass} flex items-center justify-center gap-2`}
        >
          {isVerifying ? (
            <>
              <Loader2 size={16} />
              <span>Verifying…</span>
            </>
          ) : (
            'Verify Email'
          )}
        </button>
      </form>

      <div className="border-border my-6 border-t pt-6 text-center">
        <p className="text-muted mb-3 text-xs">Didn&apos;t receive the email or token expired?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="border-border bg-surface text-heading hover:bg-background w-full rounded-button border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? 'Sending…' : 'Resend Verification Email'}
        </button>
      </div>
    </AuthShell>
  );
}
