import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const { token, returnUrl } = router.query;
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Store auth token
          localStorage.setItem('veridiff_token', data.authToken);
          
          setStatus('success');
          setMessage(`Welcome ${data.user.full_name}! Redirecting...`);
          
          // Redirect after success
          setTimeout(() => {
            router.push(returnUrl || '/compare');
          }, 2000);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    if (router.isReady) {
      verifyToken();
    }
  }, [router.isReady, router.query]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1.5rem'
        }}>
          {status === 'verifying' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          {status === 'verifying' && 'Verifying your magic link...'}
          {status === 'success' && 'Sign in successful!'}
          {status === 'error' && 'Verification failed'}
        </h1>

        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {status === 'verifying' && 'Please wait while we verify your magic link.'}
          {status === 'success' && message}
          {status === 'error' && message}
        </p>

        {status === 'error' && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
