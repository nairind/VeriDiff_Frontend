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
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        background: '#f9fafb'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            maxWidth: '1000px',
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
                display: mobileMenuOpen ? 'none' : 'flex',
                gap: '2rem',
                alignItems: 'center'
              }}>
                <button 
                  onClick={() => scrollToSection('features')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  Pricing
                </button>
                <Link 
                  href="/faq"
                  style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    padding: '0.5rem'
                  }}
                >
                  FAQ
                </Link>
              </nav>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#374151'
                }}
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
                  <button 
                    onClick={() => scrollToSection('features')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      textAlign: 'left'
                    }}
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      textAlign: 'left'
                    }}
                  >
                    Pricing
                  </button>
                  <Link 
                    href="/faq"
                    style={{
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      padding: '0.5rem',
                      textAlign: 'left'
                    }}
                  >
                    FAQ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          background: 'white',
          margin: '2rem auto',
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
            Privacy Policy
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            1. Introduction
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our file comparison service.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            2. Data Processing Philosophy
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff is designed with privacy-by-design principles:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Client-side processing:</strong> All file comparisons happen in your browser
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>No server uploads:</strong> Your files never leave your device
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>No data storage:</strong> We don't store your files or comparison results
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Session-only:</strong> Data is cleared when you close your browser
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
            3. Information We Collect
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Personal Information:</strong>
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Email address (for account creation and communication)</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Payment information (processed securely through Stripe)</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Usage analytics (file comparison counts, feature usage)</li>
          </ul>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>File Data:</strong>
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We do NOT collect, store, or access your file contents</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>File processing occurs entirely within your browser</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>No file data is transmitted to our servers</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            4. How We Use Your Information
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account management and authentication</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Payment processing and billing</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Service improvement and analytics</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Customer support and communication</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Legal compliance and fraud prevention</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            5. Data Sharing
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            We do not sell, trade, or rent your personal information. We may share data only with:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Stripe:</strong> For payment processing
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Google Analytics:</strong> For usage analytics (optional)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Legal authorities:</strong> When required by law
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
            6. Your Rights (GDPR Compliance)
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            Under GDPR, you have the right to:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Access:</strong> Request copies of your personal data
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Rectification:</strong> Correct inaccurate personal data
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Erasure:</strong> Request deletion of your personal data
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Portability:</strong> Transfer your data to another service
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Objection:</strong> Object to processing of your personal data
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
            7. Data Retention
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>File data:</strong> Never stored (processed client-side only)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Account data:</strong> Retained until account deletion
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Payment records:</strong> Retained for 7 years (legal requirement)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Usage analytics:</strong> Retained for 24 months
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
            8. Security
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            We implement appropriate security measures including:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>HTTPS encryption for all communications</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Secure payment processing through Stripe</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Client-side processing to minimize data exposure</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Regular security audits and updates</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            9. Contact Information
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            For privacy-related questions or to exercise your rights, contact us at:
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Email:</strong> privacy@veridiff.com
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Data Protection Officer:</strong> dpo@veridiff.com
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            10. Changes to This Policy
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            We may update this Privacy Policy occasionally. We will notify users of significant changes via email or through our service.
          </p>
        </div>
      </div>
    </>
  );
}
