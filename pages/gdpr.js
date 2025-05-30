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
            GDPR Compliance
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            1. Our Commitment to GDPR
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff is fully committed to compliance with the General Data Protection Regulation (GDPR). This page explains your rights and how we protect your personal data.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            2. Lawful Basis for Processing
          </h2>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Legitimate Interest:</strong> File comparison service delivery
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Contract:</strong> Account management and billing
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Consent:</strong> Marketing communications and analytics
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Legal Obligation:</strong> Tax records and financial reporting
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
            3. Your Rights Under GDPR
          </h2>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '1.5rem 0 0.5rem 0',
            color: '#1f2937'
          }}>
            3.1 Right of Access (Article 15)
          </h3>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            You have the right to obtain confirmation that we are processing your personal data and access to that data.
          </p>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '1.5rem 0 0.5rem 0',
            color: '#1f2937'
          }}>
            3.2 Right to Rectification (Article 16)
          </h3>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            You have the right to have inaccurate personal data corrected or completed if incomplete.
          </p>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: '1.5rem 0 0.5rem 0',
            color: '#1f2937'
          }}>
            3.3 Right to Erasure (Article 17)
          </h3>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            You have the right to have your personal data deleted in certain circumstances, including:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Personal data is no longer necessary</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>You withdraw consent</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Personal data has been unlawfully processed</li>
          </ul>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            4. Data Retention Periods
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
              <strong style={{ color: '#1f2937' }}>Payment records:</strong> 7 years (legal requirement)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Support communications:</strong> 3 years
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Usage analytics:</strong> 24 months
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Marketing data:</strong> Until consent withdrawal
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
            5. Privacy by Design
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff implements privacy by design principles:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Data minimization:</strong> We collect only necessary data
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Client-side processing:</strong> Files never leave your device
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Transparent processing:</strong> Clear policies and notices
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Security by default:</strong> HTTPS, encryption, secure payments
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
            6. Exercising Your Rights
          </h2>
          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '0.5rem',
            margin: '2rem 0',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              marginBottom: '1rem',
              color: '#1f2937',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Contact Our Data Protection Officer
            </h3>
            <p style={{
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              <strong style={{ color: '#1f2937' }}>Email:</strong> dpo@veridiff.com
            </p>
            <p style={{
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              <strong style={{ color: '#1f2937' }}>Subject Line:</strong> GDPR Rights Request
            </p>
            <p style={{
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              <strong style={{ color: '#1f2937' }}>Response Time:</strong> Within 30 days
            </p>
            <p style={{
              marginBottom: '0.5rem',
              color: '#4b5563'
            }}>
              <strong style={{ color: '#1f2937' }}>Required Information:</strong>
            </p>
            <ul style={{
              margin: '0.5rem 0',
              paddingLeft: '2rem'
            }}>
              <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Your full name and email address</li>
              <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Specific right you wish to exercise</li>
              <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Account information (if applicable)</li>
              <li style={{ marginBottom: '0.25rem', color: '#4b5563' }}>Proof of identity (for security)</li>
            </ul>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            7. Complaints and Supervisory Authority
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            If you believe we have not complied with GDPR, you have the right to lodge a complaint with:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>UK:</strong> Information Commissioner's Office (ICO)
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>EU:</strong> Your local data protection authority
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>First:</strong> We encourage contacting us directly to resolve issues
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
            8. Contact Information
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Data Controller:</strong> VeriDiff Ltd
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Data Protection Officer:</strong> dpo@veridiff.com
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>General Privacy:</strong> privacy@veridiff.com
          </p>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Legal:</strong> legal@veridiff.com
          </p>
        </div>
      </div>
    </>
  );
}
