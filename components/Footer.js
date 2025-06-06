import React from 'react';

const Footer = () => {
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
  };

  const sectionContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
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
        <div style={sectionContainerStyle}>
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
    </>
  );
};

export default Footer;
