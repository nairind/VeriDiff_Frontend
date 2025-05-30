import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Cookies() {
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
        <title>Cookie Policy - VeriDiff</title>
        <meta name="description" content="VeriDiff Cookie Policy - How we use cookies and tracking technologies." />
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
            Cookie Policy
          </h1>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            1. What Are Cookies
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your experience.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            2. How We Use Cookies
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            VeriDiff uses cookies for essential functionality and optional analytics. We respect your privacy and provide opt-out options for non-essential cookies.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            3. Types of Cookies We Use
          </h2>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '1rem 0',
            background: 'white',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                  background: '#f8fafc',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>Cookie Type</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                  background: '#f8fafc',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>Purpose</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                  background: '#f8fafc',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>Required</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  textAlign: 'left',
                  background: '#f8fafc',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Essential</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Authentication, security, preferences</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Yes</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Session/1 year</td>
              </tr>
              <tr>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Analytics</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Usage tracking (Google Analytics)</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>No</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>2 years</td>
              </tr>
              <tr>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Marketing</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>Conversion tracking (Google Ads)</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>No</td>
                <td style={{
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  color: '#4b5563'
                }}>90 days</td>
              </tr>
            </tbody>
          </table>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            4. Essential Cookies
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            These cookies are necessary for the website to function:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Authentication:</strong> Keep you logged in
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Security:</strong> Prevent cross-site request forgery
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Preferences:</strong> Remember your settings
            </li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>
              <strong style={{ color: '#1f2937' }}>Session:</strong> Maintain your session state
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
            5. Analytics Cookies (Optional)
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            We use Google Analytics to understand how users interact with VeriDiff:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Page views and user journeys</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Feature usage and performance</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Error tracking and debugging</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Demographic insights (anonymized)</li>
          </ul>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Opt-out:</strong> You can disable analytics cookies in your browser settings or through our cookie consent banner.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            6. Marketing Cookies (Optional)
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            If you arrived via Google Ads, we may use conversion tracking cookies to:
          </p>
          <ul style={{
            margin: '1rem 0',
            paddingLeft: '2rem'
          }}>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Measure ad campaign effectiveness</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Optimize marketing spend</li>
            <li style={{ marginBottom: '0.5rem', color: '#4b5563' }}>Provide relevant advertisements</li>
          </ul>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#1f2937' }}>Opt-out:</strong> You can disable marketing cookies through our consent banner or browser settings.
          </p>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '2rem 0 1rem 0',
            color: '#1f2937',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            7. Contact Information
          </h2>
          <p style={{
            marginBottom: '1rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            For questions about our cookie usage:
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
            <strong style={{ color: '#1f2937' }}>Data Protection:</strong> dpo@veridiff.com
          </p>
        </div>
      </div>
    </>
  );
}
