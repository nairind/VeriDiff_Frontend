import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function GDPR() {
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
        <title>GDPR Compliance - VeriDiff</title>
        <meta name="description" content="VeriDiff GDPR Compliance - Your rights under the General Data Protection Regulation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
          .header { background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 1000; }
          .nav-container { display: flex; justify-content: space-between; align-items: center; height: 64px; }
          .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; }
          .desktop-nav { display: flex; gap: 2rem; align-items: center; }
          .mobile-nav-button { display: none; background: none; border: none; cursor: pointer; padding: 8px; color: #374151; }
          .content { padding: 3rem 0; }
          .content h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; }
          .content h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem 0; color: #1f2937; }
          .content p { margin-bottom: 1rem; color: #4b5563; }
          .content ul { margin: 1rem 0; padding-left: 2rem; }
          .content li { margin-bottom: 0.5rem; color: #4b5563; }
          .last-updated { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
          .contact-form { background: #f8fafc; padding: 2rem; border-radius: 0.5rem; margin: 2rem 0; }
          .contact-form h3 { margin-bottom: 1rem; color: #1f2937; }
          .contact-form p { margin-bottom: 0.5rem; }
          
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-nav-button { display: block !important; }
          }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <header className="header">
          <div className="container">
            <div className="nav-container">
              <div className="logo" onClick={handleHome}>VeriDiff</div>
              
              <nav className="desktop-nav">
                <button onClick={() => scrollToSection('features')} style={{ 
                  background: 'none', border: 'none', color: '#374151', fontWeight: '500', 
                  cursor: 'pointer', padding: '0.5rem', textDecoration: 'none' 
                }}>
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} style={{ 
                  background: 'none', border: 'none', color: '#374151', fontWeight: '500', 
                  cursor: 'pointer', padding: '0.5rem', textDecoration: 'none' 
                }}>
                  Pricing
                </button>
                <Link href="/faq" style={{ 
                  textDecoration: 'none', color: '#374151', fontWeight: '500', padding: '0.5rem' 
                }}>
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
                  <button onClick={() => scrollToSection('features')} style={{ 
                    background: 'none', border: 'none', color: '#374151', fontWeight: '500', 
                    cursor: 'pointer', padding: '0.5rem', textAlign: 'left' 
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    background: 'none', border: 'none', color: '#374151', fontWeight: '500', 
                    cursor: 'pointer', padding: '0.5rem', textAlign: 'left' 
                  }}>
                    Pricing
                  </button>
                  <Link href="/faq" style={{ 
                    textDecoration: 'none', color: '#374151', fontWeight: '500', 
                    padding: '0.5rem', textAlign: 'left' 
                  }}>
                    FAQ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="content">
          <div className="container">
            <div className="last-updated">
              <strong>Last updated:</strong> January 2025
            </div>

            <h1>GDPR Compliance</h1>

            <h2>1. Our Commitment to GDPR</h2>
            <p>VeriDiff is fully committed to compliance with the General Data Protection Regulation (GDPR). This page explains your rights and how we protect your personal data.</p>

            <h2>2. Lawful Basis for Processing</h2>
            <ul>
              <li><strong>Legitimate Interest:</strong> File comparison service delivery</li>
              <li><strong>Contract:</strong> Account management and billing</li>
              <li><strong>Consent:</strong> Marketing communications and analytics</li>
              <li><strong>Legal Obligation:</strong> Tax records and financial reporting</li>
            </ul>

            <h2>3. Data Processing Purposes</h2>
            <p>We process personal data for:</p>
            <ul>
              <li>Providing file comparison services</li>
              <li>User account management</li>
              <li>Payment processing and billing</li>
              <li>Customer support and communication</li>
              <li>Service improvement and analytics</li>
              <li>Legal compliance and fraud prevention</li>
            </ul>

            <h2>4. Your Rights Under GDPR</h2>

            <h2>4.1 Right of Access (Article 15)</h2>
            <p>You have the right to obtain confirmation that we are processing your personal data and access to that data.</p>

            <h2>4.2 Right to Rectification (Article 16)</h2>
            <p>You have the right to have inaccurate personal data corrected or completed if incomplete.</p>

            <h2>4.3 Right to Erasure (Article 17)</h2>
            <p>You have the right to have your personal data deleted in certain circumstances, including:</p>
            <ul>
              <li>Personal data is no longer necessary</li>
              <li>You withdraw consent</li>
              <li>Personal data has been unlawfully processed</li>
            </ul>

            <h2>4.4 Right to Restrict Processing (Article 18)</h2>
            <p>You have the right to restrict processing of your personal data in specific situations.</p>

            <h2>4.5 Right to Data Portability (Article 20)</h2>
            <p>You have the right to receive your personal data in a structured, commonly used format and transmit it to another controller.</p>

            <h2>4.6 Right to Object (Article 21)</h2>
            <p>You have the right to object to processing based on legitimate interests or for direct marketing purposes.</p>

            <h2>5. Data Retention Periods</h2>
            <ul>
              <li><strong>File data:</strong> Never stored (processed client-side only)</li>
              <li><strong>Account data:</strong> Retained until account deletion</li>
              <li><strong>Payment records:</strong> 7 years (legal requirement)</li>
              <li><strong>Support communications:</strong> 3 years</li>
              <li><strong>Usage analytics:</strong> 24 months</li>
              <li><strong>Marketing data:</strong> Until consent withdrawal</li>
            </ul>

            <h2>6. Data Transfers</h2>
            <p>VeriDiff processes data primarily within the EU/UK. Any transfers to third countries are protected by:</p>
            <ul>
              <li>Adequacy decisions (where applicable)</li>
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Appropriate safeguards and security measures</li>
            </ul>

            <h2>7. Privacy by Design</h2>
            <p>VeriDiff implements privacy by design principles:</p>
            <ul>
              <li><strong>Data minimization:</strong> We collect only necessary data</li>
              <li><strong>Client-side processing:</strong> Files never leave your device</li>
              <li><strong>Transparent processing:</strong> Clear policies and notices</li>
              <li><strong>Security by default:</strong> HTTPS, encryption, secure payments</li>
            </ul>

            <h2>8. Exercising Your Rights</h2>
            <div className="contact-form">
              <h3>Contact Our Data Protection Officer</h3>
              <p><strong>Email:</strong> dpo@veridiff.com</p>
              <p><strong>Subject Line:</strong> GDPR Rights Request</p>
              <p><strong>Response Time:</strong> Within 30 days</p>
              <p><strong>Required Information:</strong></p>
              <ul>
                <li>Your full name and email address</li>
                <li>Specific right you wish to exercise</li>
                <li>Account information (if applicable)</li>
                <li>Proof of identity (for security)</li>
              </ul>
            </div>

            <h2>9. Complaints and Supervisory Authority</h2>
            <p>If you believe we have not complied with GDPR, you have the right to lodge a complaint with:</p>
            <ul>
              <li><strong>UK:</strong> Information Commissioner's Office (ICO)</li>
              <li><strong>EU:</strong> Your local data protection authority</li>
              <li><strong>First:</strong> We encourage contacting us directly to resolve issues</li>
            </ul>

            <h2>10. Children's Privacy</h2>
            <p>VeriDiff does not knowingly collect personal data from children under 16. If we become aware of such collection, we will delete the data immediately.</p>

            <h2>11. Automated Decision Making</h2>
            <p>VeriDiff does not use automated decision-making or profiling that produces legal or significant effects.</p>

            <h2>12. Security Measures</h2>
            <p>We implement appropriate technical and organizational measures:</p>
            <ul>
              <li>Encryption in transit and at rest</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and updates</li>
              <li>Staff training on data protection</li>
              <li>Incident response procedures</li>
            </ul>

            <h2>13. Contact Information</h2>
            <p><strong>Data Controller:</strong> VeriDiff Ltd</p>
            <p><strong>Data Protection Officer:</strong> dpo@veridiff.com</p>
            <p><strong>General Privacy:</strong> privacy@veridiff.com</p>
            <p><strong>Legal:</strong> legal@veridiff.com</p>

            <h2>14. Updates to This Information</h2>
            <p>We will update this GDPR compliance information as needed and notify you of significant changes affecting your rights.</p>
          </div>
        </div>
      </div>
    </>
  );
}
