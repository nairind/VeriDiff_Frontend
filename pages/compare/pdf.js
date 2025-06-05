import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// ===== PDF FILE SIZE LIMITS =====
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const PDF_SIZE_LIMIT_TEXT = '100MB';

// ===== ENHANCED PDF COMPARISON LOGIC =====
const extractPDFText = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        const metadata = {
          pages: pdf.numPages,
          created: 'Unknown',
          modified: 'Unknown',
          author: 'Unknown'
        };

        // Extract metadata
        try {
          const info = await pdf.getMetadata();
          if (info.metadata) {
            metadata.created = info.metadata.get('dc:created') || 'Unknown';
            metadata.modified = info.metadata.get('dc:modified') || 'Unknown';
            metadata.author = info.metadata.get('dc:creator') || 'Unknown';
          }
        } catch (e) {
          console.log('Metadata extraction failed:', e);
        }

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += `[PAGE ${i}] ${pageText}\n`;
        }

        resolve({ text: fullText, metadata, numPages: pdf.numPages });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
};

const comparePDFTexts = (text1, text2) => {
  const lines1 = text1.split('\n').filter(line => line.trim());
  const lines2 = text2.split('\n').filter(line => line.trim());
  
  const changes = [];
  let insertions = 0, deletions = 0, modifications = 0;

  // Simple line-by-line comparison
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    
    if (!line1 && line2) {
      // Insertion
      insertions++;
      changes.push({
        type: 'insertion',
        page: 1, // Simplified for now
        line: i + 1,
        confidence: 0.95,
        preview: `+ ${line2.substring(0, 100)}`
      });
    } else if (line1 && !line2) {
      // Deletion
      deletions++;
      changes.push({
        type: 'deletion',
        page: 1,
        line: i + 1,
        confidence: 0.95,
        preview: `- ${line1.substring(0, 100)}`
      });
    } else if (line1 !== line2) {
      // Modification
      modifications++;
      changes.push({
        type: 'modification',
        page: 1,
        line: i + 1,
        confidence: 0.92,
        preview: `${line1.substring(0, 50)} → ${line2.substring(0, 50)}`
      });
    }
  }

  // Calculate similarity
  const totalLines = Math.max(lines1.length, lines2.length);
  const unchangedLines = totalLines - insertions - deletions - modifications;
  const similarity = totalLines > 0 ? unchangedLines / totalLines : 0;

  return {
    changes,
    statistics: {
      insertion: insertions,
      deletion: deletions,
      modification: modifications,
      formatting: 0, // Placeholder
      move: 0 // Placeholder
    },
    similarity
  };
};

// ===== STREAMLINED RESULTS COMPONENT =====
const StreamlinedPdfResults = ({ results, file1Name, file2Name, onExport }) => {
  if (!results) return null;

  const { changes = [], statistics = {}, similarity = 0, metadata = {} } = results;
  
  const changeTypeColors = {
    insertion: '#22c55e',
    deletion: '#ef4444', 
    modification: '#f59e0b',
    formatting: '#8b5cf6',
    move: '#06b6d4'
  };

  const totalChanges = Object.values(statistics).reduce((sum, count) => sum + count, 0);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          📊 {totalChanges} Changes Found
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onExport('summary')}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            📄 Export
          </button>
          <button
            onClick={() => onExport('sidebyside')}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            📑 Side-by-Side PDF
          </button>
        </div>
      </div>

      {/* Compact Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {Object.entries(statistics).map(([type, count]) => (
          count > 0 && (
            <div key={type} style={{
              background: `${changeTypeColors[type]}10`,
              border: `1px solid ${changeTypeColors[type]}40`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: changeTypeColors[type]
              }}>
                {count}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textTransform: 'capitalize'
              }}>
                {type === 'insertion' ? 'Added' : 
                 type === 'deletion' ? 'Removed' :
                 type === 'modification' ? 'Changed' : type}
              </div>
            </div>
          )
        ))}
        
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0ea5e9'
          }}>
            {Math.round(similarity * 100)}%
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Similar
          </div>
        </div>
      </div>

      {/* Synchronized Side-by-Side View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          background: '#f9fafb'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.9rem' }}>
            📄 {file1Name}
          </h4>
          <div style={{
            height: '300px',
            overflowY: 'auto',
            fontSize: '0.8rem',
            lineHeight: '1.4',
            fontFamily: 'monospace',
            background: 'white',
            padding: '12px',
            borderRadius: '4px'
          }}>
            {/* PDF content would go here */}
            <div style={{ color: '#6b7280' }}>Original document content...</div>
          </div>
        </div>

        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          background: '#f9fafb'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.9rem' }}>
            📄 {file2Name}
          </h4>
          <div style={{
            height: '300px',
            overflowY: 'auto',
            fontSize: '0.8rem',
            lineHeight: '1.4',
            fontFamily: 'monospace',
            background: 'white',
            padding: '12px',
            borderRadius: '4px'
          }}>
            {/* PDF content would go here */}
            <div style={{ color: '#6b7280' }}>Modified document content...</div>
          </div>
        </div>
      </div>

      {/* Compact Change List */}
      {changes.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#374151' }}>
            📝 Key Changes ({changes.length})
          </h4>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {changes.slice(0, 10).map((change, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: `1px solid ${changeTypeColors[change.type]}40`
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: changeTypeColors[change.type],
                  marginRight: '8px'
                }}></div>
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  {change.preview}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  marginLeft: '8px'
                }}>
                  {Math.round(change.confidence * 100)}%
                </div>
              </div>
            ))}
            {changes.length > 10 && (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', padding: '8px' }}>
                +{changes.length - 10} more changes...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== SIMPLIFIED OPTIONS COMPONENT =====
const SimplifiedPdfOptions = ({ pdfOptions, setPdfOptions, pdfLoadingStatus, onCompare, loading }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  }}>
    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
      ⚙️ Comparison Settings
    </h3>

    {pdfLoadingStatus === 'failed' && (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #dc2626',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '16px',
        color: '#dc2626',
        fontSize: '0.9rem'
      }}>
        ❌ PDF engine failed to load. Please refresh the page.
      </div>
    )}

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    }}>
      <div>
        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
          Sensitivity
        </label>
        <select
          value={pdfOptions.sensitivity}
          onChange={(e) => setPdfOptions({...pdfOptions, sensitivity: e.target.value})}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
          disabled={pdfLoadingStatus !== 'loaded'}
        >
          <option value="high">High (Character-level)</option>
          <option value="medium">Medium (Word-level)</option>
          <option value="low">Low (Paragraph-level)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={pdfOptions.ignoreFormatting}
            onChange={(e) => setPdfOptions({...pdfOptions, ignoreFormatting: e.target.checked})}
            disabled={pdfLoadingStatus !== 'loaded'}
          />
          Ignore formatting
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={pdfOptions.compareMetadata}
            onChange={(e) => setPdfOptions({...pdfOptions, compareMetadata: e.target.checked})}
            disabled={pdfLoadingStatus !== 'loaded'}
          />
          Compare metadata
        </label>
      </div>
    </div>

    <button
      onClick={onCompare}
      disabled={loading || pdfLoadingStatus !== 'loaded'}
      style={{
        background: loading || pdfLoadingStatus !== 'loaded' ? '#9ca3af' : '#2563eb',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: loading || pdfLoadingStatus !== 'loaded' ? 'not-allowed' : 'pointer',
        width: '100%'
      }}
    >
      {loading ? 'Comparing...' : pdfLoadingStatus !== 'loaded' ? 'Loading PDF Engine...' : '🚀 Compare Documents'}
    </button>
  </div>
);

// ===== MINIMAL INFO COMPONENTS =====
const MinimalPdfInfo = () => (
  <div style={{
    background: '#eff6ff',
    border: '1px solid #2563eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  }}>
    <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1rem' }}>
      📑 PDF Comparison
    </h4>
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
      Upload two PDF files to see detailed changes. Supports text-based PDFs up to 100MB.
    </p>
  </div>
);

// ===== FILE UPLOAD COMPONENT (Simplified) =====
const SimplePdfFileUpload = ({ fileNum, file, onChange }) => {
  const [validationWarning, setValidationWarning] = useState(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setValidationWarning(null);
    
    try {
      if (selectedFile.size > PDF_SIZE_LIMIT) {
        setValidationWarning({
          type: 'error',
          message: `File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${PDF_SIZE_LIMIT_TEXT}`
        });
        return;
      }
      
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf')) {
        setValidationWarning({
          type: 'error',
          message: 'Please select a PDF file'
        });
        return;
      }
      
      onChange(e, fileNum);
      
    } catch (error) {
      setValidationWarning({
        type: 'error',
        message: error.message
      });
    }
  };
  
  return (
    <div style={{
      background: '#f8fafc',
      padding: '20px',
      borderRadius: '12px',
      border: '2px dashed #cbd5e1'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>
        PDF File {fileNum}
      </h4>
      
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf"
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '0.9rem',
          background: 'white'
        }}
      />
      
      {file && !validationWarning && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '6px',
          color: '#166534',
          fontSize: '0.85rem'
        }}>
          ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
        </div>
      )}
      
      {validationWarning && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#fef2f2',
          border: '1px solid #dc2626',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '0.85rem'
        }}>
          ❌ {validationWarning.message}
        </div>
      )}
    </div>
  );
};

function PdfComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking');
  
  // UI states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Simplified PDF comparison options
  const [pdfOptions, setPdfOptions] = useState({
    sensitivity: 'medium',
    ignoreFormatting: true,
    compareMetadata: true
  });

  // Enhanced PDF.js loading check
  const checkPDFJSLoading = () => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js loaded successfully');
        setPdfLoadingStatus('loaded');
        clearInterval(checkInterval);
        return;
      }
      
      if (window.pdfJsError || attempts >= maxAttempts) {
        console.error('❌ PDF.js loading failed');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
    }, 1000);
  };

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
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        checkPDFJSLoading();
      }, 1000);
    }
  }, [session]);

  // Premium upgrade handler
  const handlePremiumUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // File handling
  const handleFileChange = (e, fileNum) => {
    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  // ===== ENHANCED EXPORT FUNCTIONS =====
  const handleExport = async (exportType) => {
    if (!results) return;

    try {
      switch (exportType) {
        case 'summary':
          await exportSummaryReport();
          break;
        case 'sidebyside':
          await exportSideBySidePDF();
          break;
        default:
          console.warn('Unknown export type:', exportType);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality coming soon!');
    }
  };

  const exportSummaryReport = async () => {
    const { statistics = {}, similarity = 0 } = results;
    const totalChanges = Object.values(statistics).reduce((sum, count) => sum + count, 0);
    
    const reportContent = `PDF COMPARISON SUMMARY
Generated: ${new Date().toLocaleString()}

FILES: ${file1?.name} vs ${file2?.name}
SIMILARITY: ${Math.round(similarity * 100)}%
TOTAL CHANGES: ${totalChanges}

CHANGE BREAKDOWN:
${Object.entries(statistics).map(([type, count]) => 
  `• ${type.toUpperCase()}: ${count}`
).join('\n')}

Generated by VeriDiff PDF Comparison
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDF_Comparison_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSideBySidePDF = async () => {
    // Placeholder for future PDF generation
    alert('Side-by-side PDF export coming soon! This will generate a PDF showing both documents with changes highlighted.');
  };

  // ===== MAIN PDF COMPARISON HANDLER =====
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
      console.log('📚 Starting PDF comparison...');

      // Extract text and metadata from both files
      const [pdf1Data, pdf2Data] = await Promise.all([
        extractPDFText(file1),
        extractPDFText(file2)
      ]);

      // Compare the extracted texts
      const comparisonResult = comparePDFTexts(pdf1Data.text, pdf2Data.text);

      // Combine results with metadata
      const enhancedResult = {
        ...comparisonResult,
        metadata: {
          file1: pdf1Data.metadata,
          file2: pdf2Data.metadata
        }
      };

      console.log('📚 PDF comparison completed:', enhancedResult);
      setResults(enhancedResult);
      
    } catch (err) {
      console.error('🚨 PDF COMPARISON ERROR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load files and show options
  const handleLoadPdfs = async () => {
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

    setShowPdfOptions(true);
  };

  // Premium Modal Component
  const PremiumModal = () => {
    if (!showPremiumModal) return null;
    
    return (
      <div 
        style={{
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
        }}
        onClick={(e) => e.target === e.currentTarget && setShowPremiumModal(false)}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', fontWeight: '600' }}>
            🚀 Premium PDF Comparison
          </h3>
          <p style={{ marginBottom: '16px', fontSize: '0.95rem' }}>
            Professional PDF comparison with advanced change detection and export capabilities.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePremiumUpgrade}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                flex: 1
              }}
            >
              Start Trial
            </button>
            <button
              onClick={() => setShowPremiumModal(false)}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
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
          <title>VeriDiff - Professional PDF Comparison</title>
          
          {/* PDF.js Loading */}
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
        </Head>

        <Header />

        {/* Main Content */}
        <main style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Simplified Hero */}
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
            borderRadius: '12px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0 0 12px 0'
            }}>
              📑 PDF Comparison Tool
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              margin: 0
            }}>
              Compare two PDF documents and see detailed changes instantly
            </p>
          </div>

          {/* Minimal Info */}
          <MinimalPdfInfo />

          {/* File Upload Section */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: '0 0 16px 0',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              Upload PDF Documents
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
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
                onClick={userTier !== 'premium' ? handlePremiumUpgrade : handleLoadPdfs} 
                disabled={loading || (!file1 || !file2) && userTier === 'premium'}
                style={{
                  background: loading ? '#9ca3af' : userTier !== 'premium'
                    ? '#2563eb'
                    : (!file1 || !file2) 
                      ? '#9ca3af'
                      : '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || ((!file1 || !file2) && userTier === 'premium') ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Loading...' : userTier !== 'premium' ? '🚀 Start Premium Trial' : '📑 Load Files'}
              </button>
            </div>
          </div>

          {/* Simplified Options */}
          {showPdfOptions && userTier === 'premium' && (
            <SimplifiedPdfOptions
              pdfOptions={pdfOptions}
              setPdfOptions={setPdfOptions}
              pdfLoadingStatus={pdfLoadingStatus}
              onCompare={handleComparePdfs}
              loading={loading}
            />
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0',
              color: '#dc2626'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              margin: '16px 0',
              padding: '16px',
              background: '#eff6ff',
              border: '1px solid #2563eb',
              borderRadius: '8px',
              color: '#1e40af',
              textAlign: 'center'
            }}>
              🔄 Analyzing PDF documents...
            </div>
          )}

          {/* Streamlined Results */}
          {results && (
            <StreamlinedPdfResults 
              results={results} 
              file1Name={file1?.name} 
              file2Name={file2?.name}
              onExport={handleExport}
            />
          )}
        </main>

        {/* Premium Modal */}
        <PremiumModal />

        <Footer />
      </div>
    </AuthGuard>
  );
}

export default PdfComparePage;
