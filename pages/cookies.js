import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Cookies() {
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
              2. How We Use Cookies
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff uses cookies for essential functionality and optional analytics. We respect your privacy and provide opt-out options for non-essential cookies. Since all file processing happens locally in your browser, we don't use cookies to track your file contents or comparison results.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              3. Types of Cookies We Use
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
                  <th style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    textAlign: 'left',
                    background: '#f8fafc',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>Duration</th>
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
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>Session/1 year</td>
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
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>2 years</td>
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
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    color: '#4b5563'
                  }}>90 days</td>
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
              4. Essential Cookies
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
                <strong style={{ color: '#1f2937' }}>Session:</strong> Maintain your session state while using VeriDiff
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
              5. Analytics Cookies (Optional)
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We use Google Analytics to understand how users interact with VeriDiff (with your consent):
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Page views and user journeys through the application</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Feature usage and performance metrics</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Error tracking and debugging information</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Demographic insights (anonymized and aggregated)</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Browser and device compatibility data</li>
            </ul>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Important:</strong> Analytics cookies never track your file contents or comparison results - only your interaction with the VeriDiff interface.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              6. Marketing Cookies (Optional)
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              If you arrived via Google Ads, we may use conversion tracking cookies to:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Measure advertising campaign effectiveness</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Optimize marketing spend and targeting</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Provide more relevant advertisements</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Track Premium subscription conversions</li>
            </ul>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Opt-out:</strong> You can disable marketing cookies through our consent banner or browser settings at any time.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              7. Managing Your Cookie Preferences
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
                  <strong style={{ color: '#1f2937' }}>Google Analytics Opt-out:</strong> Use Google's opt-out browser add-on
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
              8. Third-Party Services
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff integrates with trusted third-party services that may set their own cookies:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Stripe:</strong> Secure payment processing (Essential cookies only)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Google Analytics:</strong> Website analytics (Optional, with consent)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Google Ads:</strong> Conversion tracking (Optional, with consent)
              </li>
            </ul>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              These services have their own privacy policies and cookie practices. We recommend reviewing their policies for complete information.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              9. Data Privacy & File Processing
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
              10. Contact Information
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
              <strong style={{ color: '#1f2937' }}>Privacy Email:</strong> privacy@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Data Protection Officer:</strong> dpo@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>General Support:</strong> support@veridiff.com
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
                  <span style={{ 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Cookie Policy
                  </span>
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
