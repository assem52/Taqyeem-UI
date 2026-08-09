import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../authApi';
import AuthShell, {
  authFieldClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../components/AuthShell';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await register({ name, email, password }).unwrap();
      setSuccessMsg(
        result.message ||
          'Registered. Verify your email next — use the token from your inbox or the API log in development.',
      );
      setTimeout(
        () => navigate(`/verify?email=${encodeURIComponent(email.trim())}`),
        1200,
      );
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Registration failed.');
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register as a learner to accept invites and take quizzes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
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
      {successMsg ? (
        <div
          role="status"
          className="border-success/20 bg-success/10 text-success mb-5 rounded-button border px-3.5 py-2.5 text-sm"
        >
          {successMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className={authLabelClass}>
            Full name
          </label>
          <input
            id="reg-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authFieldClass}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authFieldClass}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className={authLabelClass}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authFieldClass}
            autoComplete="new-password"
          />
          <p className="text-muted mt-1.5 text-xs">At least 6 characters.</p>
        </div>
        <button type="submit" disabled={isLoading} className={`${authPrimaryBtnClass} mt-2`}>
          {isLoading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
