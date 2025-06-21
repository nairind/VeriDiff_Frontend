import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function About() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('veridiff_token');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('veridiff_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignUp = () => {
    window.location.href = '/api/auth/signup';
  };

  return (
    <>
      <Head>
        <title>About VeriDiff - Privacy-First File Comparison for Professionals</title>
        <meta name="description" content="Learn about VeriDiff's mission to provide secure, browser-based file comparison tools for business professionals. No AI, no uploads, complete privacy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937'
      }}>
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Security Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🔒 Enterprise-Grade Privacy: All file processing happens in your browser. We never see, store, or access your data.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              About VeriDiff
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              We're building the future of file comparison for business professionals who need precision, 
              privacy, and performance in their data analysis workflows.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Our Mission
            </h2>
            
            <div style={{
              background: '#f8fafc',
              padding: '2.5rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}>🎯</div>
              </div>
              
              <p style={{
                fontSize: '1.2rem',
                color: '#4b5563',
                lineHeight: '1.7',
                textAlign: 'center',
                margin: '0'
              }}>
                <strong style={{ color: '#1f2937' }}>To revolutionize how professionals compare files</strong> by providing 
                enterprise-grade comparison tools that respect your privacy, work entirely in your browser, 
                and deliver the precision you need for critical business decisions.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Privacy First
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6', margin: '0' }}>
                  Your files never leave your browser. No uploads, no cloud processing, no AI analysis of your sensitive data.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Professional Grade
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6', margin: '0' }}>
                  Smart mapping, tolerance settings, and advanced comparison algorithms built for business workflows.
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Globally Accessible
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6', margin: '0' }}>
                  Works anywhere with an internet connection. No software installation, no regional restrictions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Actually Do */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              What VeriDiff Actually Does
            </h2>
            
            <div style={{
              background: '#eff6ff',
              padding: '2rem',
              borderRadius: '1rem',
              border: '2px solid #3b82f6',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                📊 Precise File Comparison (Not AI Analysis)
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#1e40af',
                lineHeight: '1.6',
                textAlign: 'center',
                margin: '0'
              }}>
                VeriDiff compares your files cell-by-cell, word-by-word, or line-by-line to show exactly what changed. 
                <strong> We don't use AI to "analyze" your content</strong> - we use advanced algorithms to detect differences.
              </p>
            </div>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Supported File Comparisons
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>Excel ↔ Excel</strong>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Smart header mapping, tolerance settings
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>Excel ↔ CSV</strong>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Cross-format comparison
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>CSV ↔ CSV</strong>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Data validation workflows
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>PDF ↔ PDF</strong>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Document version control
                </p>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>Word ↔ Word</strong>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                  Contract and document analysis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Use Cases */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Real-World Use Cases
            </h2>

            <div style={{
              display: 'grid',
              gap: '2rem'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💼 Finance & Accounting
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li>Compare monthly financial reports to identify variances</li>
                  <li>Validate budget vs. actual spending spreadsheets</li>
                  <li>Audit trail documentation for compliance</li>
                  <li>Bank reconciliation and transaction matching</li>
                </ul>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📊 Data Analysis & Research
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li>Compare survey results across different time periods</li>
                  <li>Validate data exports from different systems</li>
                  <li>Quality assurance for research datasets</li>
                  <li>Before/after analysis for A/B testing</li>
                </ul>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚖️ Legal & Compliance
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li>Contract version comparison and change tracking</li>
                  <li>Document review and redline analysis</li>
                  <li>Compliance report validation</li>
                  <li>Policy document updates and change management</li>
                </ul>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🏢 Operations & Project Management
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li>Inventory reconciliation and stock audits</li>
                  <li>Project timeline and milestone tracking</li>
                  <li>Vendor list updates and procurement changes</li>
                  <li>Employee data validation and HR reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937'
            }}>
              Built by Professionals, for Professionals
            </h2>
            
            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>🇬🇧</div>
              </div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                Qubit HCM Ltd - London, UK
              </h3>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                We're a London-based technology company with deep experience in enterprise software, 
                data analysis, and privacy compliance. Our team understands the daily challenges 
                faced by professionals who work with sensitive business data.
              </p>

              <p style={{
                fontSize: '1rem',
                color: '#4b5563',
                lineHeight: '1.6',
                margin: '0'
              }}>
                <strong style={{ color: '#1f2937' }}>Why we built VeriDiff:</strong> After years of watching colleagues 
                struggle with clunky comparison tools that required uploading sensitive files to unknown servers, 
                we knew there had to be a better way. VeriDiff is our answer to that problem.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937'
            }}>
              Get in Touch
            </h2>
            
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Have questions about VeriDiff or want to share feedback about your experience? 
                We'd love to hear from you.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <strong style={{ color: '#1f2937' }}>General Inquiries</strong><br/>
                  <a href="mailto:sales@veridiff.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    sales@veridiff.com
                  </a>
                </div>
                <div>
                  <strong style={{ color: '#1f2937' }}>Sales & Partnerships</strong><br/>
                  <a href="mailto:sales@veridiff.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    sales@veridiff.com
                  </a>
                </div>
              </div>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                margin: '0'
              }}>
                <strong>Company:</strong> Qubit HCM Ltd, London, United Kingdom<br/>
                <strong>Registration:</strong> 13597650 | <strong>VAT:</strong> GB389489219
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
