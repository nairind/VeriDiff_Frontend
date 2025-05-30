import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Privacy() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHome = () => {
    router.push('/');
  };

  const scrollToSection = (sectionId) => {
    router.push(`/#${sectionId}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Privacy Policy - VeriDiff</title>
        <meta name="description" content="VeriDiff Privacy Policy - How we protect your data and ensure complete privacy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background: #f9fafb;
          }
          
          .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 0 20px; 
          }
          
          .header { 
            background: white; 
            border-bottom: 1px solid #e5e7eb; 
            position: sticky; 
            top: 0; 
            z-index: 1000; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .nav-container { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            height: 64px; 
          }
          
          .logo { 
            font-size: 1.5rem; 
            font-weight: 700; 
            background: linear-gradient(135deg, #2563eb, #7c3aed); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text; 
            cursor: pointer; 
          }
          
          .desktop-nav { 
            display: flex; 
            gap: 2rem; 
            align-items: center; 
          }
          
          .mobile-nav-button { 
            display: none; 
            background: none; 
            border: none; 
            cursor: pointer; 
            padding: 8px; 
            color: #374151; 
          }
          
          .nav-button {
            background: none;
            border: none;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
            padding: 0.5rem;
            text-decoration: none;
          }

          .nav-button:hover {
            color: #2563eb;
          }

          .nav-link {
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            padding: 0.5rem;
          }

          .nav-link:hover {
            color: #2563eb;
          }
          
          .main-content { 
            background: white;
            margin: 2rem auto;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            max-width: 800px;
          }
          
          .last-updated { 
            background: #f3f4f6; 
            padding: 1rem; 
            border-radius: 0.5rem; 
            margin-bottom: 2rem; 
            text-align: center;
          }
          
          .content h1 { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 1.5rem; 
            color: #1f2937; 
            text-align: center;
          }
          
          .content h2 { 
            font-size: 1.5rem; 
            font-weight: 600; 
            margin: 2rem 0 1rem 0; 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
          }
          
          .content p { 
            margin-bottom: 1rem; 
            color: #4b5563; 
            text-align: justify;
          }
          
          .content ul { 
            margin: 1rem 0; 
            padding-left: 2rem; 
          }
          
          .content li { 
            margin-bottom: 0.5rem; 
            color: #4b5563; 
          }

          .content strong {
            color: #1f2937;
          }
          
          @media (max-width: 768px) {
            .desktop-nav { 
              display: none !important; 
            }
            .mobile-nav-button { 
              display: block !important; 
            }
            .main-content {
              margin: 1rem;
              padding: 2rem 1.5rem;
            }
            .content h1 {
              font-size: 2rem;
            }
            .content h2 {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh' }}>
        <header className="header">
          <div className="container">
            <div className="nav-container">
              <div className="logo" onClick={handleHome}>VeriDiff</div>
              
              <nav className="desktop-nav">
                <button onClick={() => scrollToSection('features')} className="nav-button">
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} className="nav-button">
                  Pricing
                </button>
                <Link href="/faq" className="nav-link">
                  FAQ
                </Link>
              </nav>

              <button 
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
                  <button onClick={() => scrollToSection('features')} className="nav-button" style={{ textAlign: 'left' }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="nav-button" style={{ textAlign: 'left' }}>
                    Pricing
                  </button>
                  <Link href="/faq" className="nav-link" style={{ textAlign: 'left' }}>
                    FAQ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="main-content">
          <div className="content">
            <div className="last-updated">
              <strong>Last updated:</strong> January 2025
            </div>

            <h1>Privacy Policy</h1>

            <h2>1. Introduction</h2>
            <p>VeriDiff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our file comparison service.</p>

            <h2>2. Data Processing Philosophy</h2>
            <p>VeriDiff is designed with privacy-by-design principles:</p>
            <ul>
              <li><strong>Client-side processing:</strong> All file comparisons happen in your browser</li>
              <li><strong>No server uploads:</strong> Your files never leave your device</li>
              <li><strong>No data storage:</strong> We don't store your files or comparison results</li>
              <li><strong>Session-only:</strong> Data is cleared when you close your browser</li>
            </ul>

            <h2>3. Information We Collect</h2>
            <p><strong>Personal Information:</strong></p>
            <ul>
              <li>Email address (for account creation and communication)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Usage analytics (file comparison counts, feature usage)</li>
            </ul>
            <p><strong>File Data:</strong></p>
            <ul>
              <li>We do NOT collect, store, or access your file contents</li>
              <li>File processing occurs entirely within your browser</li>
              <li>No file data is transmitted to our servers</li>
            </ul>

            <h2>4. How We Use Your Information</h2>
            <ul>
              <li>Account management and authentication</li>
              <li>Payment processing and billing</li>
              <li>Service improvement and analytics</li>
              <li>Customer support and communication</li>
              <li>Legal compliance and fraud prevention</li>
            </ul>

            <h2>5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share data only with:</p>
            <ul>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Google Analytics:</strong> For usage analytics (optional)</li>
              <li><strong>Legal authorities:</strong> When required by law</li>
            </ul>

            <h2>6. Your Rights (GDPR Compliance)</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request copies of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Transfer your data to another service</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
            </ul>

            <h2>7. Data Retention</h2>
            <ul>
              <li><strong>File data:</strong> Never stored (processed client-side only)</li>
              <li><strong>Account data:</strong> Retained until account deletion</li>
              <li><strong>Payment records:</strong> Retained for 7 years (legal requirement)</li>
              <li><strong>Usage analytics:</strong> Retained for 24 months</li>
            </ul>

            <h2>8. Security</h2>
            <p>We implement appropriate security measures including:</p>
            <ul>
              <li>HTTPS encryption for all communications</li>
              <li>Secure payment processing through Stripe</li>
              <li>Client-side processing to minimize data exposure</li>
              <li>Regular security audits and updates</li>
            </ul>

            <h2>9. Contact Information</h2>
            <p>For privacy-related questions or to exercise your rights, contact us at:</p>
            <p><strong>Email:</strong> privacy@veridiff.com</p>
            <p><strong>Data Protection Officer:</strong> dpo@veridiff.com</p>

            <h2>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy occasionally. We will notify users of significant changes via email or through our service.</p>
          </div>
        </div>
      </div>
    </>
  );
}
