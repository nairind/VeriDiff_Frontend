import React, { useState } from 'react';

// Header Component
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const handleContact = () => {
    window.location.href = 'mailto:sales@veridiff.com';
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-button { display: block !important; }
        }
      `}</style>
      
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
            <span style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              cursor: 'pointer'
            }}>
              VeriDiff
            </span>
            
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
              <button onClick={() => scrollToSection('how-it-works')} style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem',
                borderRadius: '0.25rem'
              }}>
                How It Works
              </button>
              <button onClick={() => scrollToSection('early-adopter-benefits')} style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem',
                borderRadius: '0.25rem'
              }}>
                Early Adopter Benefits
              </button>
              <button onClick={handleContact} style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0.5rem',
                borderRadius: '0.25rem'
              }}>
                Contact
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
                Try Free Now
              </button>
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

          {mobileMenuOpen && (
            <div style={{
              borderTop: '1px solid #e5e7eb',
              padding: '1rem 0',
              background: 'white'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => scrollToSection('how-it-works')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '0.5rem'
                }}>
                  How It Works
                </button>
                <button onClick={() => scrollToSection('early-adopter-benefits')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '0.5rem'
                }}>
                  Early Adopter Benefits
                </button>
                <button onClick={handleContact} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '0.5rem'
                }}>
                  Contact
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
                  Try Free Now
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

// Footer Component
const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
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
                <button onClick={() => scrollToSection('how-it-works')} style={{ 
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
                  How It Works
                </button>
                <button onClick={() => scrollToSection('early-adopter-benefits')} style={{ 
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
                  Early Adopter Benefits
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
    </>
  );
};

// Main Homepage Component
export default function HomePage() {
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const handleContact = () => {
    window.location.href = 'mailto:sales@veridiff.com';
  };

  const handleAcceptCookies = () => {
    setShowCookieBanner(false);
    // In real implementation: localStorage.setItem('veridiff_cookies_accepted', 'true');
  };

  const handleDeclineCookies = () => {
    setShowCookieBanner(false);
    // In real implementation: localStorage.setItem('veridiff_cookies_accepted', 'essential_only');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {/* Cookie Banner */}
      {showCookieBanner && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '2px solid #2563eb',
          padding: '1rem 20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: '#374151',
                lineHeight: '1.5'
              }}>
                🔒 <strong>Privacy-First:</strong> We use minimal cookies for essential functionality only. 
                No tracking, no data collection. Your files never leave your browser. 
                <a href="/cookies" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '0.25rem' }}>
                  View Cookie Policy
                </a>
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <button onClick={handleDeclineCookies} style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                Essential Only
              </button>
              <button onClick={handleAcceptCookies} style={{
                background: '#2563eb',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main style={{ flex: 1 }}>
        
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '6rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⏰</span>
              <span style={{ fontWeight: '600' }}>Early Adopter Program - Ends April 11th</span>
            </div>
            
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              lineHeight: '1.1'
            }}>
              Get 6 Months Free + 
              <span style={{ display: 'block', opacity: 0.9 }}>
                Shape the Future of Data Comparison
              </span>
            </h1>
            
            <p style={{
              fontSize: '1.4rem',
              marginBottom: '3rem',
              opacity: 0.9,
              maxWidth: '800px',
              margin: '0 auto 3rem auto',
              lineHeight: '1.6'
            }}>
              Join our exclusive partnership program. Unlimited enterprise-grade comparisons, share professional insights, 
              and get 6 months Individual Plan free (£114 value). Your data never leaves your browser.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              <button onClick={handleTryDemo} style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                Start Unlimited Comparisons
              </button>
              
              <button onClick={() => document.getElementById('early-adopter-benefits').scrollIntoView({ behavior: 'smooth' })} style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                See Early Adopter Benefits
              </button>
            </div>

            <p style={{
              fontSize: '1rem',
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Deadline: July 11th, 2025 • 6 Months Free (£114 value) • No emails, no pressure
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{
          padding: '5rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Simple Process, Powerful Results
            </h2>
            
            <p style={{
              fontSize: '1.3rem',
              color: '#6b7280',
              marginBottom: '4rem',
              maxWidth: '600px',
              margin: '0 auto 4rem auto'
            }}>
              Three steps to unlimited precision. Help us perfect each one.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              marginBottom: '3rem'
            }}>
              
              {/* Step 1 */}
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                borderRadius: '20px',
                padding: '2.5rem',
                border: '2px solid #0ea5e9',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2rem'
                }}>
                  📁
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1f2937'
                }}>
                  1. Upload Your Files
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  Drag & drop Excel, CSV, PDF - any format. 
                  Your data stays completely private in your browser.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                borderRadius: '20px',
                padding: '2.5rem',
                border: '2px solid #22c55e',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2rem'
                }}>
                  ⚡
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1f2937'
                }}>
                  2. Get Instant Results
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  Unlimited character-level precision analysis in seconds. 
                  Sign up to access full reports and export capabilities.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                background: 'linear-gradient(135deg, #fef7ff, #fae8ff)',
                borderRadius: '20px',
                padding: '2.5rem',
                border: '2px solid #a855f7',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2rem'
                }}>
                  💬
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1f2937'
                }}>
                  3. Share Your Professional Insights
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  Contribute your expertise through real-world usage. 
                  Your professional insights directly influence our development priorities.
                </p>
              </div>
            </div>

            <button onClick={handleTryDemo} style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
            }}>
              Start Unlimited Comparisons
            </button>
          </div>
        </section>

        {/* Early Adopter Benefits Section */}
        <section id="early-adopter-benefits" style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '2px solid #f59e0b',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              marginBottom: '2rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⏰</span>
              <span style={{ fontWeight: '700', color: '#92400e' }}>Early Adopter Program - Ends July 11th, 2025</span>
            </div>

            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Save £150-300 vs. Enterprise Alternatives
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2.5rem'
              }}>
                Get 6 Months Free Instead
              </span>
            </h2>
            
            <p style={{
              fontSize: '1.3rem',
              color: '#6b7280',
              marginBottom: '4rem',
              maxWidth: '700px',
              margin: '0 auto 4rem auto'
            }}>
              Enterprise document comparison tools cost £150-300 for 6 months. 
              You get VeriDiff's advanced features free, plus shape our roadmap.
            </p>

            {/* Market Comparison */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              marginBottom: '3rem',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                marginBottom: '2rem',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                VeriDiff vs. Enterprise Alternatives
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                
                {/* Competitor Comparison */}
                <div style={{
                  background: '#fef2f2',
                  borderRadius: '15px',
                  padding: '2rem',
                  border: '2px solid #fca5a5'
                }}>
                  <h4 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#dc2626'
                  }}>
                    Enterprise Competitors
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#7f1d1d' }}>
                      <span style={{ color: '#dc2626' }}>❌</span>
                      <span>Workshare Compare: £25-45/month</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#7f1d1d' }}>
                      <span style={{ color: '#dc2626' }}>❌</span>
                      <span>Enterprise Tools: £30-50/month</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#7f1d1d' }}>
                      <span style={{ color: '#dc2626' }}>❌</span>
                      <span>Cloud-based (security risk)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#7f1d1d' }}>
                      <span style={{ color: '#dc2626' }}>❌</span>
                      <span>File size limitations</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#7f1d1d' }}>
                      <span style={{ color: '#dc2626' }}>❌</span>
                      <span>Limited format support</span>
                    </li>
                  </ul>
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#fee2e2',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>
                      6 Months: £150-300
                    </strong>
                  </div>
                </div>

                {/* VeriDiff Advantages */}
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '15px',
                  padding: '2rem',
                  border: '2px solid #10b981'
                }}>
                  <h4 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#059669'
                  }}>
                    VeriDiff Early Adopter
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#064e3b' }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>Character-level precision</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#064e3b' }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>Browser-based security</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#064e3b' }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>Cross-format support (Excel↔CSV↔PDF)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#064e3b' }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>No file size limits</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#064e3b' }}>
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>Enhanced Excel capabilities</span>
                    </li>
                  </ul>
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#dcfce7',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                      6 Months: FREE (£114 value)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Security Highlight */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '15px',
                padding: '2rem',
                marginTop: '2rem',
                border: '2px solid #3b82f6',
                textAlign: 'center'
              }}>
                <h4 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: '#1e40af'
                }}>
                  🔒 Bank-Level Security Advantage
                </h4>
                <p style={{
                  color: '#1e40af',
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Unlike cloud-based competitors, <strong>your data never leaves your browser</strong>. 
                  No uploads, no storage, no security risks. Compare sensitive financial documents, 
                  contracts, and confidential data with complete privacy.
                </p>
              </div>
            </div>

            {/* Early Adopter CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '20px',
              padding: '3rem',
              border: '2px solid #f59e0b',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#92400e'
              }}>
                Early Adopter Exclusive: Ends July 11th, 2025
              </h3>
              <p style={{
                fontSize: '1.2rem',
                color: '#92400e',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                We're seeking experienced professionals to collaborate with us in refining VeriDiff. 
                Share your expertise through real-world usage → Get 6 months Individual Plan free. 
                That's £150-300 in savings vs. enterprise alternatives, plus direct influence on our development roadmap.
              </p>
              
              <button onClick={handleTryDemo} style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.3rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}>
                Join Early Adopters Now
              </button>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#a16207',
                marginTop: '1rem',
                fontStyle: 'italic'
              }}>
                Limited time • No credit card required • Feedback collected in-app
              </p>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" style={{
          padding: '5rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Professional Collaboration Program
            </h2>
            
            <p style={{
              fontSize: '1.3rem',
              color: '#6b7280',
              marginBottom: '4rem',
              maxWidth: '700px',
              margin: '0 auto 4rem auto'
            }}>
              We're partnering with select professionals to refine VeriDiff through real-world expertise. 
              Your insights drive our development priorities and feature roadmap.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '20px',
              padding: '3rem',
              marginBottom: '3rem',
              border: '2px solid #f59e0b'
            }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: '#92400e'
              }}>
                Strategic Partnership Benefits
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                  <p style={{ color: '#92400e', fontWeight: '500' }}>
                    Save £150-300 vs. enterprise alternatives
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <p style={{ color: '#92400e', fontWeight: '500' }}>
                    Direct influence on product development
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                  <p style={{ color: '#92400e', fontWeight: '500' }}>
                    Recognition as a founding contributor
                  </p>
                </div>
              </div>

              <button onClick={handleTryDemo} style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}>
                Join the Partnership Program
              </button>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section style={{
          padding: '5rem 0',
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '3rem',
                color: '#1f2937',
                textAlign: 'center'
              }}>
                Zero Friction, Maximum Security
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                alignItems: 'center'
              }}>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Bank-Level Security
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
                    All processing happens locally in your browser. 
                    Your data never leaves your device - guaranteed.
                  </p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Unlimited Comparisons
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
                    Test unlimited document comparisons immediately. 
                    Sign up to access full reports and export features.
                  </p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    No Pressure Feedback
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
                    Share thoughts when ready, through the app. 
                    No emails, no calls, no sales pressure.
                  </p>
                </div>
                
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '3rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                borderRadius: '15px',
                border: '1px solid #0ea5e9'
              }}>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#0c4a6e',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  ⏰ Professional Partnership Program Ends July 11th, 2025
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#075985',
                  marginBottom: '1.5rem'
                }}>
                  Collaborate with us • Get 6 months free (£114 value) • Influence our roadmap
                </p>
                
                <button onClick={handleTryDemo} style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                  marginRight: '1rem'
                }}>
                  Join the Partnership
                </button>
                
                <button onClick={handleContact} style={{
                  background: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  Ask Questions
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
