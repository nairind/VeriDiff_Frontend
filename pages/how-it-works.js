import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function HowItWorks() {
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
        <title>How VeriDiff Works - Browser-Based File Comparison Technology</title>
        <meta name="description" content="Technical deep dive into VeriDiff's browser-based file comparison technology. Learn how we ensure complete privacy with local processing and no data uploads." />
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
              How VeriDiff Works
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              A technical deep dive into our browser-based file comparison technology 
              that keeps your data completely private and secure.
            </p>
          </div>
        </section>

        {/* Not AI - Clear Statement */}
        <section style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              background: '#fef2f2',
              border: '2px solid #dc2626',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '1rem'
              }}>
                ❌ VeriDiff Does NOT Use AI
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#7f1d1d',
                lineHeight: '1.6',
                margin: '0'
              }}>
                <strong>We are not an AI company.</strong> VeriDiff uses traditional, deterministic comparison algorithms 
                to show you exactly what changed between your files. No machine learning, no artificial intelligence, 
                no "analysis" of your content. Just precise, mathematical comparison of data structures.
              </p>
            </div>

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
                🔍 Algorithmic File Comparison
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <strong style={{ color: '#1e40af' }}>Data Structure Analysis</strong>
                  <p style={{ fontSize: '0.9rem', color: '#1e40af', margin: '0.5rem 0 0 0' }}>
                    Parse file formats and extract data structures
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚖️</div>
                  <strong style={{ color: '#1e40af' }}>Mathematical Comparison</strong>
                  <p style={{ fontSize: '0.9rem', color: '#1e40af', margin: '0.5rem 0 0 0' }}>
                    Cell-by-cell, row-by-row, character-by-character
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <strong style={{ color: '#1e40af' }}>Difference Reporting</strong>
                  <p style={{ fontSize: '0.9rem', color: '#1e40af', margin: '0.5rem 0 0 0' }}>
                    Highlight changes, additions, deletions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Processing Architecture */}
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
              Browser-Based Processing Architecture
            </h2>

            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Step-by-Step: What Happens to Your Files
              </h3>

              <div style={{
                display: 'grid',
                gap: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      File Selection (Local Only)
                    </h4>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.5', margin: '0' }}>
                      You select files from your computer using your browser's file picker. 
                      <strong> Files remain on your device</strong> - no upload occurs.
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      Browser Memory Loading
                    </h4>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.5', margin: '0' }}>
                      Your browser reads files into temporary memory (RAM) using the FileReader API. 
                      Files are never transmitted anywhere.
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      Format Parsing & Structure Extraction
                    </h4>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.5', margin: '0' }}>
                      JavaScript libraries (SheetJS, mammoth.js, etc.) parse file formats in your browser 
                      to extract data structures - spreadsheet cells, document paragraphs, table rows.
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>4</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      Algorithmic Comparison
                    </h4>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.5', margin: '0' }}>
                      Custom JavaScript algorithms compare data structures using mathematical operations: 
                      string matching, numerical tolerance checking, structural difference detection.
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>5</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      Results Display & Export
                    </h4>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.5', margin: '0' }}>
                      Differences are highlighted in your browser and can be exported as HTML reports. 
                      <strong> Everything stays local</strong> - no server communication.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
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
              Technical Implementation
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
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
                  📊 File Format Libraries
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li><strong>SheetJS:</strong> Excel (.xlsx, .xls) parsing</li>
                  <li><strong>PapaParse:</strong> CSV processing with error handling</li>
                  <li><strong>mammoth.js:</strong> Word document (.docx) extraction</li>
                  <li><strong>PDF.js:</strong> PDF content parsing</li>
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
                  ⚡ Comparison Algorithms
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li><strong>Exact matching:</strong> Character-by-character comparison</li>
                  <li><strong>Fuzzy matching:</strong> Tolerance-based numerical comparison</li>
                  <li><strong>Structure diff:</strong> Row/column alignment detection</li>
                  <li><strong>Semantic mapping:</strong> Header-based field matching</li>
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
                  🔒 Privacy Architecture
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <li><strong>No uploads:</strong> Files never leave your device</li>
                  <li><strong>No storage:</strong> Data cleared when you close browser</li>
                  <li><strong>No tracking:</strong> We cannot see your file contents</li>
                  <li><strong>HTTPS only:</strong> Encrypted connection to our app</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Supported File Formats */}
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
              Supported File Formats & Comparisons
            </h2>

            <div style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      background: '#f8fafc',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>File Format</th>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      background: '#f8fafc',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>Comparison Type</th>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      background: '#f8fafc',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>Features</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>📊 Excel (.xlsx, .xls)</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>
                      Excel ↔ Excel<br/>
                      Excel ↔ CSV
                    </td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>Smart header mapping, numerical tolerance, multiple sheets</td>
                  </tr>
                  <tr>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>📝 CSV (.csv)</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>
                      CSV ↔ CSV<br/>
                      CSV ↔ Excel
                    </td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>Delimiter detection, encoding handling, row alignment</td>
                  </tr>
                  <tr>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>📄 PDF (.pdf)</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>PDF ↔ PDF</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>Text extraction, paragraph comparison, layout-aware</td>
                  </tr>
                  <tr>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>📋 Word (.docx, .doc)</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>Word ↔ Word</td>
                    <td style={{
                      border: '1px solid #e5e7eb',
                      padding: '1rem',
                      color: '#4b5563'
                    }}>Paragraph tracking, formatting preservation, track changes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Privacy vs Traditional Solutions */}
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
              Browser Processing vs. Traditional Solutions
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#fef2f2',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #dc2626'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  ❌ Traditional Cloud Solutions
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: '1.7' }}>
                  <li><strong>File Upload Required:</strong> Your sensitive files are transmitted to unknown servers</li>
                  <li><strong>Server Processing:</strong> Files are processed on company-controlled infrastructure</li>
                  <li><strong>Data Storage:</strong> Files may be cached, logged, or stored temporarily</li>
                  <li><strong>Third-Party Access:</strong> Cloud providers, employees, or government entities may access data</li>
                  <li><strong>Compliance Risk:</strong> GDPR, HIPAA, SOX violations possible</li>
                  <li><strong>Internet Dependency:</strong> Requires fast upload/download speeds</li>
                </ul>
              </div>

              <div style={{
                background: '#f0fdf4',
                padding: '2rem',
                borderRadius: '1rem',
                border: '2px solid #10b981'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#10b981',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  ✅ VeriDiff Browser Processing
                </h3>
                <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#047857', lineHeight: '1.7' }}>
                  <li><strong>Zero Upload:</strong> Files remain on your device at all times</li>
                  <li><strong>Local Processing:</strong> Your browser does all the computational work</li>
                  <li><strong>No Storage:</strong> Data is cleared when you close the browser tab</li>
                  <li><strong>Complete Privacy:</strong> We literally cannot see your file contents</li>
                  <li><strong>Compliance Ready:</strong> Meets highest data protection standards</li>
                  <li><strong>Works Offline:</strong> Process files without internet (after initial load)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security Benefits */}
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
              Security & Compliance Benefits
            </h2>

            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                  🛡️ Regulatory Compliance
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  <strong>GDPR, HIPAA, SOX, PCI-DSS compliant by design.</strong> Since files never leave your browser, 
                  there is no data transfer, storage, or processing on our servers that could violate regulations. 
                  Perfect for financial services, healthcare, and legal industries.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                  🔐 Zero Trust Architecture
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  <strong>Do not trust us with your data - you do not have to.</strong> Our architecture makes it 
                  technically impossible for us to access your files. Even if we wanted to (we do not), 
                  or if we were compromised, your data remains secure.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                  🏢 Enterprise IT Approval
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  <strong>Passes corporate security reviews.</strong> IT departments can audit our open architecture 
                  and verify that no data exfiltration is possible. No special firewall rules, VPN requirements, 
                  or security exceptions needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Requirements */}
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
              Browser Requirements
            </h2>
            
            <div style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                Minimum Requirements
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌐</div>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Chrome 90+</strong>
                </div>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🦊</div>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Firefox 88+</strong>
                </div>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧭</div>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Safari 14+</strong>
                </div>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Edge 90+</strong>
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #dbeafe'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '0.5rem'
                }}>
                  Technical Requirements
                </h4>
                <ul style={{
                  margin: '0',
                  paddingLeft: '1.5rem',
                  color: '#1e40af',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  <li><strong>JavaScript enabled</strong> (required for file processing)</li>
                  <li><strong>4GB+ RAM recommended</strong> for large files (&gt;50MB)</li>
                  <li><strong>Modern browser APIs:</strong> FileReader, Web Workers, Blob</li>
                  <li><strong>HTTPS connection</strong> (security requirement)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
