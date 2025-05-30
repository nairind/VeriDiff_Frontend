import React, { useState, useEffect } from 'react';

export default function MagicLinkVerify() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyMagicLink = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const returnUrl = urlParams.get('returnUrl') || '/compare';

      if (!token) {
        setStatus('error');
        setMessage('Invalid magic link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('veridiff_token', data.token);
          setStatus('success');
          setMessage('Successfully signed in! Redirecting...');
          
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 2000);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.error || 'Failed to verify magic link');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify magic link');
      }
    };

    verifyMagicLink();
  }, []);

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
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '2rem' }}>
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
          </div>

          {status === 'verifying' && (
            <>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }} />
              <h2 style={{ 
                color: '#1f2937', 
                marginBottom: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Verifying your magic link...
              </h2>
              <p style={{ color: '#6b7280' }}>
                Please wait while we sign you in.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{
                fontSize: '3rem',
                color: '#10b981',
                marginBottom: '1rem'
              }}>
                ✅
              </div>
              <h2 style={{ 
                color: '#059669', 
                marginBottom: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Welcome to VeriDiff!
              </h2>
              <p style={{ color: '#6b7280' }}>
                {message}
              </p>
              <div style={{
                marginTop: '1.5rem',
                background: '#dcfce7',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#166534',
                  fontWeight: '500'
                }}>
                  🎉 You now have access to 5 free comparisons per month!
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{
                fontSize: '3rem',
                color: '#ef4444',
                marginBottom: '1rem'
              }}>
                ❌
              </div>
              <h2 style={{ 
                color: '#dc2626', 
                marginBottom: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Verification Failed
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {message}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href="/login"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: '#2563eb',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    transition: 'background 0.2s'
                  }}
                >
                  Try Again
                </a>
                <a
                  href="/compare"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    transition: 'background 0.2s'
                  }}
                >
                  Continue as Guest
                </a>
              </div>
            </>
          )}

          <div style={{
            marginTop: '2rem',
            background: '#f0fdf4',
            padding: '1rem',
            borderRadius: '0.5rem'
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

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
