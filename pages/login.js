import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendMagicLink = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          returnUrl: '/compare'
        })
      });

      if (response.ok) {
        setMessage('Magic link sent! Check your email and click the link to sign in.');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to send magic link');
      }
    } catch (error) {
      setMessage('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}>
                  VeriDiff
                </h1>
              </a>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                Sign in with a magic link
              </p>
            </div>

            <div style={{
              background: '#dcfce7',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '0.875rem', 
                color: '#166534',
                fontWeight: '500'
              }}>
                🔒 No passwords needed. We'll send you a secure link to sign in.
              </p>
            </div>

            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMagicLink();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <button
                onClick={handleSendMagicLink}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.background = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.background = '#2563eb';
                }}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>

            {message && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: message.includes('sent') ? '#dcfce7' : '#fef2f2',
                color: message.includes('sent') ? '#166534' : '#dc2626',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <div style={{
              marginTop: '2rem',
              textAlign: 'center',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                New to VeriDiff?
              </p>
              <a
                href="/compare"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}
              >
                Try the demo first - no registration required →
              </a>
            </div>

            <div style={{
              marginTop: '1.5rem',
              background: '#f0fdf4',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#166534'
              }}>
                🔒 <strong>Privacy First:</strong> Your files are processed locally in your browser - we never see your data.
              </p>
            </div>
          </div>
        </div>
      </>
    );
}
