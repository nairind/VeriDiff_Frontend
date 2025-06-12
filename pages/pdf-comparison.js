// /pages/pdf-comparison.js - PDF ONLY (WITH DEBUG AND FEEDBACK FIX)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { comparePDFFiles, setProgressCallback } from '../utils/pdfFileComparison1';

export default function PDFComparison() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // PDF specific state
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    stage: '',
    progress: 0,
    message: '',
    isActive: false
  });
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    pageByPage: true,
    includeImages: false
  });

  useEffect(() => {
    loadFileData();
    
    // Set up progress callback for large PDF processing
    setProgressCallback((progressData) => {
      setProcessingProgress({
        ...progressData,
        isActive: true
      });
    });

    // Cleanup progress callback on unmount
    return () => {
      setProgressCallback(null);
    };
  }, []);

  const loadFileData = async () => {
    try {
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');

      if (!file1Info || !file2Info) {
        router.push('/');
        return;
      }

      // Verify these are PDF files
      if (!file1Info.name.toLowerCase().endsWith('.pdf') || !file2Info.name.toLowerCase().endsWith('.pdf')) {
        setError('This page is for PDF comparison only. Please upload PDF files.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Check if files are large (50MB+)
      const totalSize = (file1Info.size + file2Info.size) / 1024 / 1024;
      const isLarge = totalSize > 50 || file1Info.size > 25 * 1024 * 1024 || file2Info.size > 25 * 1024 * 1024;
      setIsLargeFile(isLarge);

      if (isLarge) {
        // Estimate processing time for large files
        const estimatedMinutes = Math.ceil(totalSize / 10); // Rough estimate: 10MB per minute
        setEstimatedTime(estimatedMinutes);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Error loading PDF file data:', error);
      setError('Failed to load PDF file data. Please try uploading again.');
      setIsLoading(false);
    }
  };

  const handlePDFComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProcessingProgress({
        stage: 'Initialization',
        progress: 0,
        message: 'Preparing for PDF comparison...',
        isActive: true
      });

      console.log('🔍 Starting enhanced PDF comparison process...');

      // Enhanced PDF.js availability check
      if (typeof window === 'undefined' || !window.pdfjsLib) {
        throw new Error(
          'PDF Processing Engine Not Ready\n\n' +
          'The PDF processing library is not available.\n\n' +
          'For large PDF files, please:\n' +
          '• Refresh the page and wait 1-2 minutes\n' +
          '• Ensure stable internet connection\n' +
          '• Close other browser tabs to free memory\n' +
          '• Try using Chrome or Firefox for best large file support\n\n' +
          'If the problem persists, the PDF processing service may be temporarily unavailable.'
        );
      }

      if (window.pdfJsError) {
        throw new Error(
          window.pdfJsErrorMessage || 
          'PDF Processing Engine Failed\n\n' +
          'The PDF processing library encountered an error.\n\n' +
          'For large files, this often indicates memory or network issues.\n' +
          'Please refresh the page and ensure sufficient system resources.'
        );
      }

      // Load PDF file data
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');

      if (!file1Data || !file2Data) {
        throw new Error(
          'PDF File Data Missing\n\n' +
          'The uploaded PDF files are no longer available in memory.\n\n' +
          'For large files (50MB+), this can happen due to:\n' +
          '• Browser memory limitations\n' +
          '• Session timeout\n' +
          '• File size exceeding browser storage limits\n\n' +
          'Please return to upload page and try:\n' +
          '• Uploading smaller files (under 50MB each)\n' +
          '• Using files with fewer pages\n' +
          '• Closing other browser tabs before uploading'
        );
      }

      console.log('📁 Converting large file data for PDF processing...');
      setProcessingProgress({
        stage: 'File Preparation',
        progress: 5,
        message: 'Converting file data for processing...',
        isActive: true
      });

      let file1Binary, file2Binary;
      
      try {
        file1Binary = Uint8Array.from(atob(file1Data), c => c.charCodeAt(0));
        file2Binary = Uint8Array.from(atob(file2Data), c => c.charCodeAt(0));
        
        const size1 = (file1Binary.length/1024/1024).toFixed(1);
        const size2 = (file2Binary.length/1024/1024).toFixed(1);
        console.log(`📊 Large file sizes: ${size1}MB, ${size2}MB`);
        
        setProcessingProgress({
          stage: 'File Preparation',
          progress: 10,
          message: `Files ready: ${size1}MB + ${size2}MB. Starting PDF engine...`,
          isActive: true
        });
        
      } catch (conversionError) {
        throw new Error(
          'Large File Data Conversion Error\n\n' +
          'Failed to process the uploaded PDF files.\n\n' +
          'For large files, this might be caused by:\n' +
          '• Files exceeding browser memory limits\n' +
          '• Corrupted data during upload\n' +
          '• Browser compatibility issues with large files\n\n' +
          'Solutions:\n' +
          '• Try smaller PDF files (under 25MB each)\n' +
          '• Split large PDFs into sections\n' +
          '• Use a different browser\n' +
          '• Restart browser and try again'
        );
      }

      // Start the comparison process
      console.log('⚙️ Starting large PDF comparison engine...');
      
      const comparisonResults = await comparePDFFiles(
        file1Binary.buffer, 
        file2Binary.buffer, 
        pdfOptions
      );

      console.log('✅ Large PDF comparison completed successfully');

      // Store results
      sessionStorage.setItem('veridiff_pdf_results', JSON.stringify(comparisonResults));
      sessionStorage.setItem('veridiff_comparison_type', 'pdf');
      sessionStorage.setItem('veridiff_pdf_options', JSON.stringify(pdfOptions));

      // DEBUG: Test feedback trigger
      console.log('🎯 DEBUG: About to trigger feedback check');
      console.log('🎯 DEBUG: window.triggerFeedbackCheck exists?', typeof window.triggerFeedbackCheck);
      
      // FEEDBACK TRIGGER
      if (window.triggerFeedbackCheck) {
        console.log('🎯 DEBUG: Calling triggerFeedbackCheck now!');
        // Set the current count variable that the feedback function expects
        window.u = parseInt(localStorage.getItem('trialComparisonCount') || '0');
        console.log('🎯 DEBUG: Set window.u to:', window.u);
        window.triggerFeedbackCheck();
        console.log('🎯 DEBUG: triggerFeedbackCheck called successfully');
      } else {
        console.log('🎯 DEBUG: triggerFeedbackCheck not found on window object');
        console.log('🎯 DEBUG: Available window properties:', Object.keys(window).filter(key => key.includes('trigger')));
      }

      setProcessingProgress({
        stage: 'Complete',
        progress: 100,
        message: 'Comparison completed! Redirecting to results...',
        isActive: false
      });

      // Navigate to PDF results
      console.log('🎯 DEBUG: About to redirect to /pdf-results in 1.5 seconds');
      setTimeout(() => {
        console.log('🎯 DEBUG: Redirecting to /pdf-results now');
        router.push('/pdf-results');
      }, 1500);

    } catch (error) {
      console.error('❌ Large PDF comparison error:', error);
      
      let userMessage = error.message;
      
      if (error.message.includes('PDF.js')) {
        userMessage = error.message + '\n\n⚠️ Technical Note: PDF processing library issue.';
      } else if (error.message.includes('memory') || error.message.includes('Memory')) {
        userMessage = error.message + '\n\n💡 Suggestion: Try closing other applications and browser tabs.';
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        userMessage = error.message + '\n\n⏰ Suggestion: Large files may need 30+ minutes. Please be patient.';
      }
      
      setError(userMessage);
      setIsLoading(false);
      setProcessingProgress({
        stage: 'Error',
        progress: 0,
        message: 'Processing failed',
        isActive: false
      });
    }
  };

  const renderLargePDFWarning = () => {
    if (!isLargeFile) return null;

    return (
      <div style={{
        background: '#fffbeb',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <div>
            <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.2rem', fontWeight: '600' }}>
              Large PDF Files Detected
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#92400e', fontSize: '0.95rem' }}>
              Total size: {((fileInfo.file1?.size + fileInfo.file2?.size) / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Processing Requirements:</strong>
          </div>
          <ul style={{ margin: '0 0 15px 20px', padding: 0 }}>
            <li>Estimated processing time: <strong>{estimatedTime} - {estimatedTime * 2} minutes</strong></li>
            <li>Recommended: 8GB+ system RAM</li>
            <li>Keep browser tab active during processing</li>
            <li>Ensure stable internet connection</li>
          </ul>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Optimization Tips:</strong>
          </div>
          <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
            <li>Close other browser tabs and applications</li>
            <li>Use Chrome or Firefox for best performance</li>
            <li>Consider splitting very large PDFs (75MB+) into sections</li>
            <li>Process during off-peak hours if possible</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (!processingProgress.isActive && processingProgress.progress === 0) return null;

    return (
      <div style={{
        background: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#1e40af', fontSize: '1.2rem' }}>
            🔄 {processingProgress.stage}
          </h3>
          <p style={{ margin: 0, color: '#3730a3', fontSize: '0.95rem' }}>
            {processingProgress.message}
          </p>
        </div>
        
        <div style={{
          background: '#e0e7ff',
          borderRadius: '10px',
          height: '12px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            height: '100%',
            width: `${processingProgress.progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '10px'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: '#4338ca'
        }}>
          <span>{processingProgress.progress}% Complete</span>
          {isLargeFile && estimatedTime && processingProgress.progress > 0 && (
            <span>
              Est. remaining: {Math.round((100 - processingProgress.progress) * estimatedTime / 100)} min
            </span>
          )}
        </div>
        
        {isLargeFile && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#f0f9ff',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#0369a1'
          }}>
            💡 <strong>Large File Processing:</strong> Please keep this tab active and avoid closing the browser. 
            Large PDFs may take 20-60 minutes to process completely.
          </div>
        )}
      </div>
    );
  };

  const renderPDFOptions = () => {
    const isPDFJSReady = typeof window !== 'undefined' && window.pdfJsReady;
    const isPDFJSError = typeof window !== 'undefined' && window.pdfJsError;
    const isPDFJSLoading = typeof window !== 'undefined' && !window.pdfJsReady && !window.pdfJsError;

    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#1f2937'
        }}>
          📕 PDF Comparison Options
        </h3>

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {/* Large File Warning */}
        {renderLargePDFWarning()}

        {/* PDF.js Status Indicators */}
        {isPDFJSLoading && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ fontSize: '1.2rem' }}>⏳</div>
            <div>
              <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '5px' }}>
                Loading PDF Processing Engine...
              </div>
              <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                {isLargeFile 
                  ? 'Large file mode: This may take 1-2 minutes to initialize...'
                  : 'Please wait while we initialize the PDF comparison system.'
                }
              </div>
            </div>
          </div>
        )}

        {isPDFJSError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '10px' }}>
              ❌ PDF Processing Engine Error
            </div>
            <div style={{ fontSize: '0.9rem', color: '#dc2626', marginBottom: '15px' }}>
              {window.pdfJsErrorMessage || 'The PDF processing engine failed to load properly.'}
            </div>
            {isLargeFile && (
              <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '10px' }}>
                <strong>Large File Note:</strong> This error may be due to insufficient memory or network timeout.
              </div>
            )}
          </div>
        )}

        {isPDFJSReady && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ fontSize: '1.2rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#166534' }}>
              PDF Processing Engine Ready {isLargeFile ? '(Large File Mode)' : ''}
            </div>
          </div>
        )}

        {/* PDF Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={pdfOptions.ignoreFormatting}
                onChange={(e) => setPdfOptions(prev => ({
                  ...prev,
                  ignoreFormatting: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              Ignore Formatting Differences
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              margin: '0 0 0 30px',
              lineHeight: '1.4'
            }}>
              {isLargeFile 
                ? 'Recommended for large files: Focus on content changes rather than formatting.'
                : 'Focus on content changes rather than formatting differences like spacing and fonts.'
              }
            </p>
          </div>

          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '15px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={pdfOptions.pageByPage}
                onChange={(e) => setPdfOptions(prev => ({
                  ...prev,
                  pageByPage: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              Page-by-Page Analysis
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              margin: '0 0 0 30px',
              lineHeight: '1.4'
            }}>
              {isLargeFile
                ? 'Essential for large files: Organizes results by page for better navigation.'
                : 'Compare documents page-by-page for detailed analysis and better organization.'
              }
            </p>
          </div>
        </div>

        {/* Document Information */}
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1f2937'
          }}>
            📄 Document Information
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '0.9rem'
          }}>
            <div>
              <strong>File 1:</strong> {fileInfo.file1?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file1 ? (fileInfo.file1.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file1 && fileInfo.file1.size > 50 * 1024 * 1024 && 
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}> (Large)</span>
                }
              </span>
            </div>
            <div>
              <strong>File 2:</strong> {fileInfo.file2?.name}
              <br />
              <span style={{ color: '#6b7280' }}>
                Size: {fileInfo.file2 ? (fileInfo.file2.size / 1024 / 1024).toFixed(1) : 0}MB
                {fileInfo.file2 && fileInfo.file2.size > 50 * 1024 * 1024 && 
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}> (Large)</span>
                }
              </span>
            </div>
          </div>
          
          {isLargeFile && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              background: '#fef3c7',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#92400e'
            }}>
              ⚠️ Large files detected. Processing may take {estimatedTime}-{estimatedTime * 2} minutes.
            </div>
          )}
        </div>

        {/* Compare Button */}
        <button
          onClick={handlePDFComparison}
          disabled={isLoading || !isPDFJSReady || processingProgress.isActive}
          style={{
            background: (isLoading || !isPDFJSReady || processingProgress.isActive) 
              ? '#9ca3af' 
              : isLargeFile 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: (isLoading || !isPDFJSReady || processingProgress.isActive) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          {processingProgress.isActive ? (
            <>
              <span>⏳</span>
              Processing Large PDFs...
            </>
          ) : isLoading ? (
            <>
              <span>⏳</span>
              Initializing...
            </>
          ) : !isPDFJSReady ? (
            <>
              <span>⏳</span>
              {isPDFJSError ? 'PDF Engine Error' : 'Waiting for PDF Engine...'}
            </>
          ) : (
            <>
              <span>{isLargeFile ? '🔥' : '📊'}</span>
              {isLargeFile ? 'Start Large PDF Comparison' : 'Compare PDF Documents'}
            </>
          )}
        </button>
        
        {!isPDFJSReady && !isPDFJSError && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '10px', 
            fontSize: '0.85rem', 
            color: '#6b7280' 
          }}>
            {isLargeFile 
              ? 'Large file processing engine loading... Please wait up to 2 minutes.'
              : 'PDF processing engine loading...'
            }
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <>
        <Head>
          <title>PDF Comparison Error - VeriDiff</title>
        </Head>
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <Header />
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '15px'
              }}>
                PDF Comparison Error
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '25px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🏠 Return Home
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>PDF Comparison Setup - VeriDiff</title>
        <meta name="description" content="Configure your PDF comparison settings and options" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLargeFile ? '🔥 Large PDF Comparison Setup' : '📕 PDF Comparison Setup'}
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {isLargeFile
                ? 'Configure your large PDF document comparison settings'
                : 'Configure your PDF document comparison settings'
              }
            </p>
          </div>

          {/* Loading State */}
          {isLoading && !processingProgress.isActive && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#1f2937'
              }}>
                {isLargeFile ? 'Preparing Large PDF Processing...' : 'Processing PDF Documents...'}
              </h3>
              <p style={{ color: '#6b7280' }}>
                {isLargeFile 
                  ? 'Initializing large file processing engine and checking system resources...'
                  : 'Analyzing document structure and extracting text content'
                }
              </p>
            </div>
          )}

          {/* PDF Options */}
          {!isLoading && renderPDFOptions()}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
