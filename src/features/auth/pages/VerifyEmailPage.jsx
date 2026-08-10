import { useState } from 'react';
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
  );
}
