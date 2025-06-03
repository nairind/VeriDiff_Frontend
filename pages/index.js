import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation handlers
  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Head>
        <title>VeriDiff - Professional File Comparison Tools</title>
        <meta name="description" content="Professional file comparison tools for business spreadsheets, PDF documents, and technical files. Excel comparison free forever!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            {/* Desktop Navigation */}
            <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '1.5rem' }}>
              <button 
                onClick={() => scrollToSection('tools')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Tools
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer'
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
                  cursor: 'pointer'
                }}
              >
                Pricing
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: window.innerWidth <= 768 ? 'block' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem'
              }}
            >
              ☰
            </button>
            
            {/* User Menu */}
            {session ? (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '0.25rem'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    marginTop: '0.5rem',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '0.5rem' }}>
                      <button onClick={handleSignOut} style={{ 
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        borderRadius: '0.25rem'
                      }}>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSignIn} style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Sign In
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 20px'
          }}>
            <button onClick={() => scrollToSection('tools')} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#374151',
              fontWeight: '500'
            }}>
              Tools
            </button>
            <button onClick={() => scrollToSection('features')} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#374151',
              fontWeight: '500'
            }}>
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              color: '#374151',
              fontWeight: '500'
            }}>
              Pricing
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #dc2626 100%)',
          color: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              margin: '0 0 20px 0',
              lineHeight: '1.1'
            }}>
              Professional File Comparison
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              opacity: '0.9',
              maxWidth: '800px',
              margin: '0 auto 40px auto',
              lineHeight: '1.5'
            }}>
              Choose the right tool for your comparison needs. From business spreadsheets to 
              technical documents, we have specialized solutions for every use case.
            </p>
          </div>
        </section>

        {/* Three-Path Tool Selection */}
        <section id="tools" style={{
          padding: '80px 20px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 20px 0'
            }}>
              🎯 Choose Your Comparison Tool
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Each tool is specialized for specific file types and use cases
            </p>
          </div>

          {/* Three-Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
            alignItems: 'stretch'
          }}>
            
            {/* Business Spreadsheets Column */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '3px solid #22c55e',
              textAlign: 'center',
              position: 'relative',
              transition: 'transform 0.3s ease'
            }}>
              {/* FREE Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#22c55e',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                EXCEL FREE FOREVER
              </div>

              <div style={{
                fontSize: '4rem',
                margin: '20px 0'
              }}>📊</div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Business Spreadsheets
              </h3>
              
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: '0 0 25px 0',
                lineHeight: '1.5'
              }}>
                Excel & CSV Files
              </p>

              {/* Features */}
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                  Smart header mapping
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                  Financial tolerance
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                  Sheet selection
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                  Excel FREE forever
                </div>
              </div>

              {/* Perfect For */}
              <div style={{
                background: '#f0fdf4',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#166534',
                  margin: '0 0 8px 0'
                }}>
                  Perfect for:
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: '1.4' }}>
                  • Accountants & Finance<br/>
                  • Data analysts<br/>
                  • Business reconciliation
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/compare" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'transform 0.2s ease'
                }}>
                  → Compare Spreadsheets
                </button>
              </Link>
            </div>

            {/* PDF Documents Column */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '3px solid #dc2626',
              textAlign: 'center',
              position: 'relative',
              transition: 'transform 0.3s ease'
            }}>
              {/* PREMIUM Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#dc2626',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                PREMIUM
              </div>

              <div style={{
                fontSize: '4rem',
                margin: '20px 0'
              }}>📄</div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                PDF Documents
              </h3>
              
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: '0 0 25px 0',
                lineHeight: '1.5'
              }}>
                All PDF Comparisons
              </p>

              {/* Features */}
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>✓</span>
                  Text extraction
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>✓</span>
                  Page-by-page view
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>✓</span>
                  Visual comparison
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>✓</span>
                  Universal format
                </div>
              </div>

              {/* Perfect For */}
              <div style={{
                background: '#fef2f2',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  margin: '0 0 8px 0'
                }}>
                  Perfect for:
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', lineHeight: '1.4' }}>
                  • Contract reviews<br/>
                  • Legal comparisons<br/>
                  • Academic papers
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/compare/pdf" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'transform 0.2s ease'
                }}>
                  → Compare PDFs
                </button>
              </Link>
            </div>

            {/* Technical Files Column */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '3px solid #7c3aed',
              textAlign: 'center',
              position: 'relative',
              transition: 'transform 0.3s ease'
            }}>
              {/* MIXED Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#7c3aed',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                TEXT FREE
              </div>

              <div style={{
                fontSize: '4rem',
                margin: '20px 0'
              }}>⚙️</div>
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 15px 0'
              }}>
                Technical Files
              </h3>
              
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: '0 0 25px 0',
                lineHeight: '1.5'
              }}>
                Text, JSON, XML Files
              </p>

              {/* Features */}
              <div style={{
                textAlign: 'left',
                marginBottom: '30px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>
                  Format validation
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>
                  Syntax checking
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>
                  Structure analysis
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✓</span>
                  Text files FREE
                </div>
              </div>

              {/* Perfect For */}
              <div style={{
                background: '#f5f3ff',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'left'
              }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#7c3aed',
                  margin: '0 0 8px 0'
                }}>
                  Perfect for:
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#7c3aed', lineHeight: '1.4' }}>
                  • Developers<br/>
                  • Technical writers<br/>
                  • Config validation
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/compare/documents" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'transform 0.2s ease'
                }}>
                  → Compare Code & Data
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{
          background: 'white',
          padding: '80px 20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              Why Choose VeriDiff?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto 60px auto'
            }}>
              Professional-grade comparison tools designed for different file types and use cases
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              {/* Feature 1 */}
              <div style={{
                textAlign: 'center',
                padding: '30px 20px'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px'
                }}>⚡</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 15px 0'
                }}>
                  Lightning Fast
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  Optimized algorithms process your files in seconds, not minutes
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{
                textAlign: 'center',
                padding: '30px 20px'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px'
                }}>🔒</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 15px 0'
                }}>
                  Secure & Private
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  Your files are processed securely and never stored on our servers
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{
                textAlign: 'center',
                padding: '30px 20px'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px'
                }}>🎯</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 15px 0'
                }}>
                  Format Specific
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  Specialized tools designed for each file type's unique requirements
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{
          background: '#f8fafc',
          padding: '80px 20px'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 20px 0'
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto 60px auto'
            }}>
              Start free with Excel comparison, upgrade when you need more
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {/* Free Plan */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px 30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid #22c55e'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 10px 0'
                }}>
                  Free Forever
                </h3>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#22c55e',
                  margin: '0 0 20px 0'
                }}>
                  $0
                </div>
                <ul style={{
                  textAlign: 'left',
                  margin: '0 0 30px 0',
                  padding: '0',
                  listStyle: 'none'
                }}>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                    Unlimited Excel comparisons
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                    Text file comparisons
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                    Header mapping
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                    Basic support
                  </li>
                </ul>
                <button style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  Get Started Free
                </button>
              </div>

              {/* Premium Plan */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px 30px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                border: '2px solid #2563eb',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#2563eb',
                  color: 'white',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  MOST POPULAR
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 10px 0'
                }}>
                  Premium
                </h3>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#2563eb',
                  margin: '0 0 20px 0'
                }}>
                  $9<span style={{ fontSize: '1rem', color: '#6b7280' }}>/month</span>
                </div>
                <ul style={{
                  textAlign: 'left',
                  margin: '0 0 30px 0',
                  padding: '0',
                  listStyle: 'none'
                }}>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓</span>
                    Everything in Free
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓</span>
                    PDF comparisons
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓</span>
                    JSON & XML comparisons
                  </li>
                  <li style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '10px',
                    color: '#374151'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓</span>
                    Priority support
                  </li>
                </ul>
                <button style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#1f2937',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            VeriDiff
          </div>
          <p style={{
            color: '#9ca3af',
            margin: '0 0 20px 0'
          }}>
            Professional file comparison tools for every use case
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <Link href="/compare" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Spreadsheets
            </Link>
            <Link href="/compare/pdf" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              PDFs
            </Link>
            <Link href="/compare/documents" style={{ color: '#9ca3af', textDecoration: 'none' }}>
              Technical Files
            </Link>
          </div>
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #374151',
            color: '#9ca3af',
            fontSize: '0.9rem'
          }}>
            © 2025 VeriDiff. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
