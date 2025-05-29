import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState('excel-csv');

  const handleTryDemo = () => {
    router.push('/compare');
  };

  const handleSignIn = () => {
    alert('Sign in functionality coming soon!');
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click Try Live Demo above to test VeriDiff now.');
  };

  const handleProTrial = () => {
    alert('Pro trial signup coming soon! Click Try Free Demo to test VeriDiff now.');
  };

  const handleContactSales = () => {
    alert('Enterprise contact form coming soon! Email us at hello@veridiff.com');
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Smart File Comparison Tool</title>
        <meta name="description" content="Compare Excel, CSV, PDF, JSON, XML files with smart mapping and tolerance settings. Built for business professionals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
        {/* Header */}
        <header style={{ 
          background: 'white', 
          borderBottom: '1px solid #e5e7eb', 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000 
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '0 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '64px' 
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              VeriDiff
            </div>
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <a href="#features" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Features</a>
              <a href="#pricing" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Pricing</a>
              <a href="#faq" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>FAQ</a>
              <button 
                onClick={handleSignIn}
                style={{ 
                  background: 'transparent', 
                  color: '#374151', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  fontWeight: '500' 
                }}
              >
                Sign In
              </button>
              <button 
                onClick={handleTryDemo}
                style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  cursor: 'pointer', 
                  fontWeight: '500' 
                }}
              >
                Try Free Demo
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ 
          background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)', 
          padding: '5rem 0', 
          textAlign: 'center' 
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#dbeafe', 
              color: '#1e40af', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '2rem', 
              gap: '0.5rem' 
            }}>
              ⚡ Precision-Engineered in London for Global Professionals
            </div>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              lineHeight: '1.2',
              color: '#1f2937'
            }}>
              What Excel Comparison
              <span style={{ 
                display: 'block',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Should Have Been
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '2rem', 
              maxWidth: '48rem', 
              marginLeft: 'auto', 
              marginRight: 'auto' 
            }}>
              British-engineered smart mapping + tolerance settings for business data that is never perfect. 
              Built in London fintech district for consultants, analysts, and finance teams worldwide.
            </p>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              marginBottom: '3rem' 
            }}>
              <button 
                onClick={handleTryDemo}
                style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  padding: '1rem 2rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '1.125rem', 
                  fontWeight: '500', 
                  cursor: 'pointer' 
                }}
              >
                ▶ Try Live Demo - Free
              </button>
              <button 
                onClick={handleWatchVideo}
                style={{ 
                  background: 'white', 
                  color: '#374151', 
                  border: '1px solid #d1d5db', 
                  padding: '1rem 2rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '1.125rem', 
                  fontWeight: '500', 
                  cursor: 'pointer' 
                }}
              >
                Watch 2-Min Video
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem', 
              maxWidth: '64rem', 
              margin: '0 auto' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151' 
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Smart mapping when columns don't match</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151' 
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Tolerance settings for financial data</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                color: '#374151' 
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>Built for business users, not developers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="features" style={{ padding: '5rem 0', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>See the Difference in Action</h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Compare real business data scenarios that other tools cannot handle</p>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '1rem', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                  onClick={() => setSelectedDemo('excel-csv')}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    border: 'none',
                    background: selectedDemo === 'excel-csv' ? '#2563eb' : 'white',
                    color: selectedDemo === 'excel-csv' ? 'white' : '#374151'
                  }}
                >
                  Excel ↔ CSV
                </button>
                <button
                  onClick={() => setSelectedDemo('tolerance')}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    border: 'none',
                    background: selectedDemo === 'tolerance' ? '#2563eb' : 'white',
                    color: selectedDemo === 'tolerance' ? 'white' : '#374151'
                  }}
                >
                  Tolerance Matching
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '2rem', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e5e7eb' 
                }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>File 1: client_data.xlsx</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#ecfdf5', color: '#065f46' }}>Customer Name</div>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#ecfdf5', color: '#065f46' }}>Total Amount</div>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#ecfdf5', color: '#065f46' }}>Invoice Date</div>
                  </div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e5e7eb' 
                }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>File 2: export_data.csv</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#eff6ff', color: '#1e40af' }}>customer</div>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#eff6ff', color: '#1e40af' }}>amount</div>
                    <div style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', background: '#eff6ff', color: '#1e40af' }}>date</div>
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#dcfce7', 
                color: '#166534', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                textAlign: 'center' 
              }}>
                <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>✨ VeriDiff Result: 3 matches found with smart mapping + 2 tolerance matches</p>
                <small style={{ fontSize: '0.875rem', color: '#15803d' }}>Smart mapping handles mismatched column names automatically</small>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '5rem 0', background: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>Simple, Transparent Pricing</h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Start free, upgrade when you need more</p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem', 
              maxWidth: '80rem', 
              margin: '0 auto' 
            }}>
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #e5e7eb' 
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>Starter</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Perfect for trying VeriDiff</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>£0</span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>5 comparisons per month</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Files up to 5MB</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>All comparison formats</span>
                  </li>
                </ul>
                <button 
                  onClick={handleTryDemo}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    border: 'none',
                    background: '#f3f4f6',
                    color: '#111827'
                  }}
                >
                  Start Free
                </button>
              </div>

              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #2563eb',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Most Popular
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>Professional</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>For growing businesses</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>£19</span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Unlimited comparisons</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Files up to 50MB</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Advanced tolerance settings</span>
                  </li>
                </ul>
                <button 
                  onClick={handleProTrial}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    border: 'none',
                    background: '#2563eb',
                    color: 'white'
                  }}
                >
                  Start Pro Trial
                </button>
              </div>

              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                border: '2px solid #e5e7eb' 
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>Business</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>For teams and organizations</p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827' }}>£79</span>
                  <span style={{ color: '#6b7280' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Everything in Pro</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Unlimited file size</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <button 
                  onClick={handleContactSales}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    fontWeight: '500', 
                    cursor: 'pointer', 
                    border: 'none',
                    background: '#111827',
                    color: 'white'
                  }}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '5rem 0', 
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
          color: 'white', 
          textAlign: 'center' 
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem' }}>Ready to Stop Wrestling with Data?</h2>
            <p style={{ fontSize: '1.25rem', color: '#bfdbfe', marginBottom: '2rem' }}>
              Join forward-thinking professionals using business-intelligent data reconciliation
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              justifyContent: 'center', 
              marginBottom: '2rem' 
            }}>
              <button 
                onClick={handleTryDemo}
                style={{ 
                  background: 'white', 
                  color: '#2563eb', 
                  padding: '1rem 2rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                ▶ Start Free Demo
              </button>
              <button 
                onClick={handleProTrial}
                style={{ 
                  background: '#1e40af', 
                  color: 'white', 
                  padding: '1rem 2rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '500', 
                  border: '1px solid #3b82f6', 
                  cursor: 'pointer' 
                }}
              >
                Start Pro Trial - £19/month
              </button>
            </div>
            
            <p style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>
              ✓ No credit card required for demo • ✓ 30-day money-back guarantee • ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#111827', color: 'white', padding: '3rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '2rem', 
              marginBottom: '2rem' 
            }}>
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
                  Precision-engineered in London for global business professionals.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Product</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#features" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Features</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Support</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Help Center</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Contact Us</a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Legal</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Terms of Service</a>
                  </li>
                </ul>
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
      </div>
    </>
  );
}
