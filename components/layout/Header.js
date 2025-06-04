import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const scrollToSection = (sectionId) => {
    // If we're on the homepage, scroll to section
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, redirect to homepage with section
      window.location.href = `/#${sectionId}`;
    }
    setMobileMenuOpen(false);
  };

  // Styles
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

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-button { display: block !important; }
        }
      `}</style>
      
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
                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                          {session.user?.name}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {session.user?.email}
                        </div>
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
    </>
  );
};

export default Header;
