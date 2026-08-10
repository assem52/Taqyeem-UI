import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../authApi';
import { setAuthSession } from '../../../shared/utils/authSession';

function homeForRole(role) {
  return role === 'ADMIN' ? '/admin/quizzes' : '/';
}

function destinationForLogin(role, next) {
  // Don't send admins into student-only deep links (and vice versa).
  if (next?.startsWith('/admin')) {
    return role === 'ADMIN' ? next : homeForRole(role);
  }
  if (next?.startsWith('/invite') || next?.startsWith('/quizzes')) {
    return role === 'STUDENT' ? next : homeForRole(role);
  }
  if (next) {
    return next;
  }
  return homeForRole(role);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const status = localStorage.getItem('status');
    if (token && role) {
      if (role === 'STUDENT' && status === 'UNVERIFIED') {
        navigate('/verify-email', { replace: true });
      } else {
        navigate(homeForRole(role), { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      if (!response || !response.access_token) {
        setErrorMsg('Login succeeded but no token was returned. Please try again.');
        return;
      }

      const role = response.role ?? response.user?.role ?? 'STUDENT';
      const status = response.status ?? response.user?.status ?? 'UNVERIFIED';
      const userEmail = response.user?.email ?? response.email ?? email.trim().toLowerCase();
      const userName = response.user?.name ?? response.name ?? '';

      // Cleanly replace auth session and reset RTK query cache for new user
      setAuthSession(
        {
          token: response.access_token,
          role,
          status,
          email: userEmail,
          name: userName,
        },
        dispatch
      );

      if (role === 'STUDENT' && status === 'UNVERIFIED') {
        navigate('/verify-email', { replace: true });
        return;
      }

      navigate(destinationForLogin(role, next), { replace: true });
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 35px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        background: '#ffffff',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#fff',
            fontSize: '22px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            QP
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>Welcome</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Sign in — students and admins use the same login
          </p>
          {import.meta.env.DEV && (
            <p style={{ margin: '10px 0 0', color: '#94a3b8', fontSize: '12px' }}>
              Demo: assem.test@example.com / Student123! · admin@example.com / Admin123!
            </p>
          )}
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 45px 12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f8fafc'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#64748b'
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
