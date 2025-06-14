import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Privacy() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Check for logged in user on component mount
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

  const handleHome = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    localStorage.removeItem('veridiff_token');
    setUser(null);
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleAccountSettings = () => {
    window.location.href = '/account';
  };

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const scrollToSection = (sectionId) => {
    router.push(`/#${sectionId}`);
    setMobileMenuOpen(false);
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
        {/* Header - Updated to match index.js */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '64px'
            }}>
              <div 
                onClick={handleHome}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  cursor: 'pointer'
                }}
              >
                VeriDiff
              </div>
              
              <nav style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center'
              }} className="desktop-nav">
                <button onClick={() => scrollToSection('features')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  Pricing
                </button>
                <a href="/faq" style={{
                  textDecoration: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  FAQ
                </a>
                
                {user ? (
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '0.25rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {userMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        minWidth: '200px',
                        marginTop: '0.5rem',
                        zIndex: 1000
                      }}>
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{user.full_name}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{user.email}</div>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                          <button onClick={handleDashboard} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Dashboard
                          </button>
                          <button onClick={handleAccountSettings} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Account Settings
                          </button>
                          <button onClick={handleSignOut} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={handleSignIn} style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      transition: 'color 0.2s'
                    }}>
                      Sign In
                    </button>
                    <button onClick={handleTryDemo} style={{ 
                      padding: '0.5rem 1rem', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      background: '#2563eb', 
                      color: 'white',
                      transition: 'all 0.2s'
                    }}>
                      Try Free Demo
                    </button>
                  </>
                )}
              </nav>

              <button 
                style={{
                  display: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#374151'
                }}
                className="mobile-nav-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div style={{
                borderTop: '1px solid #e5e7eb',
                padding: '1rem 0',
                background: 'white'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={() => scrollToSection('features')} style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.5rem',
                    textAlign: 'left'
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.5rem',
                    textAlign: 'left'
                  }}>
                    Pricing
                  </button>
                  <a href="/faq" style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    padding: '0.5rem'
                  }}>
                    FAQ
                  </a>
                  {user ? (
                    <>
                      <button onClick={handleDashboard} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#374151',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Dashboard
                      </button>
                      <button onClick={handleSignOut} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSignIn} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#374151',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Sign In
                      </button>
                      <button onClick={handleTryDemo} style={{ 
                        padding: '0.75rem 1rem', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: '500', 
                        cursor: 'pointer', 
                        background: '#2563eb', 
                        color: 'white',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        Try Free Demo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

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
              7. Data Retention
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>File data:</strong> Never stored (processed client-side only)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Account data:</strong> Retained until account deletion
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Payment records:</strong> Retained for 7 years (legal requirement)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Usage analytics:</strong> Retained for 24 months
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
              8. Security
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We implement appropriate security measures including:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>HTTPS encryption for all communications</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Secure payment processing through Stripe</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Client-side processing to minimize data exposure</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Regular security audits and updates</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              9. Contact Information
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
              <strong style={{ color: '#1f2937' }}>Email:</strong> privacy@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Data Protection Officer:</strong> dpo@veridiff.com
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              10. Changes to This Policy
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We may update this Privacy Policy occasionally. We will notify users of significant changes via email or through our service.
            </p>
          </div>
        </div>

        {/* Footer - Updated to match index.js */}
        <footer style={{ 
          background: '#111827', 
          color: 'white', 
          padding: '3rem 0' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem', 
              marginBottom: '2rem' 
            }}>
              <div>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundClip: 'text', 
                  marginBottom: '1rem', 
                  display: 'block' 
                }}>
                  VeriDiff
                </span>
                <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                  Precision-engineered in London for global business professionals. Your data never leaves your browser.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Product</h4>
                <div>
                  <button onClick={() => scrollToSection('features')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Pricing
                  </button>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Support</h4>
                <div>
                  <a href="mailto:sales@veridiff.com" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Contact Us
                  </a>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Legal</h4>
                <div>
                  <span style={{ 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Privacy Policy
                  </span>
                  <a href="/terms" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Terms of Service
                  </a>
                  <a href="/cookies" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Cookie Policy
                  </a>
                  <a href="/gdpr" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    GDPR Rights
                  </a>
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid #374151', 
              paddingTop: '2rem', 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: '0.875rem' 
            }}>
              <p>&copy; 2025 VeriDiff. All rights reserved. Precision-engineered in London for global professionals.</p>
            </div>
          </div>
        </footer>

        {/* CSS for responsive design */}
        <style jsx>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-nav-button { display: block !important; }
          }
        `}</style>
      </div>
    </>
  );
}
