import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FAQ() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleHome = () => {
    router.push('/');
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
          a: 'VeriDiff is a browser-based file comparison tool that allows you to compare different types of files (Excel, CSV, PDF, JSON, XML, TXT) with intelligent field mapping and tolerance settings. All processing happens in your browser for complete privacy.'
        },
        {
          q: 'Do I need to install anything to use VeriDiff?',
          a: 'No installation required! VeriDiff runs entirely in your web browser. Simply navigate to the application and start comparing files immediately.'
        },
        {
          q: 'Is VeriDiff free to use?',
          a: 'VeriDiff offers a free Starter tier with 5 comparisons per month. For unlimited comparisons and advanced features, check our pricing page for Professional (£19/month) and Business (£79/month) plans.'
        },
        {
          q: 'Can I use VeriDiff offline?',
          a: 'VeriDiff requires an internet connection for the initial loading of the application. Once loaded, file processing happens locally in your browser, but you\'ll need to stay connected to the web application.'
        },
        {
          q: 'What browsers work best with VeriDiff?',
          a: 'Recommended: Chrome (best performance), Firefox, Safari, Edge. Minimum versions: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+. Not supported: Internet Explorer.'
        }
      ]
    },
    {
      id: 'formats',
      title: 'File Format Support',
      questions: [
        {
          q: 'What file formats can VeriDiff compare?',
          a: 'Supported formats: Excel (.xlsx, .xls, .xlsm), CSV (.csv), PDF (.pdf) - text-based only, JSON (.json), XML (.xml), Text (.txt). Cross-format combinations: Excel ↔ CSV (featured). More combinations planned for future releases.'
        },
        {
          q: 'Can VeriDiff handle Excel files with multiple sheets?',
          a: 'Yes! VeriDiff automatically detects all worksheets in Excel files and lets you: Select specific sheets to compare, Preview headers and row counts for each sheet, Handle hidden sheets appropriately, Compare different sheets from the same workbook.'
        },
        {
          q: 'Does VeriDiff work with password-protected files?',
          a: 'No, VeriDiff cannot process password-protected or encrypted files. You\'ll need to remove password protection before uploading.'
        },
        {
          q: 'What about scanned PDFs or image-based documents?',
          a: 'Currently, VeriDiff only works with text-based PDFs where text can be extracted. Scanned PDFs (images) require OCR processing, which is planned for future releases.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      questions: [
        {
          q: 'Is my data safe? Where are my files stored?',
          a: 'Your files are completely private and secure: No server upload (Files never leave your device), Browser-only processing (All comparison logic runs locally), No data storage (No information is saved on external servers), Session-only (Data is cleared when you close the browser tab).'
        },
        {
          q: 'Can VeriDiff see or access my file contents?',
          a: 'No, VeriDiff processes files entirely within your browser. The developers and servers cannot see your file contents, comparison results, or any data you process.'
        },
        {
          q: 'Is VeriDiff compliant with data protection regulations?',
          a: 'Yes, VeriDiff\'s client-side processing model supports compliance with: GDPR (No personal data processing on servers), HIPAA (Suitable for healthcare data with proper organizational controls), SOX (Maintains audit trail integrity), Industry standards (Meets most corporate security requirements).'
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - VeriDiff Smart File Comparison Tool</title>
        <meta name="description" content="Frequently asked questions about VeriDiff file comparison tool. Get answers about features, privacy, troubleshooting, and more." />
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
              Everything you need to know about VeriDiff file comparison tool
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
      </div>
    </>
  );
}
