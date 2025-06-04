import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';

function ComparisonEngineHub() {
  const { data: session } = useSession();
  
  // UI states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userTier, setUserTier] = useState('free');

  // Navigation handlers
  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleAccountSettings = () => {
    window.location.href = '/account';
  };

  const scrollToSection = (sectionId) => {
    // Redirect to homepage with section
    window.location.href = `/#${sectionId}`;
    setMobileMenuOpen(false);
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  // Tool data
  const tools = [
    {
      id: 'spreadsheets',
      title: 'Business Spreadsheets',
      subtitle: 'Excel & CSV Comparison',
      description: 'Smart mapping, tolerance settings, and business data reconciliation. Excel-Excel comparisons are FREE forever.',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      route: '/compare/spreadsheets',
      features: ['Excel-Excel (FREE)', 'Excel-CSV (Premium)', 'Smart header mapping', 'Tolerance controls'],
      usage: 'Perfect for financial reports, data validation, and business reconciliation',
      free: true
    },
    {
      id: 'pdf',
      title: 'PDF Documents',
      subtitle: 'Professional Document Analysis',
      description: 'Advanced PDF text extraction and page-by-page comparison for contracts, reports, and legal documents.',
      icon: '📄',
      gradient: 'linear-gradient(135deg, #dc2626, #ea580c)',
      route: '/compare/pdf',
      features: ['Text extraction', 'Page-by-page analysis', 'Large files (100MB)', 'Enterprise-grade accuracy'],
      usage: 'Ideal for legal contracts, business reports, and academic papers',
      free: false
    },
    {
      id: 'technical',
      title: 'Technical Files',
      subtitle: 'Code & Data Formats',
      description: 'Format-specific analysis for developers and technical teams. Text files are FREE, advanced formats require premium.',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      route: '/compare/documents',
      features: ['Text files (FREE)', 'JSON & XML (Premium)', 'Format-specific analysis', 'Developer tools'],
      usage: 'Built for developers, IT teams, and technical documentation',
      free: 'partial'
    }
  ];

  // Tool card component
  const ToolCard = ({ tool }) => {
    const handleToolSelect = () => {
      window.location.href = tool.route;
    };

    return (
      <div
        onClick={handleToolSelect}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: tool.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {tool.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: '#1f2937'
            }}>
              {tool.title}
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: '0',
              fontWeight: '500'
            }}>
              {tool.subtitle}
            </p>
          </div>
          {tool.free === true && (
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              FREE
            </div>
          )}
          {tool.free === 'partial' && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              FREEMIUM
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{
          fontSize: '1rem',
          color: '#374151',
          lineHeight: '1.6',
          marginBottom: '20px',
          flex: 1
        }}>
          {tool.description}
        </p>

        {/* Features */}
        <div style={{
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            Key Features:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {tool.features.map((feature, index) => (
              <div key={index} style={{
                fontSize: '0.85rem',
                color: '#059669',
                background: '#f0fdf4',
                padding: '4px 8px',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #bbf7d0'
              }}>
                • {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#374151',
            margin: '0',
            fontStyle: 'italic'
          }}>
            💡 {tool.usage}
          </p>
        </div>

        {/* CTA Button */}
        <button
          style={{
            background: tool.gradient,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'none';
          }}
        >
          Start Comparison →
        </button>
      </div>
    );
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
    cursor: 'pointer',
    textDecoration: 'none'
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

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '60px 30px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
    borderRadius: '24px',
    marginBottom: '50px',
    color: 'white',
    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)'
  };

  // Media query styles
  const mediaQueries = `
    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
      .mobile-nav-button { display: block !important; }
      .tools-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 2.5rem !important; }
      .hero-section { padding: 40px 20px !important; }
      .main-container { padding: 20px 15px !important; }
      .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    
    @media (max-width: 480px) {
      .hero-title { font-size: 2rem !important; }
      .hero-section { padding: 30px 15px !important; }
      .main-container { padding: 15px 10px !important; }
      .footer-grid { grid-template-columns: 1fr !important; }
    }
  `;

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>VeriDiff - Comparison Engine</title>
          <style>{mediaQueries}</style>
        </Head>

        {/* Header */}
        <header style={headerStyle}>
          <div style={headerContainerStyle}>
            <div style={headerContentStyle}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={logoStyle}>VeriDiff</span>
              </Link>
              
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
                
                <Link href="/" style={{ ...navLinkStyle, textDecoration: 'none' }}>
                  ← Back to Home
                </Link>
                
                {session ? (
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
                        borderRadius: '0.25rem'
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
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{session.user?.name}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{session.user?.email}</div>
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
                            borderRadius: '0.25rem'
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
                            borderRadius: '0.25rem'
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
                            borderRadius: '0.25rem'
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
                    <Link href="/" style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '0.5rem', 
                      fontWeight: '500',
                      background: '#2563eb', 
                      color: 'white',
                      textDecoration: 'none'
                    }}>
                      Try Free Demo
                    </Link>
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
                  {session ? (
                    <>
                      <button onClick={handleDashboard} style={{ ...navButtonStyle, textAlign: 'left' }}>
                        Dashboard
                      </button>
                      <button onClick={handleSignOut} style={{ ...navButtonStyle, textAlign: 'left', color: '#dc2626' }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSignIn} style={{ ...navButtonStyle, textAlign: 'left' }}>
                        Sign In
                      </button>
                      <Link href="/" style={{ 
                        padding: '0.75rem 1rem', 
                        borderRadius: '0.5rem', 
                        fontWeight: '500',
                        background: '#2563eb', 
                        color: 'white',
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'block'
                      }}>
                        Try Free Demo
                      </Link>
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

        <main style={mainStyle} className="main-container">
          {/* Hero Section */}
          <div style={heroStyle} className="hero-section">
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: '0 0 20px 0',
              lineHeight: '1.2'
            }} className="hero-title">
              Comparison Engine
            </h1>
            <p style={{
              fontSize: '1.3rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 30px auto'
            }}>
              Choose your specialized comparison tool. Each tool is precision-engineered for specific file types and use cases.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              fontSize: '0.9rem',
              opacity: '0.8'
            }}>
              <span>✓ Browser-only processing</span>
              <span>✓ Enterprise-grade privacy</span>
              <span>✓ Professional accuracy</span>
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }} className="tools-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Not Sure Which Tool to Use?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              margin: '0 0 25px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Start with Business Spreadsheets for Excel files, or contact our team for guidance on the best tool for your specific needs.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/compare/spreadsheets" style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                Start with Spreadsheets
              </Link>
              <a href="mailto:hello@veridiff.com" style={{
                background: 'white',
                color: '#374151',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s'
              }}>
                Contact Support
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
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
    </AuthGuard>
  );
}

export default ComparisonEngineHub;
