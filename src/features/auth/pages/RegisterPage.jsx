import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../authApi';

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
        `${result.message || 'Registered.'} Check the backend console for the DEV verification token, then verify before logging in.`,
      );
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: 20,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0, color: '#1e293b' }}>Create student account</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          This creates a User + linked Student so you can take quizzes after verify + login.
        </p>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: 10, borderRadius: 8, fontSize: 13 }}>
            {successMsg}
          </div>
        )}

        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Password (min 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Creating…' : 'Register'}
        </button>

        <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
