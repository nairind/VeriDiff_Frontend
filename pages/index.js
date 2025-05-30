import React, { useState, useEffect } from 'react';

export default function Home() {
  const [selectedDemo, setSelectedDemo] = useState('excel-csv');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  const handleTryDemo = () => {
    // In a real Next.js app, this would be: router.push('/compare');
    alert('This would redirect to the comparison tool. Demo functionality preserved!');
  };

  const handleSignIn = () => {
    // In a real Next.js app, this would be: router.push('/login');
    alert('This would redirect to the login page. Magic link authentication coming soon!');
  };

  const handleSignOut = () => {
    localStorage.removeItem('veridiff_token');
    setUser(null);
    setUserMenuOpen(false);
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click Try Live Demo above to test VeriDiff now.');
  };

  const handleProTrial = () => {
    alert('Pro trial signup coming soon! Click Try Free Demo to test VeriDiff now.');
  };

  const handleContactSales = () => {
    alert('Enterprise contact form coming soon! Email us at hello@veridiff.com');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Responsive styles (same as before)
  const containerStyle = {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: 0,
    color: '#1f2937'
  };

  const headerStyle = {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const headerContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const headerContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'pointer'
  };

  const desktopNavStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#374151',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'color 0.2s'
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '500',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'color 0.2s',
    display: 'block'
  };

  const mobileNavButtonStyle = {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#374151'
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
    padding: '5rem 0',
    textAlign: 'center'
  };

  const heroContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const sectionStyle = {
    padding: '5rem 0'
  };

  const sectionContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  // Media queries (same as before)
  const mediaQueries = `
    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
      .mobile-nav-button { display: block !important; }
      .hero-title { font-size: 2.5rem !important; }
      .hero-subtitle { font-size: 1.1rem !important; }
      .section-title { font-size: 1.8rem !important; }
      .section-padding { padding: 3rem 0 !important; }
      .demo-grid { grid-template-columns: 1fr !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
      .feature-grid { grid-template-columns: 1fr !important; }
      .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .button-group { flex-direction: column !important; align-items: center !important; }
      .demo-buttons { flex-direction: column !important; gap: 0.5rem !important; }
      .tolerance-grid { grid-template-columns: 1fr !important; }
      .security-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (max-width: 480px) {
      .hero-section { padding: 3rem 0 !important; }
      .hero-title { font-size: 2rem !important; }
      .section-container { padding: 0 15px !important; }
      .pricing-card { margin-bottom: 1rem !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .demo-grid { grid-template-columns: 1fr !important; }
    }
  `;

  return (
    <>
      <style>{mediaQueries}</style>
      <div style={containerStyle}>
        
        {/* Header */}
        <header style={headerStyle}>
          <div style={headerContainerStyle}>
            <div style={headerContentStyle}>
              <div style={logoStyle}>
                VeriDiff
              </div>
              
              <nav style={desktopNavStyle} className="desktop-nav">
                <button onClick={() => scrollToSection('features')} style={navButtonStyle}>
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} style={navButtonStyle}>
                  Pricing
                </button>
                <a href="/faq" style={navLinkStyle}>
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
                          <a href="/dashboard" style={{ 
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            textDecoration: 'none',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Dashboard
                          </a>
                          <a href="/account" style={{ 
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            textDecoration: 'none',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Account Settings
                          </a>
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
                    <button onClick={handleSignIn} style={{ ...navButtonStyle, background: 'transparent' }}>
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
                style={mobileNavButtonStyle}
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
                  <button onClick={() => scrollToSection('features')} style={{ ...navButtonStyle, textAlign: 'left' }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ ...navButtonStyle, textAlign: 'left' }}>
                    Pricing
                  </button>
                  <a href="/faq" style={{ ...navLinkStyle, textAlign: 'left' }}>
                    FAQ
                  </a>
                  {user ? (
                    <>
                      <a href="/dashboard" style={{ ...navLinkStyle, textAlign: 'left' }}>
                        Dashboard
                      </a>
                      <button onClick={handleSignOut} style={{ ...navButtonStyle, textAlign: 'left', color: '#dc2626' }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSignIn} style={{ ...navButtonStyle, textAlign: 'left' }}>
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
          <div style={headerContainerStyle}>
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

        {/* Hero Section */}
        <section style={heroStyle} className="hero-section">
          <div style={heroContainerStyle} className="section-container">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#dbeafe', 
              color: '#1e40af', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '2rem', 
              gap: '0.5rem' 
            }}>
              ⚡ Precision-Engineered in London for Global Professionals
            </div>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }} className="hero-title">
              What Excel Comparison
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Should Have Been
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '2rem', 
              maxWidth: '48rem', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }} className="hero-subtitle">
              British-engineered smart mapping + tolerance settings for business data that is never perfect. 
              Unlike cloud-based tools that upload your sensitive data to remote servers, VeriDiff processes everything locally in your browser.
            </p>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              marginBottom: '3rem' 
            }} className="button-group">
              <button onClick={handleTryDemo} style={{ 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '250px'
              }}>
                ▶ Try Full Demo - No Signup Required
              </button>
              <button onClick={handleWatchVideo} style={{ 
                background: 'white', 
                color: '#374151', 
                border: '1px solid #d1d5db', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontSize: '1.125rem', 
                fontWeight: '500', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '200px'
              }}>
                Watch 2-Min Video
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem', 
              maxWidth: '80rem', 
              margin: '0 auto' 
            }} className="security-grid">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>🚫</span>
                <span><strong>No registration required</strong> to test with your real files</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>🔒</span>
                <span><strong>Your files never leave your browser</strong> - processed locally</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151',
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '0.5rem'
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>⚡</span>
                <span><strong>Smart mapping</strong> when columns don't match perfectly</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section style={{ ...sectionStyle, background: '#f8fafc' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937' 
              }} className="section-title">
                Bank-Level Security Without the Complexity
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                Perfect for confidential business data that can't be uploaded to third-party servers
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem', 
              marginBottom: '3rem' 
            }} className="security-grid">
              
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.5rem'
                }}>
                  🔒
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Local Processing Only
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  All file processing happens in your browser. Your sensitive business data never touches our servers or any cloud infrastructure.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Try with Real Data
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Upload your actual confidential files to test VeriDiff's capabilities. No dummy data needed - your files stay completely private.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.5rem'
                }}>
                  ⚡
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  GDPR Compliant by Design
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  Zero data collection or sharing. Built for European privacy standards - perfect for finance teams handling sensitive information.
                </p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #a7f3d0',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#065f46' }}>
                Trusted by Finance Teams Worldwide
              </h3>
              <p style={{ color: '#047857', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                "Finally, a file comparison tool we can use with client data without security concerns."
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                fontSize: '0.875rem',
                color: '#065f46'
              }}>
                <div>✓ Used by accounting firms</div>
                <div>✓ Trusted by banks</div>
                <div>✓ Preferred by consultants</div>
                <div>✓ Relied on by analysts</div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the sections remain the same as before - Demo Section, Pricing, CTA, Footer */}
        {/* Demo Section */}
        <section id="features" style={{ ...sectionStyle, background: 'white' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937' 
              }} className="section-title">
                See the Difference in Action
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                Compare real business data scenarios that other tools cannot handle
              </p>
            </div>

            <div style={{ 
              background: '#f9fafb', 
              borderRadius: '1rem', 
              padding: '2rem' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '1rem', 
                marginBottom: '2rem',
                flexWrap: 'wrap'
              }} className="demo-buttons">
                <button onClick={() => setSelectedDemo('excel-csv')} style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: selectedDemo === 'excel-csv' ? '#2563eb' : 'white', 
                  color: selectedDemo === 'excel-csv' ? 'white' : '#374151',
                  minWidth: '180px',
                  transition: 'all 0.2s'
                }}>
                  Excel ↔ CSV Mapping
                </button>
                <button onClick={() => setSelectedDemo('tolerance')} style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: selectedDemo === 'tolerance' ? '#2563eb' : 'white', 
                  color: selectedDemo === 'tolerance' ? 'white' : '#374151',
                  minWidth: '180px',
                  transition: 'all 0.2s'
                }}>
                  Financial Tolerance
                </button>
              </div>

              {selectedDemo === 'excel-csv' && (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '2rem', 
                    marginBottom: '1.5rem' 
                  }} className="demo-grid">
                    <div style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid #e5e7eb' 
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1rem', 
                        color: '#1f2937' 
                      }}>
                        📊 Accounting_Export_Q4.xlsx
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem' 
                      }}>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#ecfdf5', 
                          color: '#065f46', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Client Company Name</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#ecfdf5', 
                          color: '#065f46', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Invoice Total Amount</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>GBP CURRENCY</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#ecfdf5', 
                          color: '#065f46', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Payment Due Date</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>DATE</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#ecfdf5', 
                          color: '#065f46', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Account Reference</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem', 
                        background: '#f0fdf4', 
                        borderRadius: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#166534' 
                      }}>
                        <strong>1,247 rows</strong> • Excel format with formulas
                      </div>
                    </div>

                    <div style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid #e5e7eb' 
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1rem', 
                        color: '#1f2937' 
                      }}>
                        📄 payment_system_export.csv
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem' 
                      }}>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#eff6ff', 
                          color: '#1e40af', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>customer</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#eff6ff', 
                          color: '#1e40af', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>amount</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>NUMBER</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#eff6ff', 
                          color: '#1e40af', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>due_date</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#eff6ff', 
                          color: '#1e40af', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>ref_code</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>TEXT</span>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem', 
                        background: '#eff6ff', 
                        borderRadius: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#1e40af' 
                      }}>
                        <strong>1,193 rows</strong> • CSV from payment processor
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: '#dcfce7', 
                    color: '#166534', 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    textAlign: 'center' 
                  }}>
                    <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                      ✨ Smart Mapping Results:
                    </p>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '1rem', 
                      textAlign: 'left' 
                    }} className="tolerance-grid">
                      <div>
                        <strong>✓ Auto-mapped fields:</strong><br/>
                        • Client Company Name → customer<br/>
                        • Invoice Total Amount → amount<br/>  
                        • Payment Due Date → due_date
                      </div>
                      <div>
                        <strong>📊 Match Summary:</strong><br/>
                        • 1,089 perfect matches<br/>
                        • 54 tolerance matches<br/>
                        • 50 discrepancies flagged
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedDemo === 'tolerance' && (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '2rem', 
                    marginBottom: '1.5rem' 
                  }} className="demo-grid">
                    <div style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid #e5e7eb' 
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1rem', 
                        color: '#1f2937' 
                      }}>
                        💰 Budget_2024.xlsx
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem' 
                      }}>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Marketing Budget</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 85,000</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Operations Budget</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 120,000</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#fef3c7', 
                          color: '#92400e', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Software Licenses</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 45,000</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      background: 'white', 
                      padding: '1.5rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid #e5e7eb' 
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        marginBottom: '1rem', 
                        color: '#1f2937' 
                      }}>
                        📈 Actual_Spend_Q1.csv
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem' 
                      }}>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#f0f9ff', 
                          color: '#0369a1', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Marketing Actual</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 87,230</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#f0f9ff', 
                          color: '#0369a1', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Operations Actual</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 118,450</span>
                        </div>
                        <div style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.875rem', 
                          background: '#f0f9ff', 
                          color: '#0369a1', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          flexWrap: 'wrap'
                        }}>
                          <span>Software Actual</span>
                          <span style={{ fontWeight: 'bold' }}>GBP 46,180</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: '#dcfce7', 
                    color: '#166534', 
                    padding: '1rem', 
                    borderRadius: '0.5rem' 
                  }}>
                    <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                      💡 Tolerance Analysis (±3% acceptable variance):
                    </p>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr', 
                      gap: '1rem', 
                      textAlign: 'center' 
                    }} className="tolerance-grid">
                      <div style={{ 
                        padding: '0.5rem', 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        borderRadius: '0.25rem' 
                      }}>
                        <strong>Marketing</strong><br/>
                        +2.6% over budget<br/>
                        <span style={{ fontSize: '0.75rem' }}>❌ Outside tolerance</span>
                      </div>
                      <div style={{ 
                        padding: '0.5rem', 
                        background: '#f0fdf4', 
                        color: '#16a34a', 
                        borderRadius: '0.25rem' 
                      }}>
                        <strong>Operations</strong><br/>
                        -1.3% under budget<br/>
                        <span style={{ fontSize: '0.75rem' }}>✅ Within tolerance</span>
                      </div>
                      <div style={{ 
                        padding: '0.5rem', 
                        background: '#f0fdf4', 
                        color: '#16a34a', 
                        borderRadius: '0.25rem' 
                      }}>
                        <strong>Software</strong><br/>
                        +2.6% over budget<br/>
                        <span style={{ fontSize: '0.75rem' }}>✅ Within tolerance</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ ...sectionStyle, background: '#f9fafb' }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937' 
              }} className="section-title">
                Simple, Transparent Pricing
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                Start free, upgrade when you need more
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem', 
              maxWidth: '80rem', 
              margin: '0 auto' 
            }} className="pricing-grid">
              
              {/* Starter Plan */}
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #e5e7eb' 
              }} className="pricing-card">
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: '#1f2937' 
                }}>
                  Starter
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Perfect for trying VeriDiff
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ 
                    fontSize: '2.25rem', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    Free
                  </span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>5 comparisons per month</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Files up to 5MB</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>All comparison formats</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Local processing only</span>
                  </div>
                </div>
                <button onClick={handleTryDemo} style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#f3f4f6', 
                  color: '#111827',
                  transition: 'all 0.2s'
                }}>
                  Start Free
                </button>
              </div>

              {/* Professional Plan */}
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #2563eb', 
                position: 'relative' 
              }} className="pricing-card">
                <div style={{ 
                  position: 'absolute', 
                  top: '-0.5rem', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  background: '#2563eb', 
                  color: 'white', 
                  padding: '0.25rem 1rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '500' 
                }}>
                  Most Popular
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: '#1f2937' 
                }}>
                  Professional
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  For growing businesses
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ 
                    fontSize: '2.25rem', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    £19
                  </span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Unlimited comparisons</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Files up to 50MB</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Advanced tolerance settings</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Local processing only</span>
                  </div>
                </div>
                <button onClick={handleProTrial} style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#2563eb', 
                  color: 'white',
                  transition: 'all 0.2s'
                }}>
                  Start Pro Trial
                </button>
              </div>

              {/* Business Plan */}
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #e5e7eb' 
              }} className="pricing-card">
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  marginBottom: '0.5rem', 
                  color: '#1f2937' 
                }}>
                  Business
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  For teams and organizations
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ 
                    fontSize: '2.25rem', 
                    fontWeight: '700', 
                    color: '#111827' 
                  }}>
                    £79
                  </span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Everything in Pro</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Unlimited file size</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Team collaboration</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Local processing only</span>
                  </div>
                </div>
                <button onClick={handleContactSales} style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#111827', 
                  color: 'white',
                  transition: 'all 0.2s'
                }}>
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '5rem 0', 
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
          color: 'white', 
          textAlign: 'center' 
        }} className="section-padding">
          <div style={sectionContainerStyle} className="section-container">
            <h2 style={{ 
              fontSize: '2.25rem', 
              fontWeight: '700', 
              marginBottom: '1rem' 
            }} className="section-title">
              Ready to Stop Wrestling with Data?
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#bfdbfe', 
              marginBottom: '2rem' 
            }}>
              Join forward-thinking professionals using business-intelligent data reconciliation - with complete privacy
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              marginBottom: '2rem' 
            }} className="button-group">
              <button onClick={handleTryDemo} style={{ 
                background: 'white', 
                color: '#2563eb', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontWeight: '500', 
                border: 'none', 
                cursor: 'pointer',
                minWidth: '250px',
                transition: 'all 0.2s'
              }}>
                ▶ Try Full Demo - No Signup Required
              </button>
              <button onClick={handleProTrial} style={{ 
                background: '#1e40af', 
                color: 'white', 
                padding: '1rem 2rem', 
                borderRadius: '0.5rem', 
                fontWeight: '500', 
                border: '1px solid #3b82f6', 
                cursor: 'pointer',
                minWidth: '180px',
                transition: 'all 0.2s'
              }}>
                Start Pro Trial - £19/month
              </button>
            </div>
            
            <p style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>
              ✓ No registration required for demo • ✓ Your files never leave your browser • ✓ 30-day money-back guarantee
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ 
          background: '#111827', 
          color: 'white', 
          padding: '3rem 0' 
        }}>
          <div style={sectionContainerStyle} className="section-container">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem', 
              marginBottom: '2rem' 
            }} className="footer-grid">
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
      </div>
    </>
  );
}
