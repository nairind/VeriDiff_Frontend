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
                display: 'flex',
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
            </div>
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
            Terms of Service
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            1. Service Description
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff provides a file comparison platform supporting Excel, CSV, PDF, JSON, XML, and TXT formats with intelligent field mapping and tolerance settings.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            2. Acceptance of Terms
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            By accessing or using VeriDiff, you agree to be bound by these Terms of Service and our Privacy Policy.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            3. User Responsibilities
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            You agree to:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Use the service for legitimate business purposes only</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Not upload malicious, illegal, or copyrighted files</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Respect file size limits and usage quotas</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Maintain the security of your account credentials</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Comply with all applicable laws and regulations</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            4. Service Limitations
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Uptime Target:</strong> 99% availability (not guaranteed)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>File Processing:</strong> Subject to browser memory limitations
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Usage Limits:</strong> As defined in your chosen pricing tier
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Feature Availability:</strong> Subject to browser compatibility
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
            5. Payment Terms
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Billing:</strong> Monthly or annual as selected
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Payment Processing:</strong> Via Stripe payment processor
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Refunds:</strong> 30-day money-back guarantee
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Cancellation:</strong> 30-day grace period after cancellation
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Price Changes:</strong> 30-day advance notice required
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
            6. Intellectual Property
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Your Files:</strong> You retain all rights to files you process
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>VeriDiff Platform:</strong> We retain all rights to our software and technology
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Trademarks:</strong> VeriDiff and related marks are our property
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
            7. Data and Privacy
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>File processing occurs entirely in your browser</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We do not store or access your file contents</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account and usage data is handled per our Privacy Policy</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You are responsible for backing up your own data</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            8. Limitation of Liability
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>VeriDiff is provided "AS IS" without warranties</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We are not liable for data loss or business interruption</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Total liability is limited to fees paid in the last 12 months</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We are not responsible for file comparison accuracy</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            9. Termination
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            Either party may terminate this agreement:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You may cancel your account at any time</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>We may suspend accounts for Terms violations</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Paid subscriptions continue until the end of the billing period</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Account data may be deleted 90 days after termination</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            10. Dispute Resolution
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>First Contact:</strong> Email support@veridiff.com
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Mediation:</strong> Good faith mediation before legal action
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Governing Law:</strong> Laws of England and Wales
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Jurisdiction:</strong> Courts of England and Wales
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
            11. Changes to Terms
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            We may modify these terms with 30 days notice. Continued use constitutes acceptance of new terms.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            12. Contact Information
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Email:</strong> legal@veridiff.com
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Support:</strong> support@veridiff.com
          </p>
        </div>
      </div>
    </>
  );
}
