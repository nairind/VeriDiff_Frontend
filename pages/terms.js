import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Terms() {
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
        <title>Terms of Service - VeriDiff</title>
        <meta name="description" content="VeriDiff Terms of Service - Terms and conditions for using our file comparison platform." />
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

            <h1>Terms of Service</h1>

            <h2>1. Service Description</h2>
            <p>VeriDiff provides a file comparison platform supporting Excel, CSV, PDF, JSON, XML, and TXT formats with intelligent field mapping and tolerance settings.</p>

            <h2>2. Acceptance of Terms</h2>
            <p>By accessing or using VeriDiff, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

            <h2>3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Use the service for legitimate business purposes only</li>
              <li>Not upload malicious, illegal, or copyrighted files</li>
              <li>Respect file size limits and usage quotas</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h2>4. Service Limitations</h2>
            <ul>
              <li><strong>Uptime Target:</strong> 99% availability (not guaranteed)</li>
              <li><strong>File Processing:</strong> Subject to browser memory limitations</li>
              <li><strong>Usage Limits:</strong> As defined in your chosen pricing tier</li>
              <li><strong>Feature Availability:</strong> Subject to browser compatibility</li>
            </ul>

            <h2>5. Payment Terms</h2>
            <ul>
              <li><strong>Billing:</strong> Monthly or annual as selected</li>
              <li><strong>Payment Processing:</strong> Via Stripe payment processor</li>
              <li><strong>Refunds:</strong> 30-day money-back guarantee</li>
              <li><strong>Cancellation:</strong> 30-day grace period after cancellation</li>
              <li><strong>Price Changes:</strong> 30-day advance notice required</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <ul>
              <li><strong>Your Files:</strong> You retain all rights to files you process</li>
              <li><strong>VeriDiff Platform:</strong> We retain all rights to our software and technology</li>
              <li><strong>Trademarks:</strong> VeriDiff and related marks are our property</li>
            </ul>

            <h2>7. Data and Privacy</h2>
            <ul>
              <li>File processing occurs entirely in your browser</li>
              <li>We do not store or access your file contents</li>
              <li>Account and usage data is handled per our Privacy Policy</li>
              <li>You are responsible for backing up your own data</li>
            </ul>

            <h2>8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>VeriDiff is provided "AS IS" without warranties</li>
              <li>We are not liable for data loss or business interruption</li>
              <li>Total liability is limited to fees paid in the last 12 months</li>
              <li>We are not responsible for file comparison accuracy</li>
            </ul>

            <h2>9. Termination</h2>
            <p>Either party may terminate this agreement:</p>
            <ul>
              <li>You may cancel your account at any time</li>
              <li>We may suspend accounts for Terms violations</li>
              <li>Paid subscriptions continue until the end of the billing period</li>
              <li>Account data may be deleted 90 days after termination</li>
            </ul>

            <h2>10. Dispute Resolution</h2>
            <ul>
              <li><strong>First Contact:</strong> Email support@veridiff.com</li>
              <li><strong>Mediation:</strong> Good faith mediation before legal action</li>
              <li><strong>Governing Law:</strong> Laws of England and Wales</li>
              <li><strong>Jurisdiction:</strong> Courts of England and Wales</li>
            </ul>

            <h2>11. Changes to Terms</h2>
            <p>We may modify these terms with 30 days notice. Continued use constitutes acceptance of new terms.</p>

            <h2>12. Contact Information</h2>
            <p><strong>Email:</strong> legal@veridiff.com</p>
            <p><strong>Support:</strong> support@veridiff.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
