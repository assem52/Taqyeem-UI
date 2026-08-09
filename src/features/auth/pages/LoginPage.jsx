import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation } from '../authApi';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';

function homeForRole(role) {
  return role === 'ADMIN' ? '/admin/quizzes' : '/';
}

function destinationForLogin(role, next) {
  if (next?.startsWith('/admin')) {
    return role === 'ADMIN' ? next : homeForRole(role);
  }
  if (next?.startsWith('/invite') || next?.startsWith('/quizzes')) {
    return role === 'STUDENT' ? next : homeForRole(role);
  }
  if (next) return next;
  return homeForRole(role);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      navigate(homeForRole(role), { replace: true });
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

      if (!response?.access_token) {
        setErrorMsg('Login succeeded but no token was returned. Please try again.');
        return;
      }

      const role = response.role ?? response.user?.role ?? 'STUDENT';
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('role', role);
      navigate(destinationForLogin(role, next), { replace: true });
    } catch (err) {
      setErrorMsg(
        err?.data?.message || 'Invalid email or password. Please try again.',
      );
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your learner or instructor account."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
          {' · '}
          <Link to="/forgot-password" className="text-primary font-semibold hover:underline">
            Forgot password
          </Link>
        </>
      }
    >
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
          <label htmlFor="login-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className={authFieldClass}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              className={`${authFieldClass} pr-16`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted hover:text-heading absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={`${authPrimaryBtnClass} mt-2`}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-muted mt-6 border-border border-t pt-5 text-xs leading-relaxed">
        Demo · learner{' '}
        <span className="text-heading font-medium">assem.test@example.com</span> / Student123!
        · instructor{' '}
        <span className="text-heading font-medium">admin@example.com</span> / Admin123!
      </p>
    </AuthShell>
  );
}
