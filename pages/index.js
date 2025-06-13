import React, { useState, useEffect } from 'react';

export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  useEffect(() => {
    // Simple analytics - just console log for now
    console.log('Page view: home');
  }, []);

  const handleAcceptCookies = () => {
    setShowCookieBanner(false);
    // In real implementation: localStorage.setItem('veridiff_cookies_accepted', 'true');
  };

  const handleDeclineCookies = () => {
    setShowCookieBanner(false);
    // In real implementation: localStorage.setItem('veridiff_cookies_accepted', 'essential_only');
  };

  // File type detection helper
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls', 'xlsm'].includes(extension)) return 'excel';
    if (extension === 'csv') return 'csv';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const handleFilesReady = async ({ file1, file2 }) => {
    try {
      // Detect file types
      const file1Type = getFileType(file1.name);
      const file2Type = getFileType(file2.name);
      
      console.log('🔍 File types detected:', { file1Type, file2Type });

      // Route based on file type combination
      if (file1Type === 'pdf' && file2Type === 'pdf') {
        console.log('📕 Routing to PDF comparison...');
        window.location.href = '/pdf-comparison';
        
      } else if (['excel', 'csv'].includes(file1Type) && ['excel', 'csv'].includes(file2Type)) {
        console.log('📊 Routing to Excel/CSV comparison...');
        window.location.href = '/excel-csv-comparison';
        
      } else {
        // Handle invalid file type combinations
        let errorMessage = '';
        
        if (file1Type === 'unknown' || file2Type === 'unknown') {
          errorMessage = 'Unsupported file type detected. Please upload PDF, Excel (.xlsx/.xls), or CSV files only.';
        } else if ((file1Type === 'pdf' && file2Type !== 'pdf') || (file1Type !== 'pdf' && file2Type === 'pdf')) {
          errorMessage = 'Cannot mix PDF with other file types. Please upload two PDF files or two data files (Excel/CSV).';
        } else {
          errorMessage = `Unexpected file combination: ${file1Type} and ${file2Type}. Please contact support.`;
        }
        
        console.error('❌ Invalid file combination:', { file1Type, file2Type });
        alert(errorMessage);
      }
      
    } catch (error) {
      console.error('Error navigating to comparison:', error);
      alert('Error proceeding to comparison. Please try again.');
    }
  };

  return (
    <>
      <style jsx>{`
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
        
        @media (max-width: 768px) {
          .upload-container { flex-direction: column !important; gap: 1rem !important; }
          .upload-zone { min-height: 120px !important; }
          .compare-button { width: 100% !important; margin-top: 1rem !important; }
          .partnership-header { font-size: 0.75rem !important; padding: 0.5rem 0 !important; }
          .partnership-header .desktop-only { display: none !important; }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937',
        background: '#f8fafc'
      }}>
        
        {/* Partnership Header */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderBottom: '2px solid #f59e0b',
          padding: '0.75rem 0',
          textAlign: 'center'
        }} className="partnership-header">
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#92400e',
              fontWeight: '600'
            }}>
              🎯 Get 6 Months Free + Shape the future of data comparison
              <span className="desktop-only" style={{ marginLeft: '1rem', opacity: 0.8 }}>
                • Partnership Program ends July 11th, 2025
              </span>
            </p>
          </div>
        </div>

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
              
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Professional File Comparison
              </div>
            </div>
          </div>
        </header>

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
              🔒 All file processing happens locally in your browser - your data never leaves your device
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
          }}>
            
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              lineHeight: '1.2', 
              color: '#1f2937' 
            }}>
              Professional File Comparison
              <span style={{ 
                display: 'block', 
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Made Simple
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
            }}>
              Compare Excel, CSV, and mixed file formats with enterprise-grade features. Smart mapping, tolerance settings, and detailed analysis.
            </p>

            {/* Upload Interface */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <UploadZone onFilesReady={handleFilesReady} />

              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '1.5rem',
                marginBottom: 0
              }}>
                Supports: Excel ↔ Excel • CSV ↔ CSV • Excel ↔ CSV cross-format • PDF ↔ PDF
              </p>
            </div>
          </div>
        </section>

        {/* Why Your Expertise Matters */}
        <section style={{
          padding: '4rem 0',
          background: 'white'
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
              Why Your Professional Expertise Matters
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              We're building VeriDiff for professionals who understand the critical importance of accurate data comparison. 
              Your real-world experience with Excel files, CSV data, and document analysis is exactly what we need to 
              create a market-leading solution.
            </p>

            <p style={{
              fontSize: '1.2rem',
              color: '#6b7280',
              lineHeight: '1.7'
            }}>
              Every comparison you run, every edge case you encounter, and every suggestion you share helps us build 
              features that matter for professional workflows. This isn't just testing—it's collaborative development 
              with industry experts.
            </p>
          </div>
        </section>

        {/* What You Get in Return */}
        <section style={{
          padding: '4rem 0',
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
              What You Get in Return
            </h2>

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '1rem'
              }}>
                6 Months Individual Plan Free (£114 Value)
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Enterprise competitors charge £150-300 for similar 6-month access. You get VeriDiff's advanced features completely free.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                textAlign: 'left'
              }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                    ✓ Unlimited comparisons
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>No restrictions on usage</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                    ✓ Cross-format support
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>Excel ↔ CSV ↔ PDF</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                    ✓ Professional reports
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>HTML & Excel exports</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                    ✓ Priority support
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>Direct developer access</p>
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              No credit card required. No complex signup process. Just share meaningful feedback from your real-world usage.
            </p>
          </div>
        </section>

        {/* How Your Feedback Shapes Development */}
        <section style={{
          padding: '4rem 0',
          background: 'white'
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
              How Your Feedback Shapes Development
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem'
            }}>
              This isn't traditional beta testing. We're building VeriDiff's roadmap based on real professional needs. 
              Your feedback directly influences which features we prioritize and how we implement them.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Feature Requests
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Your workflow needs become our development priorities
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔧</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Usability Improvements
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Interface refinements based on professional usage patterns
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Performance Optimization
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.5' }}>
                  Speed and accuracy improvements for your specific file types
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Details */}
        <section style={{
          padding: '4rem 0',
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
              Partnership Program Details
            </h2>

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1.5rem'
              }}>
                How It Works
              </h3>
              
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  color: '#6b7280'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600', minWidth: '20px' }}>1.</span>
                  <span>Use VeriDiff for your real work - unlimited comparisons, all features unlocked</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  color: '#6b7280'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600', minWidth: '20px' }}>2.</span>
                  <span>Share feedback through the in-app system when you encounter interesting cases</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  color: '#6b7280'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600', minWidth: '20px' }}>3.</span>
                  <span>Get 6 months Individual Plan free after providing meaningful insights</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  fontSize: '1rem',
                  color: '#6b7280'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600', minWidth: '20px' }}>4.</span>
                  <span>Continue using VeriDiff with full access while we build features you've influenced</span>
                </li>
              </ul>

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  <strong style={{ color: '#1f2937' }}>Program ends:</strong> July 11th, 2025<br/>
                  <strong style={{ color: '#1f2937' }}>Commitment:</strong> Use the tool for real work, share honest feedback<br/>
                  <strong style={{ color: '#1f2937' }}>Time investment:</strong> Whatever you're comfortable with - no minimums
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ 
          background: '#111827', 
          color: 'white', 
          padding: '3rem 0' 
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              marginBottom: '2rem' 
            }}>
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

        {/* Cookie Banner */}
        {showCookieBanner && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '2px solid #2563eb',
            padding: '1rem 20px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#374151',
                  lineHeight: '1.5'
                }}>
                  🔒 <strong>Privacy-First:</strong> We use minimal cookies for essential functionality only. 
                  No tracking, no data collection. Your files never leave your browser. 
                  <a href="/cookies" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '0.25rem' }}>
                    View Cookie Policy
                  </a>
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <button onClick={handleDeclineCookies} style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  color: '#6b7280',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}>
                  Essential Only
                </button>
                <button onClick={handleAcceptCookies} style={{
                  background: '#2563eb',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Accept All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Upload Zone Component
const UploadZone = ({ onFilesReady }) => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, fileNumber) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (fileNumber === 1) {
        setFile1(files[0]);
      } else {
        setFile2(files[0]);
      }
    }
  };

  const handleFileSelect = (e, fileNumber) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (fileNumber === 1) {
        setFile1(files[0]);
      } else {
        setFile2(files[0]);
      }
    }
  };

  const handleCompare = () => {
    if (file1 && file2) {
      onFilesReady({ file1, file2 });
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls', 'xlsm'].includes(ext)) return '📊';
    if (ext === 'csv') return '📋';
    if (ext === 'pdf') return '📕';
    return '📄';
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }} className="upload-container">
        
        {/* File 1 Upload */}
        <div
          style={{
            flex: '1',
            minWidth: '250px',
            maxWidth: '400px',
            minHeight: '140px',
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: file1 ? '#f0f9ff' : dragActive ? '#eff6ff' : '#f9fafb',
            borderColor: file1 ? '#2563eb' : dragActive ? '#2563eb' : '#d1d5db',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          className="upload-zone"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 1)}
          onClick={() => document.getElementById('file1').click()}
        >
          <input
            id="file1"
            type="file"
            accept=".xlsx,.xls,.xlsm,.csv,.pdf"
            onChange={(e) => handleFileSelect(e, 1)}
            style={{ display: 'none' }}
          />
          
          {file1 ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {getFileIcon(file1.name)}
              </div>
              <p style={{ 
                margin: 0, 
                fontWeight: '500', 
                color: '#2563eb',
                fontSize: '0.9rem',
                wordBreak: 'break-word'
              }}>
                {file1.name}
              </p>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.75rem', 
                color: '#6b7280' 
              }}>
                Click to change
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
              <p style={{ margin: 0, fontWeight: '500', color: '#6b7280' }}>
                Drop first file here
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                or click to browse
              </p>
            </>
          )}
        </div>

        {/* File 2 Upload */}
        <div
          style={{
            flex: '1',
            minWidth: '250px',
            maxWidth: '400px',
            minHeight: '140px',
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: file2 ? '#f0f9ff' : dragActive ? '#eff6ff' : '#f9fafb',
            borderColor: file2 ? '#2563eb' : dragActive ? '#2563eb' : '#d1d5db',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          className="upload-zone"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 2)}
          onClick={() => document.getElementById('file2').click()}
        >
          <input
            id="file2"
            type="file"
            accept=".xlsx,.xls,.xlsm,.csv,.pdf"
            onChange={(e) => handleFileSelect(e, 2)}
            style={{ display: 'none' }}
          />
          
          {file2 ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {getFileIcon(file2.name)}
              </div>
              <p style={{ 
                margin: 0, 
                fontWeight: '500', 
                color: '#2563eb',
                fontSize: '0.9rem',
                wordBreak: 'break-word'
              }}>
                {file2.name}
              </p>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.75rem', 
                color: '#6b7280' 
              }}>
                Click to change
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
              <p style={{ margin: 0, fontWeight: '500', color: '#6b7280' }}>
                Drop second file here
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                or click to browse
              </p>
            </>
          )}
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={!file1 || !file2}
        style={{
          background: file1 && file2 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e5e7eb',
          color: file1 && file2 ? 'white' : '#9ca3af',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: file1 && file2 ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          boxShadow: file1 && file2 ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none',
          minWidth: '200px'
        }}
        className="compare-button"
      >
        {file1 && file2 ? 'Compare Files' : 'Select Both Files'}
      </button>
    </div>
  );
};
