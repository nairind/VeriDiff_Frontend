import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

const Header = ({ onSignIn = () => {}, onSignUp = () => {} }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation handlers
  const handleSignIn = () => {
    onSignIn();
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
  };

  // REMOVED: handleTryDemo function

  const handleContact = () => {
    window.location.href = 'mailto:sales@veridiff.com';
  };

  // Check if current path matches nav item
  const isActivePath = (path) => {
    return router.pathname === path;
  };

  // Close mobile menu when navigating
  const handleMobileNavClick = () => {
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

  const getNavLinkStyle = (path) => ({
    textDecoration: 'none',
    color: isActivePath(path) ? '#2563eb' : '#374151',
    fontWeight: isActivePath(path) ? '600' : '500',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'all 0.2s',
    display: 'block',
    borderBottom: isActivePath(path) ? '2px solid #2563eb' : '2px solid transparent'
  });

  const getMobileNavLinkStyle = (path) => ({
    textDecoration: 'none',
    color: isActivePath(path) ? '#2563eb' : '#374151',
    fontWeight: isActivePath(path) ? '600' : '500',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'all 0.2s',
    display: 'block',
    textAlign: 'left',
    background: isActivePath(path) ? '#eff6ff' : 'transparent'
  });

  const authButtonStyle = {
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
        
        .nav-link:hover {
          color: #2563eb !important;
        }
        
        .mobile-nav-link:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
      
      <header style={headerStyle}>
        <div style={headerContainerStyle}>
          <div style={headerContentStyle}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={logoStyle}>VeriDiff</span>
            </Link>
            
            <nav style={desktopNavStyle} className="desktop-nav">
              <Link href="/how-it-works" style={getNavLinkStyle('/how-it-works')} className="nav-link">
                How It Works
              </Link>
              <Link href="/use-cases" style={getNavLinkStyle('/use-cases')} className="nav-link">
                Use Cases
              </Link>
              <Link href="/security" style={getNavLinkStyle('/security')} className="nav-link">
                Security
              </Link>
              <Link href="/about" style={getNavLinkStyle('/about')} className="nav-link">
                About
              </Link>
              <button onClick={handleContact} style={authButtonStyle}>
                Contact
              </button>
              
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
                  <button onClick={handleSignIn} style={{ ...authButtonStyle, background: 'transparent' }}>
                    Sign In
                  </button>
                  {/* REMOVED: Try Free Demo button from desktop nav */}
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
                <Link href="/how-it-works" style={getMobileNavLinkStyle('/how-it-works')} className="mobile-nav-link" onClick={handleMobileNavClick}>
                  How It Works
                </Link>
                <Link href="/use-cases" style={getMobileNavLinkStyle('/use-cases')} className="mobile-nav-link" onClick={handleMobileNavClick}>
                  Use Cases
                </Link>
                <Link href="/security" style={getMobileNavLinkStyle('/security')} className="mobile-nav-link" onClick={handleMobileNavClick}>
                  Security
                </Link>
                <Link href="/about" style={getMobileNavLinkStyle('/about')} className="mobile-nav-link" onClick={handleMobileNavClick}>
                  About
                </Link>
                <button onClick={handleContact} style={{ ...authButtonStyle, textAlign: 'left' }}>
                  Contact
                </button>
                {session ? (
                  <button onClick={handleSignOut} style={{ ...authButtonStyle, textAlign: 'left', color: '#dc2626' }}>
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button onClick={handleSignIn} style={{ ...authButtonStyle, textAlign: 'left' }}>
                      Sign In
                    </button>
                    {/* REMOVED: Try Free Demo button from mobile nav */}
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
