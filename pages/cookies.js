import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Cookies() {
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
        <title>Cookie Policy - VeriDiff</title>
        <meta name="description" content="VeriDiff Cookie Policy - How we use cookies and tracking technologies while respecting your privacy." />
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
              Cookie Policy
            </h1>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              1. What Are Cookies
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, maintain your session, and improve your browsing experience. VeriDiff uses minimal cookies to ensure the service works properly while respecting your privacy.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              2. Types of Cookies We Use
            </h2>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '1rem 0',
              background: 'white',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr>
                  <th style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: '#f8fafc',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>Cookie Type</th>
                  <th style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: '#f8fafc',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>Purpose</th>
                  <th style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: '#f8fafc',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Essential</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Authentication, security, preferences</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#059669',
                    fontWeight: '500'
                  }}>Yes</td>
                </tr>
                <tr>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Analytics</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Usage tracking (Google Analytics)</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>No</td>
                </tr>
                <tr>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Marketing</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Conversion tracking (Google Ads)</td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>No</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              3. Essential Cookies
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              These cookies are necessary for VeriDiff to function properly:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Authentication:</strong> Keep you logged in to your account
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Security:</strong> Prevent cross-site request forgery attacks
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Preferences:</strong> Remember your settings and tier status
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Stripe:</strong> Secure payment processing for Premium subscriptions
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
              4. Managing Your Cookie Preferences
            </h2>
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              margin: '1rem 0'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Your Cookie Control Options
              </h3>
              <ul style={{
                margin: '0',
                paddingLeft: '2rem'
              }}>
                <li style={{ marginBottom: '0.75rem', color: '#4b5563' }}>
                  <strong style={{ color: '#1f2937' }}>Cookie Consent Banner:</strong> Manage preferences when you first visit VeriDiff
                </li>
                <li style={{ marginBottom: '0.75rem', color: '#4b5563' }}>
                  <strong style={{ color: '#1f2937' }}>Browser Settings:</strong> Disable all or specific types of cookies
                </li>
                <li style={{ marginBottom: '0.75rem', color: '#4b5563' }}>
                  <strong style={{ color: '#1f2937' }}>Contact Us:</strong> Email privacy@veridiff.com for assistance
                </li>
              </ul>
            </div>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              5. Data Privacy & File Processing
            </h2>
            <div style={{
              background: '#dcfce7',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #bbf7d0',
              margin: '1rem 0'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#166534'
              }}>
                🔒 Important: Your Files Stay Private
              </h3>
              <p style={{
                margin: '0',
                color: '#047857',
                lineHeight: '1.6'
              }}>
                While we use cookies for website functionality, <strong>we never use cookies to track your file contents or comparison results</strong>. All file processing happens locally in your browser, and your sensitive business data never touches our servers or any cookies.
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
              6. Contact Information
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              For questions about our cookie usage or to manage your preferences:
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Privacy Email:</strong> sales@veridiff.com
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
