import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      backgroundColor: '#fdfbf7',
      fontFamily: "'Inter Tight', sans-serif"
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, #1b3a2f 0%, #244c3c 60%, #386058 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }} className="hidden lg:flex">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          border: '1px solid rgba(220,158,74,0.2)'
        }} />
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          border: '1px solid rgba(220,158,74,0.15)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            marginBottom: '3rem'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc9e4a, #7D5115)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '24px', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>T</span>
            </div>
            <span style={{ color: 'white', fontSize: '22px', fontFamily: "'Playfair Display', serif", fontWeight: '600' }}>The Date Crew</span>
          </div>

          <h1 style={{
            color: 'white', fontSize: '42px', fontFamily: "'Playfair Display', serif",
            fontWeight: '600', lineHeight: '1.2', marginBottom: '1.5rem'
          }}>
            India's #1<br /><em style={{ color: '#dc9e4a', fontStyle: 'italic' }}>Matchmakers</em><br />for Professionals
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', lineHeight: '1.6', maxWidth: '380px' }}>
            An internal portal helping TDC matchmakers manage clients, find curated matches, and record insights.
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '2.5rem' }}>
            {[['1000+', 'Successful Matches'], ['18+', 'Countries'], ['98%', 'Satisfaction']].map(([num, label]) => (
              <div key={label}>
                <div style={{ color: '#dc9e4a', fontSize: '28px', fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>{num}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '28px', fontFamily: "'Playfair Display', serif",
            fontWeight: '600', color: '#1b3a2f', margin: '0 0 8px'
          }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Sign in to your matchmaker account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#991b1b', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="matchmaker1"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
                fontFamily: "'Inter Tight', sans-serif", backgroundColor: '#fdfbf7'
              }}
              onFocus={(e) => e.target.style.borderColor = '#244c3c'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
                fontFamily: "'Inter Tight', sans-serif", backgroundColor: '#fdfbf7'
              }}
              onFocus={(e) => e.target.style.borderColor = '#244c3c'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px 24px', borderRadius: '999px', border: 'none',
              background: 'linear-gradient(145deg, #244c3c, #1b3a2f)',
              boxShadow: '0px 1px 1px 0px rgba(37,37,39,0.15), inset 0px 1px 2px 2px #386058',
              color: 'white', fontSize: '15px', fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1,
              fontFamily: "'Inter Tight', sans-serif"
            }}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem', padding: '16px', borderRadius: '12px',
          backgroundColor: '#fdfbf7', border: '1px solid #e2e8f0'
        }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px', fontWeight: '600' }}>SAMPLE CREDENTIALS</p>
          <p style={{ fontSize: '13px', color: '#374151', margin: '0' }}>
            Username: <strong>matchmaker1</strong> &nbsp;|&nbsp; Password: <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
