import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function FAQ() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Check for logged in user on component mount
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

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    localStorage.removeItem('veridiff_token');
    setUser(null);
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleAccountSettings = () => {
    window.location.href = '/account';
  };

  const handleTryDemo = () => {
    window.location.href = '/compare';
  };

  const scrollToSection = (sectionId) => {
    router.push(`/#${sectionId}`);
    setMobileMenuOpen(false);
  };

  const faqSections = [
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          q: 'What is VeriDiff and how does it work?',
          a: 'VeriDiff is a British-engineered file comparison tool that processes everything locally in your browser for complete privacy. It specializes in intelligent field mapping and tolerance settings for business data that is never perfect - perfect for finance teams, analysts, and consultants who need to compare Excel, CSV, PDF, JSON, XML, and TXT files.'
        },
        {
          q: 'Do I need to install anything to use VeriDiff?',
          a: 'No installation required! VeriDiff runs entirely in your web browser. Simply navigate to the application and start comparing files immediately. All processing happens locally on your device for maximum security.'
        },
        {
          q: 'Is VeriDiff really free to use?',
          a: 'Yes! Excel-Excel comparisons are completely FREE forever for signed-in users. You get unlimited comparisons, smart mapping, tolerance settings, and local processing - no credit card required. Premium (£19/month) unlocks all other file formats like CSV, PDF, JSON, XML, and TXT.'
        },
        {
          q: 'Can I use VeriDiff offline?',
          a: 'VeriDiff requires an internet connection for the initial loading and user authentication. Once loaded, all file processing happens locally in your browser, but you need to stay connected for the web application interface.'
        },
        {
          q: 'What browsers work best with VeriDiff?',
          a: 'Recommended: Chrome (best performance), Firefox, Safari, Edge. Minimum versions: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+. Not supported: Internet Explorer.'
        }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Subscriptions',
      questions: [
        {
          q: 'What exactly is included in the free tier?',
          a: 'The free tier includes unlimited Excel-Excel comparisons with all smart features: intelligent header mapping, tolerance settings, local processing, GDPR compliance, and downloadable results. You just need to sign in with your email - no credit card required.'
        },
        {
          q: 'What does Premium unlock for £19/month?',
          a: 'Premium adds: Excel-CSV comparisons, CSV-CSV comparisons, PDF text comparison, JSON comparison, XML comparison, TXT file comparison, advanced tolerance controls, priority support, and early access to new features. All with the same local processing security.'
        },
        {
          q: 'How does billing work? Can I cancel anytime?',
          a: 'We use Stripe for secure payment processing. You can cancel anytime from your account dashboard - no hassle, no questions asked. We offer a 30-day money-back guarantee if you\'re not completely satisfied.'
        },
        {
          q: 'Is there a free trial of Premium features?',
          a: 'Yes! You can start a Premium trial which gives you full access to all formats and features. The trial includes our 30-day money-back guarantee, so you can test Premium risk-free with your real business data.'
        },
        {
          q: 'Do you offer business or enterprise pricing?',
          a: 'Currently we offer individual Premium subscriptions at £19/month. Enterprise features and team billing are planned for future releases. Contact us at sales@veridiff.com for early access discussions.'
        }
      ]
    },
    {
      id: 'formats',
      title: 'File Format Support',
      questions: [
        {
          q: 'What file formats can VeriDiff compare?',
          a: 'Free tier: Excel (.xlsx, .xls, .xlsm) to Excel comparisons with unlimited usage. Premium tier: Excel ↔ CSV, CSV ↔ CSV, PDF (.pdf) text-based, JSON (.json), XML (.xml), and Text (.txt). Cross-format combinations are a VeriDiff specialty.'
        },
        {
          q: 'Can VeriDiff handle Excel files with multiple sheets?',
          a: 'Yes! VeriDiff automatically detects all worksheets in Excel files and lets you: Select specific sheets to compare, preview headers and row counts for each sheet, handle hidden sheets appropriately, and compare different sheets from the same workbook.'
        },
        {
          q: 'Does VeriDiff work with password-protected files?',
          a: 'No, VeriDiff cannot process password-protected or encrypted files. You\'ll need to remove password protection before uploading. This is a security feature - we never want to handle your passwords.'
        },
        {
          q: 'What about scanned PDFs or image-based documents?',
          a: 'Currently, VeriDiff only works with text-based PDFs where text can be extracted. Scanned PDFs (images) require OCR processing, which is planned for future Premium features.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      questions: [
        {
          q: 'Is my data safe? Where are my files stored?',
          a: 'Your files are completely private and secure: No server upload (files never leave your device), browser-only processing (all comparison logic runs locally), no data storage (no information is saved on external servers), session-only (data is cleared when you close the browser tab). This is our core security promise.'
        },
        {
          q: 'Can VeriDiff developers see my file contents?',
          a: 'Absolutely not. VeriDiff processes files entirely within your browser using JavaScript. Our servers never receive your file contents, comparison results, or any data you process. Even we cannot see what you\'re comparing.'
        },
        {
          q: 'Is VeriDiff compliant with data protection regulations?',
          a: 'Yes, VeriDiff\'s client-side processing model supports compliance with: GDPR (no personal data processing on servers), HIPAA (suitable for healthcare data with proper organizational controls), SOX (maintains audit trail integrity), and other industry standards.'
        },
        {
          q: 'How does user authentication work?',
          a: 'We use NextAuth for secure authentication. You can sign in with email or social providers. We only store your basic profile information (name, email, subscription tier) - never your file data. All authentication is handled securely through industry-standard protocols.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Questions',
      questions: [
        {
          q: 'How does local processing actually work?',
          a: 'VeriDiff uses advanced JavaScript libraries to parse and compare files entirely in your browser. When you upload files, they\'re processed by client-side code running on your device. The comparison algorithms, tolerance calculations, and results generation all happen locally - nothing is sent to our servers.'
        },
        {
          q: 'What if I have huge files? Are there size limits?',
          a: 'VeriDiff can handle large files efficiently since processing happens on your device. Practical limits depend on your device\'s memory and browser capabilities. Most business files (up to 100MB+) work smoothly. For massive datasets, consider splitting files or contact us for optimization advice.'
        },
        {
          q: 'How accurate is the smart mapping feature?',
          a: 'VeriDiff uses sophisticated algorithms to match columns even when headers don\'t match exactly. It considers: similarity scoring, data type analysis, position analysis, and contextual clues. You can always review and adjust mappings before running comparisons.'
        },
        {
          q: 'Can I integrate VeriDiff with other tools?',
          a: 'Currently VeriDiff is a standalone web application. API access and integrations are planned for future releases. You can export results in Excel or CSV format for use in other tools.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Troubleshooting',
      questions: [
        {
          q: 'What if VeriDiff isn\'t working properly?',
          a: 'First, try refreshing your browser and ensuring you\'re using a supported browser version. Check that JavaScript is enabled. For persistent issues, contact us at support@veridiff.com with details about your browser, file types, and the specific problem.'
        },
        {
          q: 'Do you offer customer support?',
          a: 'Yes! Free users get community support through our help documentation. Premium users get priority email support with faster response times. We\'re a London-based team committed to helping you succeed with your data comparisons.'
        },
        {
          q: 'Can you help with specific comparison scenarios?',
          a: 'Absolutely! We love helping users optimize their comparison workflows. Premium users get priority consultation on complex mapping scenarios, tolerance settings, and best practices for their specific use cases.'
        },
        {
          q: 'How do I report bugs or request features?',
          a: 'Report bugs or suggest features by emailing support@veridiff.com. Premium users\' requests get priority consideration in our development roadmap. We regularly update VeriDiff based on user feedback.'
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - VeriDiff Smart File Comparison Tool</title>
        <meta name="description" content="Frequently asked questions about VeriDiff file comparison tool. Learn about pricing, privacy, features, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937'
      }}>
        {/* Header - Updated to match index.js */}
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
              }} className="desktop-nav">
                <button onClick={() => scrollToSection('features')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} style={{
                  background: 'none',
                  border: 'none',
                  color: '#374151',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}>
                  Pricing
                </button>
                <span style={{
                  color: '#2563eb',
                  fontWeight: '500',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  background: '#eff6ff'
                }}>
                  FAQ
                </span>
                
                {user ? (
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
                        borderRadius: '0.25rem',
                        transition: 'background 0.2s'
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
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
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
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{user.full_name}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{user.email}</div>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                          <button onClick={handleDashboard} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Dashboard
                          </button>
                          <button onClick={handleAccountSettings} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            padding: '0.5rem',
                            color: '#374151',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Account Settings
                          </button>
                          <button onClick={handleSignOut} style={{ 
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            transition: 'background 0.2s'
                          }}>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button onClick={handleSignIn} style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      transition: 'color 0.2s'
                    }}>
                      Sign In
                    </button>
                    <button onClick={handleTryDemo} style={{ 
                      padding: '0.5rem 1rem', 
                      border: 'none', 
                      borderRadius: '0.5rem', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      background: '#2563eb', 
                      color: 'white',
                      transition: 'all 0.2s'
                    }}>
                      Try Free Demo
                    </button>
                  </>
                )}
              </nav>

              <button 
                style={{
                  display: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#374151'
                }}
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
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.5rem',
                    textAlign: 'left'
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.5rem',
                    textAlign: 'left'
                  }}>
                    Pricing
                  </button>
                  <span style={{
                    color: '#2563eb',
                    fontWeight: '500',
                    padding: '0.5rem'
                  }}>
                    FAQ
                  </span>
                  {user ? (
                    <>
                      <button onClick={handleDashboard} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#374151',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Dashboard
                      </button>
                      <button onClick={handleSignOut} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSignIn} style={{ 
                        background: 'none',
                        border: 'none',
                        color: '#374151',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.5rem',
                        textAlign: 'left'
                      }}>
                        Sign In
                      </button>
                      <button onClick={handleTryDemo} style={{ 
                        padding: '0.75rem 1rem', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: '500', 
                        cursor: 'pointer', 
                        background: '#2563eb', 
                        color: 'white',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        Try Free Demo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

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

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
          padding: '4rem 0 2rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
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
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to know about VeriDiff smart file comparison
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{
          background: 'white',
          padding: '3rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            {/* Table of Contents */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Quick Navigation
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.5rem'
              }}>
                {faqSections.map((section) => (
                  <div 
                    key={section.id}
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#eff6ff'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {section.title}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Sections */}
            {faqSections.map((section) => (
              <div key={section.id} id={section.id} style={{
                marginBottom: '2rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden'
              }}>
                <div 
                  onClick={() => toggleSection(section.id)}
                  style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                >
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {section.title}
                  </h2>
                  <span style={{
                    fontSize: '1.5rem',
                    color: '#6b7280',
                    transition: 'transform 0.2s',
                    transform: openSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ⌄
                  </span>
                </div>
                <div style={{
                  display: openSections[section.id] ? 'block' : 'none',
                  padding: 0
                }}>
                  {section.questions.map((item, index) => (
                    <div key={index} style={{
                      borderBottom: index < section.questions.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div 
                        onClick={() => toggleSection(`${section.id}-${index}`)}
                        style={{
                          padding: '1rem 1.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'white'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <h3 style={{
                          fontWeight: '500',
                          color: '#1f2937',
                          flex: 1,
                          textAlign: 'left',
                          margin: 0
                        }}>
                          {item.q}
                        </h3>
                        <span style={{
                          fontSize: '1.5rem',
                          color: '#6b7280',
                          transition: 'transform 0.2s',
                          transform: openSections[`${section.id}-${index}`] ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ⌄
                        </span>
                      </div>
                      <div style={{
                        display: openSections[`${section.id}-${index}`] ? 'block' : 'none',
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        color: '#4b5563',
                        background: '#f9fafb'
                      }}>
                        <p style={{
                          margin: 0,
                          lineHeight: '1.6'
                        }}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer - Updated to match index.js */}
        <footer style={{ 
          background: '#111827', 
          color: 'white', 
          padding: '3rem 0' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
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
                  Precision-engineered in London for global business professionals. Your data never leaves your browser.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Product</h4>
                <div>
                  <button onClick={() => scrollToSection('features')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} style={{ 
                    color: '#d1d5db', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.25rem 0', 
                    textAlign: 'left', 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    width: '100%'
                  }}>
                    Pricing
                  </button>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Support</h4>
                <div>
                  <a href="mailto:sales@veridiff.com" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Contact Us
                  </a>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '500', marginBottom: '1rem' }}>Legal</h4>
                <div>
                  <a href="/privacy" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Privacy Policy
                  </a>
                  <a href="/terms" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Terms of Service
                  </a>
                  <a href="/cookies" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    Cookie Policy
                  </a>
                  <a href="/gdpr" style={{ 
                    color: '#d1d5db', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem', 
                    display: 'block', 
                    padding: '0.25rem 0', 
                    marginBottom: '0.5rem' 
                  }}>
                    GDPR Rights
                  </a>
                </div>
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

        {/* CSS for responsive design */}
        <style jsx>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-nav-button { display: block !important; }
          }
        `}</style>
      </div>
    </>
  );
}
