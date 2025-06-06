import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Terms() {
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
        <title>Terms of Service - VeriDiff</title>
        <meta name="description" content="VeriDiff Terms of Service - Terms and conditions for using our smart file comparison platform." />
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
              Terms of Service
            </h1>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              1. Service Description
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              VeriDiff provides a browser-based file comparison platform supporting Excel, CSV, PDF, JSON, XML, and TXT formats with intelligent field mapping and tolerance settings. All processing occurs locally in your browser for complete privacy.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              2. Acceptance of Terms
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              By accessing or using VeriDiff, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access the service.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              3. Service Tiers
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Free Tier:</strong> Excel-Excel comparisons unlimited for signed-in users with smart mapping, tolerance settings, and local processing.
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Premium Tier (£19/month):</strong> All Free features plus Excel-CSV, CSV-CSV, PDF, JSON, XML, TXT comparisons, advanced controls, and priority support.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              4. User Responsibilities
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              You agree to:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Use the service for legitimate business purposes only</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Not upload malicious, illegal, or copyrighted files without permission</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Respect file size limits and usage quotas for your tier</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Maintain the security of your account credentials</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Comply with all applicable laws and regulations</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Not attempt to reverse engineer or interfere with the service</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              5. Service Limitations
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Uptime Target:</strong> 99% availability (not guaranteed, best effort)
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>File Processing:</strong> Subject to browser memory limitations and device capabilities
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Usage Limits:</strong> As defined in your chosen pricing tier
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Feature Availability:</strong> Subject to browser compatibility and updates
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Local Processing:</strong> Requires JavaScript enabled and modern browser
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
              6. Payment Terms
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Free Tier:</strong> No payment required for Excel-Excel comparisons
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Premium Billing:</strong> £19/month charged monthly via Stripe
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Payment Processing:</strong> Secure processing via Stripe payment platform
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Refunds:</strong> 30-day money-back guarantee for Premium subscriptions
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Cancellation:</strong> Cancel anytime, access continues until end of billing period
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Price Changes:</strong> 30-day advance notice required for subscription changes
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
              7. Intellectual Property
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Your Files:</strong> You retain all rights to files you process through VeriDiff
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>VeriDiff Platform:</strong> We retain all rights to our software, algorithms, and technology
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Trademarks:</strong> VeriDiff and related marks are our property
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>License:</strong> We grant you a limited, non-transferable license to use the service
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
              8. Data and Privacy
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>All file processing occurs entirely in your browser using JavaScript</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We do not store, access, or transmit your file contents to our servers</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account and usage data is handled per our Privacy Policy</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You are responsible for backing up and securing your own data</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>GDPR compliant by design with privacy-first architecture</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              9. Limitation of Liability
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>VeriDiff is provided "AS IS" without warranties of any kind</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We are not liable for data loss, business interruption, or comparison accuracy</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Total liability is limited to fees paid in the last 12 months</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We are not responsible for file comparison accuracy or business decisions based on results</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Browser compatibility and performance may vary by device and configuration</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              10. Termination
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              Either party may terminate this agreement:
            </p>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You may cancel your account at any time through account settings</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We may suspend accounts for Terms violations with notice when possible</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Paid subscriptions continue until the end of the current billing period</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account data may be deleted 90 days after termination</li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Free tier access may continue after account deletion with reduced functionality</li>
            </ul>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              11. Dispute Resolution
            </h2>
            <ul style={{
              margin: '1rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>First Contact:</strong> Email support@veridiff.com for resolution
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Mediation:</strong> Good faith mediation before legal action
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Governing Law:</strong> Laws of England and Wales
              </li>
              <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
                <strong style={{ color: '#1f2937' }}>Jurisdiction:</strong> Courts of England and Wales have exclusive jurisdiction
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
              12. Changes to Terms
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              We may modify these terms with 30 days advance notice. Material changes will be communicated via email to registered users. Continued use constitutes acceptance of new terms.
            </p>

            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '2rem 0 1rem 0',
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              13. Contact Information
            </h2>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Legal:</strong> legal@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>Support:</strong> support@veridiff.com
            </p>
            <p style={{
              marginBottom: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#1f2937' }}>General:</strong> hello@veridiff.com
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
                  <span style={{ 
                    color: '#60a5fa', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Terms of Service
                  </span>
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
