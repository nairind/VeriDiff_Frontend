import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Privacy() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('veridiff_token');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('veridiff_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignUp = () => {
    window.location.href = '/api/auth/signup';
  };

  return (
    <>
      <Head>
        <title>Privacy Policy - VeriDiff</title>
        <meta name="description" content="VeriDiff Privacy Policy - How we protect your data and ensure complete privacy with local processing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937'
      }}>
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Security Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🔒 Enterprise-Grade Privacy: All file processing happens in your browser. We never see, store, or access your data.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: '#f9fafb',
          padding: '3rem 0'
        }}>
          <div style={{
            background: 'white',
            margin: '0 auto',
            padding: '3rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            maxWidth: '800px'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <strong>Last updated:</strong> January 2025
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Privacy Policy
            </h1>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              1. Introduction
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our file comparison service.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              2. Data Processing Philosophy
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff is designed with privacy-by-design principles:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Client-side processing:</strong> All file comparisons happen in your browser
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>No server uploads:</strong> Your files never leave your device
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>No data storage:</strong> We don't store your files or comparison results
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Session-only:</strong> Data is cleared when you close your browser
              </li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              3. Information We Collect
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Personal Information:</strong>
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Email address (for account creation and communication)</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Payment information (processed securely through Stripe)</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Usage analytics (file comparison counts, feature usage)</li>
            </ul>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>File Data:</strong>
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We do NOT collect, store, or access your file contents</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>File processing occurs entirely within your browser</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>No file data is transmitted to our servers</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              4. How We Use Your Information
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account management and authentication</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Payment processing and billing</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Service improvement and analytics</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Customer support and communication</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Legal compliance and fraud prevention</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              5. Data Sharing
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We do not sell, trade, or rent your personal information. We may share data only with:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Stripe:</strong> For payment processing
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Google Analytics:</strong> For usage analytics (optional)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Legal authorities:</strong> When required by law
              </li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              6. Your Rights (GDPR Compliance)
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              Under GDPR, you have the right to:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Access:</strong> Request copies of your personal data
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Rectification:</strong> Correct inaccurate personal data
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Erasure:</strong> Request deletion of your personal data
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Portability:</strong> Transfer your data to another service
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Objection:</strong> Object to processing of your personal data
              </li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              7. Contact Information
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Email:</strong> sales@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Data Protection Officer:</strong> sales@veridiff.com
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
