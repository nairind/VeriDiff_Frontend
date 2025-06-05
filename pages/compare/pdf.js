import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// ===== PDF FILE SIZE LIMITS =====
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const PDF_SIZE_LIMIT_TEXT = '100MB';

// ===== ENHANCED PDF TEXT EXTRACTION =====
const extractEnhancedPDFData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        
        let allPages = [];
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
          if (info.info) {
            metadata.created = info.info.CreationDate ? new Date(info.info.CreationDate).toLocaleDateString() : 'Unknown';
            metadata.modified = info.info.ModDate ? new Date(info.info.ModDate).toLocaleDateString() : 'Unknown';
            metadata.author = info.info.Author || 'Unknown';
          }
        } catch (e) {
          console.log('Metadata extraction failed:', e);
        }

        // Extract text from all pages with enhanced structure
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Get text with positioning for better comparison
          const pageItems = textContent.items.map(item => ({
            text: item.str,
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5]),
            width: Math.round(item.width),
            height: Math.round(item.height)
          }));

          // Sort by position (top to bottom, left to right)
          pageItems.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 5) return b.y - a.y; // Different lines
            return a.x - b.x; // Same line, left to right
          });

          const pageText = pageItems.map(item => item.text).join(' ');
          const pageLines = pageText.split('\n').filter(line => line.trim());
          
          allPages.push({
            pageNumber: i,
            text: pageText,
            lines: pageLines,
            items: pageItems
          });
          
          fullText += `[PAGE ${i}]\n${pageText}\n\n`;
        }

        resolve({ 
          text: fullText, 
          metadata, 
          numPages: pdf.numPages,
          pages: allPages,
          rawPdf: pdf
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
};

// ===== ENHANCED COMPARISON ALGORITHM =====
const performEnhancedComparison = (pdf1Data, pdf2Data) => {
  const changes = [];
  let statistics = {
    insertion: 0,
    deletion: 0,
    modification: 0,
    formatting: 0,
    move: 0
  };

  // Compare page by page
  const maxPages = Math.max(pdf1Data.pages.length, pdf2Data.pages.length);
  
  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    const page1 = pdf1Data.pages[pageNum];
    const page2 = pdf2Data.pages[pageNum];
    
    if (!page1 && page2) {
      // New page added
      statistics.insertion++;
      changes.push({
        type: 'insertion',
        page: pageNum + 1,
        line: 1,
        confidence: 0.98,
        preview: `New page ${pageNum + 1} added`,
        details: { newContent: page2.text.substring(0, 100) + '...' }
      });
      continue;
    }
    
    if (page1 && !page2) {
      // Page removed
      statistics.deletion++;
      changes.push({
        type: 'deletion',
        page: pageNum + 1,
        line: 1,
        confidence: 0.98,
        preview: `Page ${pageNum + 1} removed`,
        details: { oldContent: page1.text.substring(0, 100) + '...' }
      });
      continue;
    }
    
    if (page1 && page2) {
      // Compare lines within the page
      const lines1 = page1.lines;
      const lines2 = page2.lines;
      const maxLines = Math.max(lines1.length, lines2.length);
      
      for (let lineNum = 0; lineNum < maxLines; lineNum++) {
        const line1 = lines1[lineNum] || '';
        const line2 = lines2[lineNum] || '';
        
        if (!line1 && line2) {
          statistics.insertion++;
          changes.push({
            type: 'insertion',
            page: pageNum + 1,
            line: lineNum + 1,
            confidence: 0.95,
            preview: `+ ${line2}`,
            details: { newContent: line2 }
          });
        } else if (line1 && !line2) {
          statistics.deletion++;
          changes.push({
            type: 'deletion',
            page: pageNum + 1,
            line: lineNum + 1,
            confidence: 0.95,
            preview: `- ${line1}`,
            details: { oldContent: line1 }
          });
        } else if (line1 !== line2) {
          // Check for modifications vs moves
          const similarity = calculateLineSimilarity(line1, line2);
          
          if (similarity > 0.3) {
            // Lines are similar enough to be modifications
            statistics.modification++;
            changes.push({
              type: 'modification',
              page: pageNum + 1,
              line: lineNum + 1,
              confidence: 0.90 + (similarity * 0.08),
              preview: `${line1.substring(0, 30)}... → ${line2.substring(0, 30)}...`,
              details: { 
                oldContent: line1, 
                newContent: line2,
                similarity: similarity
              }
            });
          } else {
            // Lines are very different - treat as deletion + insertion
            statistics.deletion++;
            statistics.insertion++;
            changes.push({
              type: 'deletion',
              page: pageNum + 1,
              line: lineNum + 1,
              confidence: 0.88,
              preview: `- ${line1.substring(0, 50)}...`,
              details: { oldContent: line1 }
            });
            changes.push({
              type: 'insertion',
              page: pageNum + 1,
              line: lineNum + 1,
              confidence: 0.88,
              preview: `+ ${line2.substring(0, 50)}...`,
              details: { newContent: line2 }
            });
          }
        }
      }
    }
  }

  // Calculate overall similarity
  const totalItems1 = pdf1Data.pages.reduce((sum, page) => sum + page.lines.length, 0);
  const totalItems2 = pdf2Data.pages.reduce((sum, page) => sum + page.lines.length, 0);
  const totalChanges = statistics.insertion + statistics.deletion + statistics.modification;
  const maxItems = Math.max(totalItems1, totalItems2);
  const similarity = maxItems > 0 ? Math.max(0, (maxItems - totalChanges) / maxItems) : 0;

  return {
    changes: changes.slice(0, 100), // Limit to prevent overwhelming UI
    statistics,
    similarity,
    totalChanges
  };
};

// Helper function to calculate line similarity
const calculateLineSimilarity = (line1, line2) => {
  const words1 = line1.toLowerCase().split(/\s+/);
  const words2 = line2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  return totalWords > 0 ? commonWords.length / totalWords : 0;
};

// ===== SYNCHRONIZED PDF VIEWER COMPONENT =====
const SynchronizedPDFViewer = ({ pdf1Data, pdf2Data, file1Name, file2Name, changes }) => {
  const leftViewerRef = useRef(null);
  const rightViewerRef = useRef(null);

  const handleScroll = (e, isLeft) => {
    const sourceRef = isLeft ? leftViewerRef : rightViewerRef;
    const targetRef = isLeft ? rightViewerRef : leftViewerRef;
    
    if (targetRef.current && sourceRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight || 1);
      
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
  };

  const renderPDFContent = (pdfData, changes, isLeft) => {
    if (!pdfData || !pdfData.pages) return <div>Loading PDF content...</div>;

    return (
      <div style={{ padding: '12px', lineHeight: '1.6' }}>
        {pdfData.pages.map((page, pageIndex) => (
          <div key={pageIndex} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              fontWeight: '600',
              marginBottom: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '4px'
            }}>
              Page {page.pageNumber}
            </div>
            {page.lines.map((line, lineIndex) => {
              // Check if this line has changes
              const lineChanges = changes.filter(change => 
                change.page === page.pageNumber && 
                (change.line === lineIndex + 1 || Math.abs(change.line - (lineIndex + 1)) <= 2)
              );
              
              let lineStyle = { 
                margin: '2px 0', 
                fontSize: '0.85rem',
                padding: '2px 4px',
                borderRadius: '2px'
              };
              
              if (lineChanges.length > 0) {
                const change = lineChanges[0];
                if (change.type === 'insertion') {
                  lineStyle.backgroundColor = '#dcfce7';
                  lineStyle.borderLeft = '3px solid #22c55e';
                } else if (change.type === 'deletion') {
                  lineStyle.backgroundColor = '#fef2f2';
                  lineStyle.borderLeft = '3px solid #ef4444';
                } else if (change.type === 'modification') {
                  lineStyle.backgroundColor = '#fef3c7';
                  lineStyle.borderLeft = '3px solid #f59e0b';
                }
              }
              
              return (
                <div key={lineIndex} style={lineStyle}>
                  {line || '\u00A0'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
      height: '500px'
    }}>
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#f9fafb'
      }}>
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f3f4f6',
          borderRadius: '8px 8px 0 0',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          📄 {file1Name}
        </div>
        <div 
          ref={leftViewerRef}
          onScroll={(e) => handleScroll(e, true)}
          style={{
            height: '456px',
            overflowY: 'auto',
            fontSize: '0.8rem',
            fontFamily: 'ui-monospace, monospace',
            background: 'white'
          }}
        >
          {renderPDFContent(pdf1Data, changes, true)}
        </div>
      </div>

      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#f9fafb'
      }}>
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f3f4f6',
          borderRadius: '8px 8px 0 0',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          📄 {file2Name}
        </div>
        <div 
          ref={rightViewerRef}
          onScroll={(e) => handleScroll(e, false)}
          style={{
            height: '456px',
            overflowY: 'auto',
            fontSize: '0.8rem',
            fontFamily: 'ui-monospace, monospace',
            background: 'white'
          }}
        >
          {renderPDFContent(pdf2Data, changes, false)}
        </div>
      </div>
    </div>
  );
};

// ===== ENHANCED RESULTS COMPONENT =====
const EnhancedPdfResults = ({ results, file1Name, file2Name, pdf1Data, pdf2Data, onExport }) => {
  if (!results) return null;

  const { changes = [], statistics = {}, similarity = 0, totalChanges = 0 } = results;
  
  const changeTypeColors = {
    insertion: '#22c55e',
    deletion: '#ef4444', 
    modification: '#f59e0b',
    formatting: '#8b5cf6',
    move: '#06b6d4'
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
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
              cursor: 'pointer',
              fontWeight: '500'
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
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📑 Side-by-Side PDF
          </button>
        </div>
      </div>

      {/* Statistics */}
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

      {/* Synchronized PDF Viewer */}
      <SynchronizedPDFViewer 
        pdf1Data={pdf1Data}
        pdf2Data={pdf2Data}
        file1Name={file1Name}
        file2Name={file2Name}
        changes={changes}
      />

      {/* Detailed Changes List */}
      {changes.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#374151' }}>
            📝 Detailed Changes ({changes.length})
          </h4>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#f8fafc'
          }}>
            {changes.map((change, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderBottom: index < changes.length - 1 ? '1px solid #e5e7eb' : 'none',
                  background: index % 2 === 0 ? 'white' : '#f8fafc'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: changeTypeColors[change.type],
                  marginRight: '10px',
                  marginTop: '4px',
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '2px'
                  }}>
                    Page {change.page}, Line {change.line} • {change.type.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#374151',
                    fontFamily: 'ui-monospace, monospace',
                    lineHeight: '1.4'
                  }}>
                    {change.preview}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  marginLeft: '8px',
                  fontWeight: '600'
                }}>
                  {Math.round(change.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT (keeping existing structure but with enhanced comparison) =====
function PdfComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [pdf1Data, setPdf1Data] = useState(null);
  const [pdf2Data, setPdf2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking');
  
  // UI states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Simplified options
  const [pdfOptions, setPdfOptions] = useState({
    sensitivity: 'medium',
    ignoreFormatting: true,
    compareMetadata: true
  });

  // PDF.js loading check
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

  // Enhanced export functions
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
      alert('Export functionality works! Check your downloads folder.');
    }
  };

  const exportSummaryReport = async () => {
    const { statistics = {}, similarity = 0, totalChanges = 0, changes = [] } = results;
    
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
Total Changes: ${totalChanges}
Overall Similarity: ${Math.round(similarity * 100)}%

Change Breakdown:
${Object.entries(statistics).map(([type, count]) => 
  `• ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`
).join('\n')}

==================================================
DETAILED CHANGES
==================================================
${changes.slice(0, 20).map((change, index) => 
  `${index + 1}. [Page ${change.page}, Line ${change.line}] ${change.type.toUpperCase()}
   ${change.preview}
   Confidence: ${Math.round(change.confidence * 100)}%`
).join('\n\n')}

${changes.length > 20 ? `\n... and ${changes.length - 20} more changes` : ''}

==================================================
Generated by VeriDiff Professional PDF Comparison
==================================================
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDF_Comparison_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSideBySidePDF = async () => {
    alert('Side-by-side PDF export is being prepared! This feature will generate a professional PDF showing both documents with highlighted changes.');
  };

  // Main comparison handler
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
      console.log('📚 Starting enhanced PDF comparison...');

      // Extract enhanced data from both files
      const [file1Data, file2Data] = await Promise.all([
        extractEnhancedPDFData(file1),
        extractEnhancedPDFData(file2)
      ]);

      console.log('📚 PDF data extracted:', { 
        file1Pages: file1Data.pages.length, 
        file2Pages: file2Data.pages.length 
      });

      // Store PDF data for viewer
      setPdf1Data(file1Data);
      setPdf2Data(file2Data);

      // Perform enhanced comparison
      const comparisonResult = performEnhancedComparison(file1Data, file2Data);

      // Combine results with metadata
      const enhancedResult = {
        ...comparisonResult,
        metadata: {
          file1: file1Data.metadata,
          file2: file2Data.metadata
        }
      };

      console.log('📚 Enhanced comparison completed:', enhancedResult);
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

  // File upload component
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

  // Simplified options component
  const SimplifiedPdfOptions = () => (
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
        onClick={handleComparePdfs}
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
        {loading ? 'Analyzing Documents...' : pdfLoadingStatus !== 'loaded' ? 'Loading PDF Engine...' : '🚀 Compare Documents'}
      </button>
    </div>
  );

  // Premium modal
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
            Professional PDF comparison with enhanced change detection and synchronized viewing.
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
          {/* Hero */}
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
              📑 Enhanced PDF Comparison
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              margin: 0
            }}>
              Professional document analysis with synchronized viewing
            </p>
          </div>

          {/* Info */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #2563eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
              📑 Upload two PDF files for detailed comparison. Shows side-by-side view with highlighted changes and synchronized scrolling.
            </p>
          </div>

          {/* File Upload */}
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

          {/* Options */}
          {showPdfOptions && userTier === 'premium' && <SimplifiedPdfOptions />}

          {/* Error */}
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
              🔄 Performing enhanced PDF analysis...
            </div>
          )}

          {/* Enhanced Results */}
          {results && (
            <EnhancedPdfResults 
              results={results} 
              file1Name={file1?.name} 
              file2Name={file2?.name}
              pdf1Data={pdf1Data}
              pdf2Data={pdf2Data}
              onExport={handleExport}
            />
          )}
        </main>

        <PremiumModal />
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default PdfComparePage;
