import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import the enhanced utility functions
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

function EnhancedPdfComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI states
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

  // Main comparison handler
  const handleComparePdfs = async () => {
    console.log('Button clicked');
    
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

    setLoading(true);
    setError(null);

    try {
      console.log('Starting PDF comparison...');
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

  // File upload component
  const SimplePdfFileUpload = ({ fileNum, file, onChange }) => {
    return (
      <div style={{
        background: fileNum === 1 
          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
          : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        padding: '2rem',
        borderRadius: '16px',
        border: fileNum === 1 
          ? '2px solid #dc2626' 
          : '2px solid #22c55e'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
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
              margin: '0 0 0.25rem 0'
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
            padding: '1rem',
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '12px',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}
        />
        
        {file && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
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
            padding: '2.5rem 2rem',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 0.75rem 0'
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

          <div style={{ padding: '2rem' }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#374151',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Get instant access to advanced PDF comparison with word-level highlighting, 
              side-by-side viewing, and professional reporting features.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                £19<span style={{ fontSize: '1rem', opacity: '0.7' }}>/month</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Cancel anytime • 30-day money-back guarantee
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
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
                  padding: '1rem 2rem',
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
                  padding: '1rem 2rem',
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
              marginTop: '1.5rem',
              marginBottom: '0'
            }}>
              💡 Remember: Excel comparison remains FREE forever!
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Head>
          <title>Professional PDF Comparison Tool | VeriDiff</title>
          <meta name="description" content="Professional PDF comparison with word-level detection and enterprise security." />
        </Head>

        <Header />

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

        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          
          <section style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: 'white',
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: '0 0 1.5rem 0',
              lineHeight: '1.2'
            }}>
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
              margin: '0 auto'
            }}>
              Compare contracts, reports, and legal documents with word-level precision. 
              Side-by-side viewing with synchronized scrolling and enterprise-grade security.
            </p>
          </section>

          <section style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Common PDF Comparison Scenarios
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 2.5rem 0'
            }}>
              Real situations where VeriDiff's PDF comparison saves hours of manual review
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem'
            }}>
              <div style={{
                background: '#fef2f2',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #fca5a5'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626' }}>
                  📋 Contract Version Control
                </h3>
                <p style={{ color: '#7f1d1d', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Compare Service_Agreement_v2.1.pdf with v2.2.pdf to identify critical changes. 
                  Automatically detect payment term modifications, liability adjustments, and new clauses.
                </p>
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  padding: '1rem',
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
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #93c5fd'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2563eb' }}>
                  📊 Compliance Documentation
                </h3>
                <p style={{ color: '#1e3a8a', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Review updated policy documents and compliance reports. Ensure all regulatory changes 
                  are properly implemented and documented for audit purposes.
                </p>
                <div style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  padding: '1rem',
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
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #bbf7d0'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#059669' }}>
                  📑 Report Analysis
                </h3>
                <p style={{ color: '#065f46', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Compare quarterly reports, financial statements, and technical documentation. 
                  Track changes in metrics, recommendations, and strategic directions.
                </p>
                <div style={{
                  background: 'rgba(5, 150, 105, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  Result: Revenue projections updated, 5 new strategic initiatives identified
                </div>
              </div>
            </div>
          </section>

          {userTier === 'premium' && (
            <section style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 1rem 0',
                textAlign: 'center',
                fontWeight: '700'
              }}>
                Upload Your PDF Documents
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0 0 2.5rem 0'
              }}>
                Professional PDF comparison with enterprise-grade security
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <SimplePdfFileUpload 
                  fileNum={1} 
                  file={file1} 
                  onChange={handleFileChange}
                />
                <SimplePdfFileUpload 
                  fileNum={2} 
                  file={file2} 
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleComparePdfs}
                  disabled={loading || !file1 || !file2}
                  style={{
                    background: loading || !file1 || !file2
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                      : 'linear-gradient(135deg, #dc2626, #ea580c)',
                    color: 'white',
                    border: 'none',
                    padding: '1.25rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: loading || !file1 || !file2 ? 'not-allowed' : 'pointer',
                    minWidth: '280px'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ marginRight: '0.75rem' }}>⏳</span>
                      Analyzing Documents...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '0.75rem' }}>🚀</span>
                      Compare PDF Documents
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {userTier !== 'premium' && (
            <section style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '2px solid #dc2626',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📄</div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '1rem'
              }}>
                PDF Comparison Requires Premium
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#7f1d1d',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto'
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
                  padding: '1.5rem 3rem',
                  borderRadius: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
                }}
              >
                🚀 Upgrade to Premium - £19/month
              </button>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                marginTop: '1.5rem'
              }}>
                💡 Remember: Excel comparison remains FREE forever!
              </p>
            </section>
          )}

          {error && (
            <div style={{
              color: '#dc2626',
              padding: '1.5rem',
              border: '2px solid #dc2626',
              borderRadius: '16px',
              background: '#fef2f2',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '2rem'
            }}>
              Error: {error}
            </div>
          )}

          {results && (
            <section style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              marginBottom: '2rem',
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
                margin: '0 0 2rem 0',
                textAlign: 'center'
              }}>
                📊 PDF Comparison Results
              </h2>
              
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '2rem'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1f2937' }}>
                      {results.differences_found || 0}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Changes Found</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#22c55e' }}>
                      {results.similarity_score || 0}%
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Similarity</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2563eb' }}>
                      {results.total_pages || 0}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Pages Analyzed</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center'
                }}>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    📊 Download Report
                  </button>
                </div>
              </div>
            </section>
          )}

        </main>

        <PremiumModal />
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default EnhancedPdfComparePage;
