import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function GDPR() {
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
        <title>GDPR Compliance - VeriDiff</title>
        <meta name="description" content="VeriDiff GDPR Compliance - Your rights under the General Data Protection Regulation and how we protect your privacy." />
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
              GDPR Compliance
            </h1>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              1. Our Commitment to GDPR
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff is fully committed to compliance with the General Data Protection Regulation (GDPR). This page explains your rights and how we protect your personal data through our privacy-by-design architecture.
            </p>

            <div style={{
              background: '#eff6ff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #dbeafe',
              margin: '1rem 0'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1e40af'
              }}>
                🇪🇺 Built for European Privacy Standards
              </h3>
              <p style={{
                margin: '0',
                color: '#1e40af',
                lineHeight: '1.6'
              }}>
                As a London-based company, VeriDiff was designed from the ground up to meet the highest European data protection standards. Our local file processing approach ensures GDPR compliance by design.
              </p>
            </div>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              2. Your Rights Under GDPR
            </h2>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              2.1 Right of Access (Article 15)
            </h3>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You have the right to obtain confirmation that we are processing your personal data and access to that data, including information about purposes, categories, recipients, and retention periods.
            </p>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              2.2 Right to Rectification (Article 16)
            </h3>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You have the right to have inaccurate personal data corrected or completed if incomplete. This includes updating your account information and preferences.
            </p>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              2.3 Right to Erasure (Article 17) - "Right to be Forgotten"
            </h3>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You have the right to have your personal data deleted in certain circumstances:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Personal data is no longer necessary for the original purpose</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You withdraw consent and there's no other legal basis</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Personal data has been unlawfully processed</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              3. Exercising Your Rights
            </h2>
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              margin: '2rem 0',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                marginBottom: '1rem',
                color: '#1f2937',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                📧 Contact Our Data Protection Officer
              </h3>
              <p style={{
                marginBottom: '1rem',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#1f2937' }}>Email:</strong> dpo@veridiff.com
              </p>
              <p style={{
                marginBottom: '1rem',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#1f2937' }}>Response Time:</strong> Within 30 days
              </p>
            </div>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              4. Contact Information
            </h2>
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              margin: '1rem 0'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    Data Controller
                  </h3>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.875rem' }}>
                    Qubit HCM Ltd<br/>
                    London, United Kingdom
                  </p>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    Data Protection Officer
                  </h3>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.875rem' }}>
                    Email: sales@veridiff.com<br/>
                    GDPR Rights: Include "GDPR" in subject
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: '#dcfce7',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #bbf7d0',
              margin: '2rem 0'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#166534'
              }}>
                🔒 Remember: Your Files Stay Completely Private
              </h3>
              <p style={{
                margin: '0',
                color: '#047857',
                lineHeight: '1.6'
              }}>
                While we take your account privacy seriously under GDPR, <strong>your file contents and comparison results are never processed on our servers</strong>. VeriDiff's local processing architecture means your business data stays completely private, regardless of data protection regulations.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
