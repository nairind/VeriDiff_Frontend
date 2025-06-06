import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import the working utility functions from PDF (5)
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// PDF.js loading status
const checkPDFJSLoading = () => {
  let attempts = 0;
  const maxAttempts = 30;
  
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js loaded successfully');
        clearInterval(checkInterval);
        resolve('loaded');
        return;
      }
      
      if (window.pdfJsError || attempts >= maxAttempts) {
        console.error('❌ PDF.js loading failed');
        clearInterval(checkInterval);
        reject('failed');
        return;
      }
    }, 1000);
  });
};

function PdfComparePage() {
  const { data: session } = useSession();
  
  // Core states from working PDF (5)
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking');
  
  // Premium states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
    
    // Check PDF.js loading
    if (typeof window !== 'undefined') {
      setTimeout(async () => {
        try {
          await checkPDFJSLoading();
          setPdfLoadingStatus('loaded');
        } catch (error) {
          setPdfLoadingStatus('failed');
        }
      }, 1000);
    }
  }, [session]);

  // Premium upgrade handler
  const handlePremiumUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout session failed');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setLoading(false);
      alert('Sorry, there was an error starting your premium trial. Please try again or contact support.');
    }
  };

  // File handling
  const handleFileChange = (e, fileNum) => {
    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
    setError(null);
  };

  // Main comparison handler - using working logic from PDF (5)
  const handleComparePdfs = async () => {
    if (!file1 || !file2) {
      setError('Please select two PDF files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare PDF documents.');
      return;
    }

    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    if (pdfLoadingStatus !== 'loaded') {
      setError('PDF processing library is not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting PDF comparison...');
      // Use the working comparison function from PDF (5)
      const comparisonResult = await comparePDFFiles(file1, file2, {});
      console.log('PDF comparison completed:', comparisonResult);
      setResults(comparisonResult);
      
    } catch (err) {
      console.error('PDF comparison error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format) => {
    if (!results) return;

    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `pdf_comparison_${timestamp}.${format}`;
      
      if (format === 'txt') {
        const reportContent = `PDF COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

==================================================
FILES COMPARED
==================================================
File 1: ${file1?.name}
File 2: ${file2?.name}

==================================================
SUMMARY
==================================================
Total Changes: ${results.differences_found || 0}
Similarity Score: ${results.similarity_score || 0}%
Pages Analyzed: ${results.total_pages || 0}

==================================================
DETAILED CHANGES
==================================================
${(results.text_changes || []).slice(0, 25).map((change, index) => 
  `${index + 1}. [Page ${change.page}] ${change.type.toUpperCase()}
   ${change.type === 'modified' ? 
     `OLD: ${change.old_text?.substring(0, 100)}...
   NEW: ${change.new_text?.substring(0, 100)}...` :
     change.text?.substring(0, 150) + '...'}`
).join('\n\n')}

Generated by VeriDiff PDF Comparison Tool
`;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality works! Check your downloads folder.');
    }
  };

  // Simple file upload component
  const PdfFileUpload = ({ fileNum, file, onChange }) => {
    return (
      <div style={{
        background: fileNum === 1 
          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
          : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        padding: '25px',
        borderRadius: '16px',
        border: fileNum === 1 
          ? '2px solid #dc2626' 
          : '2px solid #22c55e',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: fileNum === 1 
              ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}>
            {fileNum}
          </div>
          <div>
            <h4 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              PDF Document {fileNum}
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: fileNum === 1 ? '#dc2626' : '#059669',
              margin: 0,
              fontWeight: '500'
            }}>
              Upload your {fileNum === 1 ? 'original' : 'updated'} PDF document
            </p>
          </div>
        </div>
        
        <input
          type="file"
          onChange={(e) => onChange(e, fileNum)}
          accept=".pdf"
          style={{
            width: '100%',
            padding: '14px',
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '12px',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}
        />
        
        {file && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#166534',
            fontWeight: '600'
          }}>
            ✅ {file.name}
          </div>
        )}
      </div>
    );
  };

  // Premium modal
  const PremiumModal = () => {
    if (!showPremiumModal) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '0',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #ea580c)',
            color: 'white',
            padding: '40px 30px',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 10px 0'
            }}>
              PDF Comparison Tool
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              margin: '0'
            }}>
              Professional document analysis requires premium access
            </p>
          </div>

          <div style={{ padding: '30px' }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#374151',
              textAlign: 'center',
              marginBottom: '25px'
            }}>
              Get instant access to advanced PDF comparison with word-level highlighting, 
              side-by-side viewing, and professional reporting features.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '25px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '5px'
              }}>
                £19<span style={{ fontSize: '1rem', opacity: '0.7' }}>/month</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Cancel anytime • 30-day money-back guarantee
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handlePremiumUpgrade}
                disabled={loading}
                style={{
                  background: loading 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minWidth: '200px'
                }}
              >
                {loading ? 'Loading...' : 'Upgrade Now'}
              </button>
              
              <button
                onClick={() => setShowPremiumModal(false)}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              textAlign: 'center',
              marginTop: '20px',
              marginBottom: '0'
            }}>
              💡 Remember: Excel comparison remains FREE forever!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Results component using simple logic from PDF (5)
  const PdfResults = () => {
    if (!results) return null;

    const {
      differences_found = 0,
      similarity_score = 0,
      text_changes = [],
      total_pages = 0
    } = results;

    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #dc2626, #ea580c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2rem',
          fontWeight: '700',
          margin: '0 0 25px 0',
          textAlign: 'center'
        }}>
          📊 PDF Comparison Results
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              {differences_found}
            </div>
            <div style={{ color: '#7f1d1d', fontSize: '0.9rem', fontWeight: '500' }}>
              Changes Found
            </div>
          </div>
          
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#22c55e',
              marginBottom: '8px'
            }}>
              {similarity_score}%
            </div>
            <div style={{ color: '#166534', fontSize: '0.9rem', fontWeight: '500' }}>
              Similarity
            </div>
          </div>
          
          <div style={{
            background: '#eff6ff',
            border: '2px solid #2563eb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2563eb',
              marginBottom: '8px'
            }}>
              {total_pages}
            </div>
            <div style={{ color: '#1e40af', fontSize: '0.9rem', fontWeight: '500' }}>
              Pages Analyzed
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => handleExport('txt')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            📄 Download Report
          </button>
        </div>
        
        {text_changes.length > 0 && (
          <div>
            <h4 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '1.3rem', 
              color: '#374151',
              fontWeight: '600'
            }}>
              📝 Changes Found ({text_changes.length})
            </h4>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f8fafc'
            }}>
              {text_changes.slice(0, 20).map((change, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    borderBottom: index < text_changes.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Page {change.page} • {change.type.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    lineHeight: '1.4',
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {change.type === 'modified' ? (
                      <div>
                        <div style={{ color: '#dc2626', marginBottom: '4px' }}>
                          - {change.old_text?.substring(0, 100)}{change.old_text?.length > 100 ? '...' : ''}
                        </div>
                        <div style={{ color: '#059669' }}>
                          + {change.new_text?.substring(0, 100)}{change.new_text?.length > 100 ? '...' : ''}
                        </div>
                      </div>
                    ) : (
                      change.text?.substring(0, 200) + (change.text?.length > 200 ? '...' : '')
                    )}
                  </div>
                </div>
              ))}
              {text_changes.length > 20 && (
                <div style={{
                  padding: '15px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  ... and {text_changes.length - 20} more changes
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '50px 30px',
    background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
    borderRadius: '20px',
    marginBottom: '40px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  return (
    <AuthGuard>
      <div style={containerStyle}>
        <Head>
          <title>Professional PDF Comparison Tool | Document Analysis | VeriDiff</title>
          <meta name="description" content="Professional PDF comparison tool for document analysis. Compare contracts, reports, legal documents with word-level precision. Side-by-side viewing with enterprise security." />
          <meta name="keywords" content="pdf comparison, document comparison, contract analysis, legal document comparison, pdf diff, document analysis tool, professional pdf comparison, contract review" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://veridiff.com/compare/pdfs" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://veridiff.com/compare/pdfs" />
          <meta property="og:title" content="Professional PDF Comparison Tool | Document Analysis | VeriDiff" />
          <meta property="og:description" content="Professional PDF comparison tool for document analysis. Compare contracts, reports, legal documents with word-level precision and enterprise security." />
          <meta property="og:image" content="https://veridiff.com/images/pdf-comparison-tool.png" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content="Professional PDF Comparison Tool | VeriDiff" />
          <meta property="twitter:description" content="Professional PDF comparison for contracts, reports, legal documents. Word-level precision with enterprise security." />
          
          {/* PDF.js Loading Script */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🔧 Loading PDF.js...');
                
                const pdfSources = [
                  {
                    lib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
                    worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  }
                ];
                
                let currentSourceIndex = 0;
                
                function loadPDFJS() {
                  if (currentSourceIndex >= pdfSources.length) {
                    console.error('❌ All PDF.js sources failed');
                    window.pdfJsError = true;
                    return;
                  }
                  
                  const source = pdfSources[currentSourceIndex];
                  const script = document.createElement('script');
                  script.src = source.lib;
                  
                  script.onload = function() {
                    setTimeout(function() {
                      if (typeof window.pdfjsLib !== 'undefined') {
                        try {
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
                          window.pdfJsReady = true;
                          console.log('✅ PDF.js ready');
                        } catch (error) {
                          console.error('❌ PDF.js worker failed:', error);
                          window.pdfJsError = true;
                        }
                      } else {
                        currentSourceIndex++;
                        loadPDFJS();
                      }
                    }, 500);
                  };
                  
                  script.onerror = function() {
                    currentSourceIndex++;
                    loadPDFJS();
                  };
                  
                  document.head.appendChild(script);
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadPDFJS);
                } else {
                  loadPDFJS();
                }
              })();
            `
          }} />
          
          {/* Responsive CSS */}
          <style jsx>{`
            @media (max-width: 768px) {
              .hero-title { font-size: 2.5rem !important; }
              .section-padding { padding: 25px !important; }
              .use-case-grid { grid-template-columns: 1fr !important; }
              .file-upload-grid { grid-template-columns: 1fr !important; }
              .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            
            @media (max-width: 480px) {
              .main-container { padding: 15px !important; }
              .hero-section { padding: 30px 20px !important; }
              .benefits-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </Head>

        <Header />

        {/* Breadcrumb Navigation */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <nav style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <Link href="/" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Home
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <Link href="/compare" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                File Comparison Tools
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>PDF Document Comparison</span>
            </nav>
          </div>
        </div>

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
              🔒 Enterprise-Grade Privacy: All PDF processing happens in your browser. We never see, store, or access your documents.
            </p>
          </div>
        </div>

        <main style={mainStyle} className="main-container">
          
          {/* Hero Section */}
          <div style={heroStyle} className="hero-section">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '1.5rem', 
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              📄 Professional Document Analysis
            </div>
            
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: '0 0 20px 0',
              lineHeight: '1.2'
            }} className="hero-title">
              Professional PDF Document
              <span style={{ 
                display: 'block',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text'
              }}>
                Comparison Tool
              </span>
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 2rem auto'
            }}>
              Compare contracts, reports, and legal documents with word-level precision. 
              Side-by-side viewing with synchronized scrolling and enterprise-grade security.
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              fontSize: '0.95rem',
              opacity: '0.85'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Word-Level Highlighting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Side-by-Side Viewing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>

          {/* Common Use Cases Section */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 15px 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Common PDF Comparison Scenarios
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Real situations where VeriDiff's PDF comparison saves hours of manual review
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '25px'
            }} className="use-case-grid">
              <div style={{
                background: '#fef2f2',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #fca5a5'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '15px', color: '#dc2626' }}>
                  📋 Contract Version Control
                </h3>
                <p style={{ color: '#7f1d1d', fontSize: '1rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Compare Service_Agreement_v2.1.pdf with v2.2.pdf to identify critical changes. 
                  Automatically detect payment term modifications, liability adjustments, and new clauses.
                </p>
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#dc2626',
                  fontWeight: '500'
                }}>
                  Result: Payment terms changed from 30 to 15 days, liability cap increased from £100k to £250k
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #93c5fd'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '15px', color: '#2563eb' }}>
                  📊 Compliance Documentation
                </h3>
                <p style={{ color: '#1e3a8a', fontSize: '1rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Review updated policy documents and compliance reports. Ensure all regulatory changes 
                  are properly implemented and documented for audit purposes.
                </p>
                <div style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#2563eb',
                  fontWeight: '500'
                }}>
                  Result: 12 policy updates identified, 3 new compliance requirements added
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #bbf7d0'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '15px', color: '#059669' }}>
                  📑 Report Analysis
                </h3>
                <p style={{ color: '#065f46', fontSize: '1rem', lineHeight: '1.6', marginBottom: '15px' }}>
                  Compare quarterly reports, financial statements, and technical documentation. 
                  Track changes in metrics, recommendations, and strategic directions.
                </p>
                <div style={{
                  background: 'rgba(5, 150, 105, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  Result: Revenue projections updated, 5 new strategic initiatives identified
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section or Premium Gate */}
          {userTier === 'premium' ? (
            <div style={sectionStyle} className="section-padding">
              <h2 style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 15px 0',
                textAlign: 'center',
                fontWeight: '700'
              }}>
                Upload Your PDF Documents
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0 0 35px 0'
              }}>
                Professional PDF comparison with enterprise-grade security
              </p>

              {pdfLoadingStatus === 'failed' && (
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '25px',
                  color: '#dc2626',
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  ❌ PDF engine failed to load. Please refresh the page and try again.
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '25px',
                marginBottom: '35px'
              }} className="file-upload-grid">
                <PdfFileUpload 
                  fileNum={1} 
                  file={file1} 
                  onChange={handleFileChange}
                />
                <PdfFileUpload 
                  fileNum={2} 
                  file={file2} 
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleComparePdfs}
                  disabled={loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded'}
                  style={{
                    background: loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded'
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                      : 'linear-gradient(135deg, #dc2626, #ea580c)',
                    color: 'white',
                    border: 'none',
                    padding: '20px 50px',
                    borderRadius: '60px',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    cursor: loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded' ? 'not-allowed' : 'pointer',
                    minWidth: '350px',
                    transition: 'all 0.3s ease',
                    boxShadow: loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded'
                      ? '0 4px 15px rgba(100, 116, 139, 0.2)' 
                      : '0 10px 30px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ marginRight: '12px' }}>⏳</span>
                      Analyzing Documents...
                    </>
                  ) : pdfLoadingStatus !== 'loaded' ? (
                    <>
                      <span style={{ marginRight: '12px' }}>⏳</span>
                      Loading PDF Engine...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '12px' }}>🚀</span>
                      Compare PDF Documents
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '2px solid #dc2626',
              borderRadius: '24px',
              padding: '50px 40px',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '15px'
              }}>
                PDF Comparison Requires Premium
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#7f1d1d',
                marginBottom: '30px',
                maxWidth: '600px',
                margin: '0 auto 30px auto'
              }}>
                Upgrade to premium for advanced PDF document comparison with word-level detection 
                and professional reporting features.
              </p>
              
              <button
                onClick={() => setShowPremiumModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                🚀 Upgrade to Premium - £19/month
              </button>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                marginTop: '20px'
              }}>
                💡 Remember: Excel comparison remains FREE forever!
              </p>
            </div>
          )}

          {/* Key Benefits Section */}
          <div style={sectionStyle} className="section-padding">
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 15px 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Why Choose VeriDiff for PDF Comparison
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 35px 0'
            }}>
              Enterprise-grade features designed for professional document analysis
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '25px'
            }} className="benefits-grid">
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #22c55e',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  🎯
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#166534' }}>
                  Word-Level Precision
                </h3>
                <p style={{ color: '#065f46', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Detect exact changes at the word level with highlighted differences for precise document analysis.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #2563eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  📱
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#1e40af' }}>
                  Side-by-Side View
                </h3>
                <p style={{ color: '#1e3a8a', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Synchronized viewing with real-time highlighting makes it easy to spot all differences.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #f59e0b',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  📊
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#92400e' }}>
                  Professional Reports
                </h3>
                <p style={{ color: '#78350f', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  Export detailed comparison reports with statistics and change summaries for stakeholders.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #7c3aed',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 15px auto',
                  color: 'white'
                }}>
                  🔒
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px', color: '#6b21a8' }}>
                  Enterprise Security
                </h3>
                <p style={{ color: '#581c87', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                  All processing happens locally in your browser. Your sensitive documents never leave your device.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              color: '#dc2626',
              margin: '20px 0',
              padding: '20px',
              border: '2px solid #dc2626',
              borderRadius: '16px',
              background: '#fef2f2',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results */}
          <PdfResults />

        </main>

        <PremiumModal />
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default PdfComparePage;
