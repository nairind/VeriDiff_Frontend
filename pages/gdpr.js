import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function GDPR() {
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
              2. Lawful Basis for Processing
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              Under GDPR Article 6, we process personal data based on these lawful bases:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Legitimate Interest (6.1.f):</strong> File comparison service delivery and security
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Contract (6.1.b):</strong> Account management and Premium subscription billing
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Consent (6.1.a):</strong> Optional marketing communications and analytics
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Legal Obligation (6.1.c):</strong> Tax records, financial reporting, and compliance
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
              3. Your Rights Under GDPR
            </h2>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              3.1 Right of Access (Article 15)
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
              3.2 Right to Rectification (Article 16)
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
              3.3 Right to Erasure (Article 17) - "Right to be Forgotten"
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
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Deletion is required for compliance with legal obligations</li>
            </ul>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              3.4 Right to Data Portability (Article 20)
            </h3>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You have the right to receive your personal data in a structured, commonly used, machine-readable format and to transmit that data to another controller.
            </p>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '1.5rem 0 0.5rem 0',
              color: '#1f2937'
            }}>
              3.5 Right to Object (Article 21)
            </h3>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You have the right to object to processing based on legitimate interests or for direct marketing purposes. We will stop processing unless we can demonstrate compelling legitimate grounds.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              4. Data Retention Periods
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We retain personal data only as long as necessary for the purposes collected:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>File data:</strong> Never stored (processed client-side only)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Account data:</strong> Retained until account deletion (or 2 years after last login)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Payment records:</strong> 7 years (UK tax and legal requirements)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Support communications:</strong> 3 years for service improvement
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Usage analytics:</strong> 24 months for performance optimization
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Marketing data:</strong> Until consent withdrawal or account deletion
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
              5. Privacy by Design Principles
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff implements all seven Privacy by Design principles:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Proactive not Reactive:</strong> Privacy protection built into the architecture
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Privacy as the Default:</strong> Maximum privacy protection without requiring action
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Privacy Embedded into Design:</strong> Local processing eliminates server-side data exposure
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Full Functionality:</strong> Privacy without compromising service quality
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>End-to-End Security:</strong> HTTPS encryption and secure payment processing
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Visibility and Transparency:</strong> Clear policies and data handling practices
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Respect for User Privacy:</strong> User-centric approach to data protection
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
              6. Exercising Your Rights
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                    <strong style={{ color: '#1f2937' }}>Email:</strong> dpo@veridiff.com
                  </p>
                  <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                    <strong style={{ color: '#1f2937' }}>Subject Line:</strong> GDPR Rights Request
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                    <strong style={{ color: '#1f2937' }}>Response Time:</strong> Within 30 days
                  </p>
                  <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                    <strong style={{ color: '#1f2937' }}>Extensions:</strong> Up to 60 days for complex requests
                  </p>
                </div>
              </div>
              <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Required Information:</strong>
              </p>
              <ul style={{
                margin: '0.5rem 0',
                paddingLeft: '2rem'
              }}>
                <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Your full name and email address</li>
                <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Specific right you wish to exercise</li>
                <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Account information (if applicable)</li>
                <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Proof of identity for verification</li>
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
              7. Data Transfers and International Processing
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff's unique architecture minimizes international data transfers:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>No File Transfers:</strong> All file processing happens locally in your browser
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>EU/UK Hosting:</strong> Core services hosted within EU/UK jurisdiction
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Stripe Processing:</strong> Payment processing with adequate safeguards
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Standard Contractual Clauses:</strong> Used for any third-country transfers
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
              8. Complaints and Supervisory Authority
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              If you believe we have not complied with GDPR, you have the right to lodge a complaint:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              margin: '1rem 0'
            }}>
              <div style={{
                background: '#eff6ff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #dbeafe'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#1e40af'
                }}>
                  🇬🇧 United Kingdom
                </h3>
                <p style={{ marginBottom: '0.5rem', color: '#1e40af', fontSize: '0.875rem' }}>
                  <strong>Information Commissioner's Office (ICO)</strong>
                </p>
                <p style={{ margin: '0', color: '#1e40af', fontSize: '0.875rem' }}>
                  Website: ico.org.uk<br/>
                  Phone: 0303 123 1113
                </p>
              </div>
              <div style={{
                background: '#ecfdf5',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1fae5'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#065f46'
                }}>
                  🇪🇺 European Union
                </h3>
                <p style={{ marginBottom: '0.5rem', color: '#065f46', fontSize: '0.875rem' }}>
                  <strong>Your Local Data Protection Authority</strong>
                </p>
                <p style={{ margin: '0', color: '#065f46', fontSize: '0.875rem' }}>
                  Contact your country's DPA<br/>
                  Find at: edpb.europa.eu
                </p>
              </div>
            </div>
            <p style={{
              marginTop: '1rem',
              color: '#4b5563',
              lineHeight: '1.6',
              fontStyle: 'italic'
            }}>
              <strong style={{ color: '#1f2937' }}>Recommendation:</strong> We encourage contacting us directly first at dpo@veridiff.com to resolve any concerns quickly and amicably.
            </p>

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
                    VeriDiff Ltd<br/>
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
                    Email: dpo@veridiff.com<br/>
                    GDPR Rights: Include "GDPR" in subject
                  </p>
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    General Contact
                  </h3>
                  <p style={{ margin: '0', color: '#4b5563', fontSize: '0.875rem' }}>
                    Privacy: privacy@veridiff.com<br/>
                    Legal: legal@veridiff.com
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
                  <a href="/privacy" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Privacy Policy
                  </a>
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
                  <span style={{ 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    GDPR Rights
                  </span>
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
