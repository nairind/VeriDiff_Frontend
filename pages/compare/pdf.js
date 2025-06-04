import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import PDF-specific utilities
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// Import PDF result component
import PdfResults from '../../components/PdfResults';

// ===== PDF FILE SIZE LIMITS =====
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const PDF_SIZE_LIMIT_TEXT = '100MB';

// ===== PDF-SPECIFIC COMPONENTS =====

// PDF Requirements Info Component
const PdfRequirementsInfo = () => {
  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #2563eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontSize: '0.9rem'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1rem' }}>
        📑 Supported PDF Files
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <strong>✅ Supported:</strong>
          <div>• .pdf files with extractable text</div>
          <div>• Multi-page documents</div>
          <div>• Text-based content</div>
          <div>• Standard PDF formats</div>
          <div>• Business contracts & reports</div>
          <div>• Academic papers & research</div>
        </div>
        <div>
          <strong>📏 Requirements:</strong>
          <div>• Maximum size: 100MB</div>
          <div>• Text-extractable PDFs only</div>
          <div>• No password-protected files</div>
          <div>• Standard PDF/A format preferred</div>
          <div>• Stable internet connection required</div>
        </div>
      </div>
    </div>
  );
};

// PDF Success Tips Component
const PdfSuccessTips = () => {
  const tips = [
    { label: 'Text-based PDFs work best:', tip: 'Avoid image-only PDF files for accurate comparison' },
    { label: 'Page-by-page analysis:', tip: 'Each page compared individually for detailed results' },
    { label: 'Large files supported:', tip: 'Up to 100MB for comprehensive documents' },
    { label: 'Real text extraction:', tip: 'Uses PDF.js for accurate text analysis' },
    { label: 'Professional use cases:', tip: 'Perfect for contracts, reports, and academic papers' },
    { label: 'Cross-platform compatibility:', tip: 'Works with PDFs from any source' }
  ];

  return (
    <div style={{
      background: '#f0fdf4',
      border: '1px solid #22c55e',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '1rem' }}>
        💡 Pro Tips for Best PDF Comparison Results
      </h4>
      <div style={{ fontSize: '0.9rem', color: '#166534' }}>
        {tips.map((tip, index) => (
          <div key={index}>
            • <strong>{tip.label}</strong> {tip.tip}
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced PDF Error Messages
const getPdfErrorMessage = (error, fileName) => {
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('too large')) {
    return {
      title: "📁 PDF File Too Large",
      message: `"${fileName}" exceeds our 100MB size limit.`,
      solutions: [
        "PDF files: Maximum 100MB supported",
        "Compress your PDF using online tools",
        "Split large documents into smaller sections",
        "Remove unnecessary images to reduce size",
        "Contact support for enterprise solutions"
      ]
    };
  }
  
  if (errorMsg.includes('pdf.js') || errorMsg.includes('pdfjslib') || errorMsg.includes('pdf processing')) {
    return {
      title: "📚 PDF Processing Error",
      message: `PDF processing service issue.`,
      solutions: [
        "Refresh the page and try again",
        "Check your internet connection is stable",
        "Disable ad blockers temporarily",
        "Try a different PDF file to test",
        "Clear browser cache and reload",
        "Contact support if the issue persists"
      ]
    };
  }
  
  if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
    return {
      title: "🔒 Protected PDF File",
      message: `"${fileName}" is password-protected.`,
      solutions: [
        "Remove password protection from the PDF",
        "Use an unprotected version of the document",
        "Contact the document owner for an unlocked version",
        "Use PDF editing software to remove restrictions"
      ]
    };
  }
  
  if (errorMsg.includes('corrupted') || errorMsg.includes('invalid pdf')) {
    return {
      title: "💾 Corrupted PDF File",
      message: `"${fileName}" appears to be corrupted or invalid.`,
      solutions: [
        "Try opening the PDF in a PDF reader first",
        "Re-download the PDF from the original source",
        "Use PDF repair tools if available",
        "Contact the document provider for a fresh copy"
      ]
    };
  }
  
  if (errorMsg.includes('text extraction') || errorMsg.includes('no text found')) {
    return {
      title: "📄 No Extractable Text",
      message: `"${fileName}" contains no extractable text.`,
      solutions: [
        "This PDF may be image-based or scanned",
        "Use OCR software to convert images to text",
        "Try a different PDF with selectable text",
        "Contact support for image-based PDF comparison options"
      ]
    };
  }
  
  // Generic fallback
  return {
    title: "⚠️ PDF Comparison Error",
    message: error.message,
    solutions: [
      "Ensure both files are valid PDF documents",
      "Check file size is within 100MB limit",
      "Try refreshing the page and uploading again",
      "Test with a different PDF file",
      "Contact support if the issue persists"
    ]
  };
};

// PDF Error Display Component
const PdfErrorDisplay = ({ error, fileName }) => {
  const errorInfo = getPdfErrorMessage(error, fileName || 'Unknown file');
  
  return (
    <div style={{
      background: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ fontSize: '2rem' }}>❌</div>
        <div>
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.3rem' }}>
            {errorInfo.title}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#7f1d1d', fontSize: '1rem' }}>
            {errorInfo.message}
          </p>
        </div>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #fca5a5'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1rem' }}>
          💡 How to Fix This:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
          {errorInfo.solutions.map((solution, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>{solution}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ===== PDF FILE READING UTILITY =====
const readPdfFile = (file) => {
  return new Promise((resolve, reject) => {
    console.log('📚 Reading PDF file:', file.name, 'Size:', file.size);
    
    if (!file) {
      reject(new Error('No PDF file provided'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('PDF file is empty'));
      return;
    }

    if (file.size > PDF_SIZE_LIMIT) {
      reject(new Error(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${PDF_SIZE_LIMIT_TEXT}.`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        console.log('✅ PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);
        resolve(arrayBuffer);
      } catch (error) {
        console.error('❌ PDF file reading error:', error);
        reject(new Error('Failed to process PDF file content'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      reject(new Error(`Failed to read PDF file "${file.name}". The file may be corrupted.`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// ===== ENHANCED PDF FILE UPLOAD COMPONENT =====
const PdfFileUpload = ({ fileNum, file, onChange }) => {
  const [validationWarning, setValidationWarning] = useState(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setValidationWarning(null);
    
    try {
      // Size validation
      if (selectedFile.size > PDF_SIZE_LIMIT) {
        setValidationWarning({
          type: 'error',
          message: `File is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB (max ${PDF_SIZE_LIMIT_TEXT} allowed for PDF files)`
        });
        return;
      }
      
      // Warning for large files (but still within limits)
      if (selectedFile.size > PDF_SIZE_LIMIT * 0.7) { // 70% of limit
        setValidationWarning({
          type: 'warning',
          message: `Large PDF file (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) - comparison may take longer`
        });
      }
      
      // File type validation
      const fileName = selectedFile.name.toLowerCase();
      const isValidPdf = fileName.endsWith('.pdf') || selectedFile.type === 'application/pdf';
      
      if (!isValidPdf) {
        setValidationWarning({
          type: 'error',
          message: `Please select a PDF file with .pdf extension`
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
      background: '#f0f9ff',
      padding: '25px',
      borderRadius: '16px',
      border: '2px solid #0ea5e9'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>PDF File {fileNum}</h3>
      
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        style={{
          width: '100%',
          padding: '14px',
          border: '2px solid rgba(255,255,255,0.8)',
          borderRadius: '10px',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.9)'
        }}
      />
      
      {/* File Status Display */}
      {file && !validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          color: '#166534',
          fontWeight: '600'
        }}>
          ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
        </div>
      )}
      
      {/* Validation Warnings */}
      {validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: validationWarning.type === 'error' ? '#fef2f2' : '#fffbeb',
          border: `2px solid ${validationWarning.type === 'error' ? '#dc2626' : '#f59e0b'}`,
          borderRadius: '8px',
          color: validationWarning.type === 'error' ? '#dc2626' : '#92400e',
          fontWeight: '500'
        }}>
          {validationWarning.type === 'error' ? '❌' : '⚠️'} {validationWarning.message}
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
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking'); // checking, loaded, failed
  
  // UI states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // PDF comparison options
  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    pageByPage: true,
    includeImages: false
  });

  // Enhanced PDF.js loading check
  const checkPDFJSLoading = () => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds total
    
    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`📚 PDF.js loading check attempt ${attempts}/${maxAttempts}`);
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js successfully loaded and ready');
        setPdfLoadingStatus('loaded');
        clearInterval(checkInterval);
        return;
      }
      
      if (window.pdfJsError) {
        console.error('❌ PDF.js loading error detected');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ PDF.js loading timeout after 30 seconds');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
    }, 1000); // Check every second
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
    
    // Start checking PDF.js loading after component mounts
    if (typeof window !== 'undefined') {
      // Small delay to let the scripts load
      setTimeout(() => {
        checkPDFJSLoading();
      }, 1000);
    }
  }, [session]);

  // ✅ UPDATED: Premium upgrade handlers to match index.js exactly
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

  const handleModalDismiss = () => {
    setShowPremiumModal(false);
  };

  // File handling
  const handleFileChange = (e, fileNum) => {
    // Block for free users
    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
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

    // Check PDF.js loading status
    if (pdfLoadingStatus !== 'loaded') {
      setError('PDF processing library is not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📚 Starting PDF comparison...');
      console.log('📚 Files:', { file1: file1.name, file2: file2.name });

      // Compare PDF files
      const result = await comparePDFFiles(file1, file2, pdfOptions);

      console.log('📚 PDF comparison completed:', result);
      setResults(result);
      
    } catch (err) {
      console.error('🚨 PDF COMPARISON ERROR:', err);
      console.error('🚨 ERROR STACK:', err.stack);
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

  // PDF Options Component with Loading Status
  const PdfOptionsComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        📑 PDF Comparison Options
      </h3>

      {/* PDF.js Loading Status */}
      {pdfLoadingStatus === 'checking' && (
        <div style={{
          background: '#fffbeb',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#92400e'
        }}>
          ⏳ Loading PDF processing engine... Please wait.
        </div>
      )}

      {pdfLoadingStatus === 'failed' && (
        <div style={{
          background: '#fef2f2',
          border: '2px solid #dc2626',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          ❌ PDF processing engine failed to load. Please refresh the page and try again.
        </div>
      )}

      {pdfLoadingStatus === 'loaded' && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#166534'
        }}>
          ✅ PDF processing engine ready!
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Comparison Mode
          </label>
          <select
            value={pdfOptions.compareMode}
            onChange={(e) => setPdfOptions({...pdfOptions, compareMode: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            disabled={pdfLoadingStatus !== 'loaded'}
          >
            <option value="text">Text content</option>
            <option value="visual">Visual appearance</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.ignoreFormatting}
              onChange={(e) => setPdfOptions({...pdfOptions, ignoreFormatting: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Ignore formatting</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.pageByPage}
              onChange={(e) => setPdfOptions({...pdfOptions, pageByPage: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Page-by-page comparison</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: pdfLoadingStatus === 'loaded' ? 'pointer' : 'not-allowed' }}>
            <input
              type="checkbox"
              checked={pdfOptions.includeImages}
              onChange={(e) => setPdfOptions({...pdfOptions, includeImages: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            <span>Include images</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleComparePdfs}
        disabled={loading || pdfLoadingStatus !== 'loaded'}
        style={{
          background: loading || pdfLoadingStatus !== 'loaded' ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading || pdfLoadingStatus !== 'loaded' ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Comparing PDFs...' : pdfLoadingStatus !== 'loaded' ? 'PDF Engine Loading...' : '🚀 Compare PDF Documents'}
      </button>
    </div>
  );

  // Premium Modal Component
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
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: '600' }}>
            🚀 Premium PDF Comparison
          </h3>
          <p style={{ marginBottom: '20px' }}>
            Professional PDF comparison requires premium access. Perfect for contracts, 
            reports, legal documents, and academic papers.
          </p>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>Premium PDF Features:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534' }}>
              <li>Advanced text extraction with PDF.js</li>
              <li>Page-by-page detailed comparison</li>
              <li>Large file support (up to 100MB)</li>
              <li>Professional formatting options</li>
              <li>Enterprise-grade reliability</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePremiumUpgrade}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Upgrade to Premium
            </button>
            <button
              onClick={handleModalDismiss}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '10px 20px',
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
          
          {/* ENHANCED PDF.js Loading with Multiple CDN Fallbacks */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🔧 Starting enhanced PDF.js loading process...');
                
                // Try multiple CDN sources
                const pdfSources = [
                  {
                    lib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
                    worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  }
                ];
                
                let currentSourceIndex = 0;
                
                function loadPDFJS() {
                  if (currentSourceIndex >= pdfSources.length) {
                    console.error('❌ All PDF.js sources failed to load');
                    window.pdfJsError = true;
                    return;
                  }
                  
                  const source = pdfSources[currentSourceIndex];
                  console.log(\`📚 Attempting to load PDF.js from source \${currentSourceIndex + 1}/\${pdfSources.length}\`);
                  
                  const script = document.createElement('script');
                  script.src = source.lib;
                  
                  script.onload = function() {
                    console.log(\`✅ PDF.js library loaded from source \${currentSourceIndex + 1}\`);
                    
                    // Wait a bit for pdfjsLib to be available
                    setTimeout(function() {
                      if (typeof window.pdfjsLib !== 'undefined') {
                        try {
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
                          window.pdfJsReady = true;
                          console.log('✅ PDF.js worker configured and ready');
                        } catch (error) {
                          console.error('❌ PDF.js worker configuration failed:', error);
                          window.pdfJsError = true;
                        }
                      } else {
                        console.error('❌ PDF.js library object not available');
                        currentSourceIndex++;
                        loadPDFJS();
                      }
                    }, 500);
                  };
                  
                  script.onerror = function() {
                    console.warn(\`⚠️ PDF.js source \${currentSourceIndex + 1} failed, trying next...\`);
                    currentSourceIndex++;
                    loadPDFJS();
                  };
                  
                  document.head.appendChild(script);
                }
                
                // Start loading process when DOM is ready
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

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px'
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
            borderRadius: '20px',
            marginBottom: '40px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 15px 0'
            }}>
              📑 Professional PDF Comparison
            </h1>
            <p style={{
              fontSize: '1.2rem',
              opacity: '0.9',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Advanced PDF document comparison for contracts, reports, legal documents, and academic papers. 
              Enterprise-grade text extraction with detailed page-by-page analysis.
            </p>
            
            {/* Use Case Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '25px'
            }}>
              {['Legal Contracts', 'Business Reports', 'Academic Papers', 'Technical Manuals'].map((useCase) => (
                <span key={useCase} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {useCase}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements and Tips */}
          <PdfRequirementsInfo />
          <PdfSuccessTips />

          {/* File Upload Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px',
              marginBottom: '35px'
            }}>
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

            {/* Load Files Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleLoadPdfs} 
                disabled={loading || !file1 || !file2 || userTier !== 'premium'}
                style={{
                  background: loading || !file1 || !file2 || userTier !== 'premium'
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading || !file1 || !file2 || userTier !== 'premium' ? 'not-allowed' : 'pointer',
                  minWidth: '200px'
                }}
              >
                {loading ? 'Loading...' : userTier !== 'premium' ? '🔒 Premium Required' : '📑 Load PDF Files'}
              </button>
            </div>
          </div>

          {/* PDF Options */}
          {showPdfOptions && userTier === 'premium' && <PdfOptionsComponent />}

          {/* Error Display */}
          {error && (
            <PdfErrorDisplay 
              error={new Error(error)} 
              fileName={file1?.name || file2?.name} 
            />
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              margin: '20px 0',
              padding: '20px',
              background: '#eff6ff',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              color: '#1e40af',
              fontSize: '1rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              <strong>Processing PDF Documents...</strong> Please wait while we extract and analyze the text content...
            </div>
          )}

          {/* Results */}
          {results && (
            <PdfResults 
              results={results} 
              file1Name={file1?.name} 
              file2Name={file2?.name} 
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
