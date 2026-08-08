import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../authApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await login({ email, password }).unwrap();
      
      if (!response || !response.access_token) {
        setErrorMsg('Login succeeded but no token was returned. Please try again.');
        return;
      }

      localStorage.setItem('token', response.access_token);
      navigate('/');
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
        {/* Header*/}
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
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Please sign in to your account</p>
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
                transition: 'border-color 0.2s, box-shadow 0.2s',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                e.target.style.backgroundColor = '#fff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
                e.target.style.backgroundColor = '#f8fafc';
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
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backgroundColor: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8fafc';
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
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
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
              transition: 'transform 0.1s ease, background-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}