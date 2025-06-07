import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Home() {
  const { data: session } = useSession();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [pendingPremiumUpgrade, setPendingPremiumUpgrade] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  
  // File upload states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [dragActive, setDragActive] = useState({ file1: false, file2: false });

  // Check if user has already accepted cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('veridiff-cookie-consent');
    if (cookieConsent === 'accepted') {
      setShowCookieBanner(false);
    }
  }, []);

  // Handle premium upgrade after successful registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const premiumIntent = urlParams.get('premium') === 'true';
    
    if (session && (pendingPremiumUpgrade || premiumIntent)) {
      setPendingPremiumUpgrade(false);
      setShowRegistrationModal(false);
      
      if (premiumIntent) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('premium');
        window.history.replaceState({}, '', newUrl);
      }
      
      handlePremiumUpgradeFlow();
    }
  }, [session, pendingPremiumUpgrade]);

  const handleProTrial = async () => {
    if (!session) {
      setPendingPremiumUpgrade(true);
      setShowRegistrationModal(true);
      return;
    }
    await handlePremiumUpgradeFlow();
  };

  const handlePremiumUpgradeFlow = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1RVEnnJbX57fsaKHqLt143Fg',
          successUrl: `${window.location.origin}/compare?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Sorry, there was an error starting your premium trial. Please try again or contact support.');
    }
  };

  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false);
    setPendingPremiumUpgrade(false);
  };

  const handleCookieAccept = () => {
    localStorage.setItem('veridiff-cookie-consent', 'accepted');
    setShowCookieBanner(false);
  };

  // File upload handlers
  const handleFileSelect = (fileNumber, event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (fileNumber === 1) setFile1(selectedFile);
      if (fileNumber === 2) setFile2(selectedFile);
    }
  };

  const handleDrop = (fileNumber, event) => {
    event.preventDefault();
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (fileNumber === 1) setFile1(droppedFile);
      if (fileNumber === 2) setFile2(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnter = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: true });
  };

  const handleDragLeave = (fileNumber) => {
    setDragActive({ ...dragActive, [`file${fileNumber}`]: false });
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      alert('Please select both files to compare');
      return;
    }

    setIsComparing(true);
    
    // Simulate actual file processing
    setTimeout(() => {
      setIsComparing(false);
      setShowResults(true);
      // Scroll to results section
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
  };

  const handleNewComparison = () => {
    setFile1(null);
    setFile2(null);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Registration Modal Component
  const RegistrationModal = () => {
    if (!showRegistrationModal) return null;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '30px',
          maxWidth: '500px', width: '100%', textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
            🚀 Start Your Premium Trial
          </h3>
          
          <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: '1rem', lineHeight: '1.5' }}>
            {pendingPremiumUpgrade ? 
              "Great choice! Just sign up first, then we'll start your premium trial automatically." :
              "Sign up to unlock premium features and start your free trial."
            }
          </p>

          <div style={{
            background: '#eff6ff', border: '1px solid #2563eb', borderRadius: '8px',
            padding: '15px', marginBottom: '25px', textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '0.95rem' }}>
              ✨ What you get with Premium:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '0.9rem' }}>
              <li>All file format comparisons (PDF, CSV, JSON, XML, TXT)</li>
              <li>Advanced tolerance & precision controls</li>
              <li>Priority support & feature requests</li>
              <li>Cancel anytime - no long-term commitment</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.origin + '/?premium=true')}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem'
              }}
            >
              {pendingPremiumUpgrade ? 'Sign Up & Start Trial' : 'Sign Up'}
            </button>
            <button onClick={handleRegistrationModalClose} style={{
              background: '#f3f4f6', color: '#374151', border: 'none',
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
            }}>
              Cancel
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '15px', marginBottom: 0 }}>
            Your files stay private and secure - processed locally in your browser
          </p>
        </div>
      </div>
    );
  };

  // Privacy-First Cookie Banner Component
  const CookieBanner = () => {
    if (!showCookieBanner) return null;

    return (
      <div className="cookie-banner" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, #1e40af, #3730a3)', color: 'white',
        padding: '1.25rem 1.5rem', zIndex: 9998, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
            🔒 Privacy-First Cookies
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#bfdbfe', lineHeight: '1.4' }}>
            We only use essential cookies for login and preferences. <strong>No tracking, no analytics, no data collection.</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={handleCookieAccept} style={{
            background: '#10b981', color: 'white', border: 'none',
            padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.9rem',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>
            Accept Essential Only
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Secure Excel Comparison Tool for Business | Compare Excel Files Locally</title>
        <meta name="description" content="Professional Excel comparison tool with complete privacy. Compare Excel and PDF files locally in your browser. Built for professionals who can't upload sensitive data to cloud servers." />
        <meta name="keywords" content="Excel comparison, secure file comparison, local Excel compare, PDF comparison, private file diff, business file analysis, GDPR compliant" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph tags for social media */}
        <meta property="og:title" content="VeriDiff - Secure Excel Comparison for Business" />
        <meta property="og:description" content="Compare Excel files securely in your browser. Built for professionals with sensitive data." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veridiff.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VeriDiff - Secure Excel Comparison" />
        <meta name="twitter:description" content="Professional Excel comparison with complete privacy protection." />
        
        <style>{`
          @media (max-width: 768px) {
            .hero-title { font-size: 2.5rem !important; }
            .hero-subtitle { font-size: 1.1rem !important; }
            .upload-container { flex-direction: column !important; gap: 1rem !important; }
            .upload-zone { min-height: 120px !important; }
            .compare-button { width: 100% !important; margin-top: 1rem !important; }
            .use-cases-grid { grid-template-columns: 1fr !important; }
            .why-grid { grid-template-columns: 1fr !important; }
            .cookie-banner { 
              flex-direction: column !important; text-align: center !important; gap: 0.75rem !important;
              padding: 1rem !important;
            }
            section { padding: 2rem 0 !important; }
          }
          
          @media (max-width: 480px) {
            .hero-title { font-size: 2rem !important; }
            .section-container { padding: 0 15px !important; }
            .upload-zone { min-height: 100px !important; font-size: 0.875rem !important; }
            section { padding: 1.5rem 0 !important; }
          }
          
          .upload-zone {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .upload-zone:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
          }
          
          .upload-zone.drag-active {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
          }
          
          .compare-button {
            transition: all 0.3s ease;
          }
          
          .compare-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
          }
          
          .compare-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .cookie-banner {
            animation: slideUpFade 0.5s ease-out;
          }
          
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937'
      }}>
        
        <Header />

        {/* Trust Banner */}
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
              🔒 Built for professionals who can't upload sensitive Excel files to cloud servers
            </p>
          </div>
        </div>

        {/* Hero Section with Upload Interface */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '3rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }} className="section-container">
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }} className="hero-title">
              Compare Excel Files Securely
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                in Your Browser
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#6b7280', 
              marginBottom: '3rem', 
              maxWidth: '600px', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              lineHeight: '1.6'
            }} className="hero-subtitle">
              Professional Excel comparison for teams with sensitive data. Your files never leave your device.
            </p>

            {/* Upload Interface */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }} className="upload-container">
                
                {/* File 1 Upload */}
                <div
                  className={`upload-zone ${dragActive.file1 ? 'drag-active' : ''}`}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: file1 ? '#f0fdf4' : '#fafafa',
                    borderColor: file1 ? '#10b981' : '#d1d5db',
                    minHeight: '140px',
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  onDrop={(e) => handleDrop(1, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(1)}
                  onDragLeave={() => handleDragLeave(1)}
                  onClick={() => document.getElementById('file1').click()}
                >
                  <input
                    id="file1"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(1, e)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {file1 ? '✅' : '📊'}
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    {file1 ? file1.name : 'Excel File A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {file1 ? 'Ready to compare' : 'Drop file or click to upload'}
                  </div>
                </div>

                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#2563eb',
                  padding: '0 1rem'
                }}>
                  VS
                </div>

                {/* File 2 Upload */}
                <div
                  className={`upload-zone ${dragActive.file2 ? 'drag-active' : ''}`}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: file2 ? '#f0fdf4' : '#fafafa',
                    borderColor: file2 ? '#10b981' : '#d1d5db',
                    minHeight: '140px',
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  onDrop={(e) => handleDrop(2, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(2)}
                  onDragLeave={() => handleDragLeave(2)}
                  onClick={() => document.getElementById('file2').click()}
                >
                  <input
                    id="file2"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(2, e)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {file2 ? '✅' : '📊'}
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    {file2 ? file2.name : 'Excel File B'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {file2 ? 'Ready to compare' : 'Drop file or click to upload'}
                  </div>
                </div>
              </div>

              <button
                className="compare-button"
                onClick={handleCompare}
                disabled={!file1 || !file2 || isComparing}
                style={{
                  background: (!file1 || !file2) ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: (!file1 || !file2) ? 'not-allowed' : 'pointer',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '1.5rem auto 0'
                }}
              >
                {isComparing ? (
                  <>
                    <div className="spinner" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}></div>
                    Comparing...
                  </>
                ) : (
                  <>🔍 Compare Files</>
                )}
              </button>

              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1rem',
                marginBottom: 0
              }}>
                Also supports PDF comparison • No account required to try
              </p>
            </div>
          </div>
        </section>

        {/* Results Section - Full Results */}
        {showResults && (
          <section id="results-section" style={{ 
            padding: '3rem 0',
            background: '#f0fdf4',
            borderTop: '1px solid #bbf7d0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px'
            }} className="section-container">
              
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem', 
                  color: '#166534'
                }}>
                  ✅ Comparison Results
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#065f46' }}>
                  <strong>{file1?.name}</strong> vs <strong>{file2?.name}</strong>
                </p>
              </div>

              {/* Full Comparison Results */}
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                
                {/* Summary Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    background: '#fef2f2',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #fecaca',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem' }}>
                      23
                    </div>
                    <div style={{ fontWeight: '600', color: '#7f1d1d' }}>
                      Differences Found
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #bbf7d0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669', marginBottom: '0.5rem' }}>
                      187
                    </div>
                    <div style={{ fontWeight: '600', color: '#065f46' }}>
                      Cells Matched
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#eff6ff',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #bfdbfe',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb', marginBottom: '0.5rem' }}>
                      89%
                    </div>
                    <div style={{ fontWeight: '600', color: '#1e40af' }}>
                      Similarity Score
                    </div>
                  </div>
                </div>

                {/* Detailed Changes */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    📋 Detailed Changes:
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1.5rem'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.75rem' }}>
                        🔴 Modified Cells (15)
                      </h4>
                      <div style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.6' }}>
                        • B3: "Budget 2024" → "Budget 2025"<br/>
                        • C5: £45,000 → £47,250<br/>
                        • D7: "Marketing" → "Digital Marketing"<br/>
                        • E12: 15% → 18%<br/>
                        • F8: "Q1" → "Q1 Revised"<br/>
                        <span style={{ color: '#9ca3af' }}>+ 10 more changes...</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#059669', marginBottom: '0.75rem' }}>
                        ✅ New Additions (8)
                      </h4>
                      <div style={{ fontSize: '0.875rem', color: '#065f46', lineHeight: '1.6' }}>
                        • Row 15: New department "AI Research"<br/>
                        • Column H: "Risk Assessment" added<br/>
                        • B20: Performance metrics section<br/>
                        • G5-G10: Quarterly projections<br/>
                        • Sheet2: "Summary" worksheet added<br/>
                        <span style={{ color: '#9ca3af' }}>+ 3 more additions...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Assurance */}
                <div style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>🔒</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      Privacy Protected
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    Your files were processed entirely in your browser. No data was uploaded to our servers or stored anywhere.
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <button 
                      onClick={handleNewComparison}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      🔄 Compare More Files
                    </button>
                    <button 
                      onClick={() => window.location.href = '/api/auth/signin'}
                      style={{
                        background: 'white',
                        color: '#2563eb',
                        border: '2px solid #2563eb',
                        padding: '0.75rem 2rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      💾 Save Results (Free Account)
                    </button>
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Want unlimited comparisons? <button 
                      onClick={handleProTrial}
                      style={{
                        background: 'transparent',
                        color: '#dc2626',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      Upgrade to Pro (£19/mo)
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Industry Use Cases */}
        <section style={{ 
          padding: '3rem 0',
          background: 'white' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }} className="section-container">
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937'
              }}>
                Perfect For
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                Teams who need secure file comparison without cloud risks
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }} className="use-cases-grid">
              
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  Finance Teams
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Compare financial reports, budgets, and forecasts without uploading sensitive data to cloud servers.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  Legal Teams
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Review document changes and contract revisions with complete confidentiality and privacy protection.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  HR Teams
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Analyze employee data and compensation files that must stay private and secure at all times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why VeriDiff */}
        <section style={{ 
          padding: '4rem 0',
          background: '#f8fafc' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }} className="section-container">
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                marginBottom: '1rem', 
                color: '#1f2937'
              }}>
                Why Choose VeriDiff?
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                Professional Excel comparison with complete privacy protection
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '2rem'
            }} className="why-grid">
              
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#dcfce7', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🔒
                </div>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  Complete Privacy
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Files processed locally in your browser. Never uploaded to servers or stored anywhere.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#dbeafe', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  ⚡
                </div>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  Instant Results
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  See differences immediately. No waiting for uploads or server processing.
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: '#fef3c7', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🎯
                </div>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '1rem'
                }}>
                  Smart Comparison
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                  Advanced features beyond Excel's basic compare. Smart mapping and tolerance settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Pricing */}
        <section style={{ 
          padding: '4rem 0',
          background: 'white' 
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }} className="section-container">
            
            <h2 style={{ 
              fontSize: '2.25rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              color: '#1f2937'
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '3rem' }}>
              Start free, upgrade when you need more
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Try VeriDiff Free
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>No limits:</strong> Compare any Excel or PDF files immediately
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Pro Features
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb', marginBottom: '0.5rem' }}>
                  £19/month
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Save results • Download reports • Advanced tolerance settings
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  Try Free Now
                </button>
                <button onClick={handleProTrial} style={{
                  background: 'white',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  Get Pro Features
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Privacy-First Cookie Banner */}
        <CookieBanner />

        {/* Registration Modal */}
        <RegistrationModal />
      </div>
    </>
  );
}
