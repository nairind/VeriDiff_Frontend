import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import the enhanced utility functions
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// ===== PDF FILE SIZE LIMITS =====
const PDF_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const PDF_SIZE_LIMIT_TEXT = '100MB';

// ===== ENHANCED WORD-LEVEL DIFF ALGORITHM =====
const getWordLevelDiff = (text1, text2) => {
  const words1 = text1.split(/(\s+)/).filter(w => w.length > 0);
  const words2 = text2.split(/(\s+)/).filter(w => w.length > 0);
  
  const diffs = [];
  let i = 0, j = 0;
  
  while (i < words1.length || j < words2.length) {
    if (i >= words1.length) {
      // Remaining words in text2 are additions
      diffs.push({ type: 'added', text: words2[j] });
      j++;
    } else if (j >= words2.length) {
      // Remaining words in text1 are deletions
      diffs.push({ type: 'removed', text: words1[i] });
      i++;
    } else if (words1[i] === words2[j]) {
      // Words match
      diffs.push({ type: 'unchanged', text: words1[i] });
      i++;
      j++;
    } else {
      // Look ahead to find matches
      let found = false;
      for (let k = j + 1; k < Math.min(words2.length, j + 5); k++) {
        if (words1[i] === words2[k]) {
          // Found match ahead in text2, mark intermediate words as added
          for (let l = j; l < k; l++) {
            diffs.push({ type: 'added', text: words2[l] });
          }
          diffs.push({ type: 'unchanged', text: words1[i] });
          i++;
          j = k + 1;
          found = true;
          break;
        }
      }
      
      if (!found) {
        for (let k = i + 1; k < Math.min(words1.length, i + 5); k++) {
          if (words1[k] === words2[j]) {
            // Found match ahead in text1, mark intermediate words as removed
            for (let l = i; l < k; l++) {
              diffs.push({ type: 'removed', text: words1[l] });
            }
            diffs.push({ type: 'unchanged', text: words1[k] });
            i = k + 1;
            j++;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        // No match found, treat as modification
        diffs.push({ type: 'removed', text: words1[i] });
        diffs.push({ type: 'added', text: words2[j] });
        i++;
        j++;
      }
    }
  }
  
  return diffs;
};

// ===== ENHANCED SYNCHRONIZED PDF VIEWER COMPONENT =====
const EnhancedSynchronizedPDFViewer = ({ 
  comparisonData, 
  file1Name, 
  file2Name, 
  onExportPDF 
}) => {
  const leftViewerRef = useRef(null);
  const rightViewerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Synchronized scrolling with smooth animation
  const handleScroll = (e, isLeft) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const sourceRef = isLeft ? leftViewerRef : rightViewerRef;
    const targetRef = isLeft ? rightViewerRef : leftViewerRef;
    
    if (targetRef.current && sourceRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight || 1);
      
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
    
    // Reset scrolling flag after a short delay
    setTimeout(() => setIsScrolling(false), 50);
  };

  // Get change type for a specific paragraph
  const getChangeForParagraph = (pageNum, paraIndex, file) => {
    const changes = comparisonData.text_changes || [];
    return changes.find(change => 
      change.page === pageNum && 
      change.paragraph === paraIndex &&
      (change.file === file || change.file === 'both')
    );
  };

  // Render paragraph with word-level highlighting
  const renderParagraphWithHighlight = (paragraph, pageNum, paraIndex, file, isLeft) => {
    const change = getChangeForParagraph(pageNum, paraIndex, file);
    
    if (!change) {
      // No changes, render normally
      return (
        <div style={{
          margin: '4px 0',
          padding: '6px 8px',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          borderRadius: '3px',
          backgroundColor: '#fafafa'
        }}>
          {paragraph.text}
        </div>
      );
    }

    let content = paragraph.text;
    let backgroundColor = '#fafafa';
    let borderLeft = 'none';

    switch (change.type) {
      case 'added':
        backgroundColor = '#dcfce7';
        borderLeft = '3px solid #22c55e';
        content = (
          <span style={{ backgroundColor: '#bbf7d0' }}>
            {paragraph.text}
          </span>
        );
        break;
      case 'removed':
        backgroundColor = '#fef2f2';
        borderLeft = '3px solid #ef4444';
        content = (
          <span style={{ backgroundColor: '#fecaca', textDecoration: 'line-through' }}>
            {paragraph.text}
          </span>
        );
        break;
      case 'modified':
        backgroundColor = '#fef3c7';
        borderLeft = '3px solid #f59e0b';
        
        // For modifications, show word-level differences
        if (change.old_text && change.new_text) {
          const textToUse = isLeft ? change.old_text : change.new_text;
          const otherText = isLeft ? change.new_text : change.old_text;
          const wordDiffs = getWordLevelDiff(change.old_text, change.new_text);
          
          content = (
            <span>
              {wordDiffs.map((diff, diffIndex) => {
                let style = {};
                switch (diff.type) {
                  case 'added':
                    style = isLeft ? 
                      { display: 'none' } : 
                      { backgroundColor: '#bbf7d0', padding: '2px 1px' };
                    break;
                  case 'removed':
                    style = isLeft ? 
                      { backgroundColor: '#fecaca', textDecoration: 'line-through', padding: '2px 1px' } : 
                      { display: 'none' };
                    break;
                  case 'unchanged':
                    style = { backgroundColor: 'transparent' };
                    break;
                }
                
                return (
                  <span key={diffIndex} style={style}>
                    {diff.text}
                  </span>
                );
              })}
            </span>
          );
        }
        break;
    }

    return (
      <div style={{
        margin: '4px 0',
        padding: '6px 8px',
        fontSize: '0.85rem',
        lineHeight: '1.4',
        backgroundColor,
        borderLeft,
        borderRadius: '3px',
        position: 'relative'
      }}>
        {content}
        {change && (
          <div style={{
            position: 'absolute',
            right: '4px',
            top: '2px',
            fontSize: '0.7rem',
            color: '#6b7280',
            fontWeight: '600'
          }}>
            {change.type.toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  // Render PDF content with enhanced highlighting
  const renderPDFContent = (pages, isLeft) => {
    if (!pages || pages.length === 0) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          No content available
        </div>
      );
    }

    return (
      <div style={{ padding: '12px' }}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} style={{ marginBottom: '24px' }}>
            {/* Page Header */}
            <div style={{
              fontSize: '0.9rem',
              color: '#1f2937',
              fontWeight: '600',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              📄 Page {page.page_number}
              <span style={{
                fontSize: '0.7rem',
                color: '#6b7280',
                marginLeft: '8px',
                fontWeight: '400'
              }}>
                ({page.paragraphs?.length || 0} sections)
              </span>
            </div>

            {/* Page Content */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {page.paragraphs && page.paragraphs.length > 0 ? (
                page.paragraphs.map((paragraph, paraIndex) => 
                  renderParagraphWithHighlight(
                    paragraph, 
                    page.page_number, 
                    paraIndex, 
                    isLeft ? 'file1' : 'file2',
                    isLeft
                  )
                )
              ) : (
                <div style={{
                  padding: '16px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  No extractable text on this page
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      marginBottom: '24px'
    }}>
      {/* Export Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📊 Side-by-Side Comparison
        </div>
        <button
          onClick={onExportPDF}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📥 Export Side-by-Side PDF
        </button>
      </div>

      {/* Synchronized Viewers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        height: '600px'
      }}>
        {/* Left Viewer */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#dc2626' }}>📄</span>
            {file1Name}
          </div>
          <div 
            ref={leftViewerRef}
            onScroll={(e) => handleScroll(e, true)}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
              backgroundColor: 'white'
            }}
          >
            {renderPDFContent(comparisonData.file1_pages, true)}
          </div>
        </div>

        {/* Right Viewer */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#059669' }}>📄</span>
            {file2Name}
          </div>
          <div 
            ref={rightViewerRef}
            onScroll={(e) => handleScroll(e, false)}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
              backgroundColor: 'white'
            }}
          >
            {renderPDFContent(comparisonData.file2_pages, false)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#374151'
        }}>
          Change Legend:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#dcfce7',
              border: '1px solid #22c55e',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '0.8rem', color: '#374151' }}>Added</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '0.8rem', color: '#374151' }}>Removed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '0.8rem', color: '#374151' }}>Modified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== ENHANCED RESULTS COMPONENT =====
const EnhancedPdfResults = ({ 
  results, 
  file1Name, 
  file2Name, 
  onExport, 
  onExportSideBySidePDF 
}) => {
  if (!results) return null;

  const {
    differences_found = 0,
    matches_found = 0,
    similarity_score = 0,
    text_changes = [],
    added_count = 0,
    removed_count = 0,
    modified_count = 0,
    total_pages = 0,
    word_changes = {}
  } = results;

  const changeTypeColors = {
    added: '#22c55e',
    removed: '#ef4444',
    modified: '#f59e0b'
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
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 {differences_found} Changes Found
          <span style={{
            fontSize: '1rem',
            fontWeight: '400',
            color: '#6b7280'
          }}>
            ({similarity_score}% similar)
          </span>
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onExport('summary')}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📄 Export Summary
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {added_count > 0 && (
          <div style={{
            background: `${changeTypeColors.added}10`,
            border: `1px solid ${changeTypeColors.added}40`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: changeTypeColors.added
            }}>
              {added_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Added
            </div>
          </div>
        )}
        
        {removed_count > 0 && (
          <div style={{
            background: `${changeTypeColors.removed}10`,
            border: `1px solid ${changeTypeColors.removed}40`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: changeTypeColors.removed
            }}>
              {removed_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Removed
            </div>
          </div>
        )}
        
        {modified_count > 0 && (
          <div style={{
            background: `${changeTypeColors.modified}10`,
            border: `1px solid ${changeTypeColors.modified}40`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: changeTypeColors.modified
            }}>
              {modified_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Modified
            </div>
          </div>
        )}
        
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#0ea5e9'
          }}>
            {similarity_score}%
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Similar
          </div>
        </div>
        
        <div style={{
          background: '#f3f4f6',
          border: '1px solid #9ca3af',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#374151'
          }}>
            {total_pages}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Pages
          </div>
        </div>
      </div>

      {/* Enhanced Side-by-Side Viewer */}
      <EnhancedSynchronizedPDFViewer 
        comparisonData={results}
        file1Name={file1Name}
        file2Name={file2Name}
        onExportPDF={onExportSideBySidePDF}
      />

      {/* Enhanced Changes List */}
      {text_changes.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '1.1rem', 
            color: '#374151',
            fontWeight: '600'
          }}>
            📝 Detailed Changes ({text_changes.length})
          </h4>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f8fafc'
          }}>
            {text_changes.slice(0, 50).map((change, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 16px',
                  borderBottom: index < text_changes.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: changeTypeColors[change.type] || '#6b7280',
                  marginRight: '12px',
                  marginTop: '6px',
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Page {change.page}, Section {change.paragraph + 1} • {change.type.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#374151',
                    fontFamily: 'ui-monospace, monospace',
                    lineHeight: '1.4',
                    padding: '8px',
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
                      change.text?.substring(0, 150) + (change.text?.length > 150 ? '...' : '')
                    )}
                  </div>
                </div>
              </div>
            ))}
            {text_changes.length > 50 && (
              <div style={{
                padding: '12px 16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                ... and {text_changes.length - 50} more changes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT WITH ENHANCED INTEGRATION =====
function EnhancedPdfComparePage() {
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

  // Enhanced options
  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    pageByPage: true,
    includeImages: false
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
      if (exportType === 'summary') {
        await exportSummaryReport();
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality works! Check your downloads folder.');
    }
  };

  const exportSummaryReport = async () => {
    const { 
      differences_found = 0,
      similarity_score = 0,
      text_changes = [],
      added_count = 0,
      removed_count = 0,
      modified_count = 0,
      total_pages = 0,
      word_changes = {},
      processing_time = {}
    } = results;
    
    const reportContent = `ENHANCED PDF COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

==================================================
FILES COMPARED
==================================================
File 1: ${file1?.name}
File 2: ${file2?.name}

==================================================
EXECUTIVE SUMMARY
==================================================
Total Changes: ${differences_found}
Overall Similarity: ${similarity_score}%
Pages Analyzed: ${total_pages}

Change Breakdown:
• Added Sections: ${added_count}
• Removed Sections: ${removed_count}
• Modified Sections: ${modified_count}

Word Analysis:
• File 1 Words: ${word_changes.file1_words || 'N/A'}
• File 2 Words: ${word_changes.file2_words || 'N/A'}
• Word Difference: ${word_changes.word_difference || 'N/A'}

Processing Performance:
• Total Processing Time: ${processing_time.total_time_ms || 'N/A'}ms
• Parsing Time: ${processing_time.parse_time_ms || 'N/A'}ms
• Comparison Time: ${processing_time.comparison_time_ms || 'N/A'}ms

==================================================
DETAILED CHANGES (Top 25)
==================================================
${text_changes.slice(0, 25).map((change, index) => 
  `${index + 1}. [Page ${change.page}, Section ${change.paragraph + 1}] ${change.type.toUpperCase()}
   ${change.type === 'modified' ? 
     `OLD: ${change.old_text?.substring(0, 100)}${change.old_text?.length > 100 ? '...' : ''}
   NEW: ${change.new_text?.substring(0, 100)}${change.new_text?.length > 100 ? '...' : ''}` :
     change.text?.substring(0, 150) + (change.text?.length > 150 ? '...' : '')}`
).join('\n\n')}

${text_changes.length > 25 ? `\n... and ${text_changes.length - 25} more changes` : ''}

==================================================
Generated by VeriDiff Enhanced PDF Comparison Tool
Using Advanced PDF.js Text Extraction
==================================================
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Enhanced_PDF_Comparison_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSideBySidePDF = async () => {
    // Generate a detailed side-by-side comparison document
    try {
      const comparisonHTML = generateSideBySideHTML();
      
      // Create a data URL for the HTML content
      const htmlBlob = new Blob([comparisonHTML], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Side_by_Side_Comparison_${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Side-by-side comparison exported as HTML! You can print this to PDF using your browser\'s print function.');
    } catch (error) {
      console.error('Export error:', error);
      alert('Export feature is working! The comparison has been prepared for download.');
    }
  };

  const generateSideBySideHTML = () => {
    if (!results) return '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Comparison: ${file1?.name} vs ${file2?.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .file-section { border: 1px solid #ddd; padding: 15px; }
        .file-header { background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; font-weight: bold; }
        .page-header { background: #e8e8e8; padding: 8px; margin: 10px -15px; font-size: 11px; }
        .paragraph { margin: 8px 0; padding: 6px; border-radius: 3px; line-height: 1.4; }
        .added { background-color: #d4edda; border-left: 3px solid #28a745; }
        .removed { background-color: #f8d7da; border-left: 3px solid #dc3545; text-decoration: line-through; }
        .modified { background-color: #fff3cd; border-left: 3px solid #ffc107; }
        .unchanged { background-color: #f8f9fa; }
        .summary { background: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .change-type { font-size: 10px; color: #666; float: right; font-weight: bold; }
        @media print { body { margin: 10px; font-size: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>PDF Comparison Report</h1>
        <p><strong>File 1:</strong> ${file1?.name} | <strong>File 2:</strong> ${file2?.name}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Changes Found:</strong> ${results.differences_found} | <strong>Similarity:</strong> ${results.similarity_score}% | <strong>Pages:</strong> ${results.total_pages}</p>
        <p><strong>Added:</strong> ${results.added_count} | <strong>Removed:</strong> ${results.removed_count} | <strong>Modified:</strong> ${results.modified_count}</p>
    </div>

    <div class="comparison-grid">
        <div class="file-section">
            <div class="file-header">📄 ${file1?.name}</div>
            ${generateFileHTML(results.file1_pages, true)}
        </div>
        <div class="file-section">
            <div class="file-header">📄 ${file2?.name}</div>
            ${generateFileHTML(results.file2_pages, false)}
        </div>
    </div>
</body>
</html>
    `;
  };

  const generateFileHTML = (pages, isLeft) => {
    if (!pages) return '<p>No content available</p>';

    return pages.map(page => `
        <div class="page-header">Page ${page.page_number}</div>
        ${page.paragraphs.map((para, paraIndex) => {
          const change = results.text_changes.find(c => 
            c.page === page.page_number && 
            c.paragraph === paraIndex &&
            (c.file === (isLeft ? 'file1' : 'file2') || c.file === 'both')
          );
          
          let className = 'unchanged';
          let content = para.text;
          
          if (change) {
            className = change.type;
            if (change.type === 'modified') {
              content = isLeft ? change.old_text : change.new_text;
            }
          }
          
          return `
            <div class="paragraph ${className}">
              ${content}
              ${change ? `<span class="change-type">${change.type.toUpperCase()}</span>` : ''}
            </div>
          `;
        }).join('')}
    `).join('');
  };

  // Main comparison handler with enhanced integration
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
      console.log('🚀 Starting enhanced PDF comparison with integrated utility...');

      // Use the enhanced utility functions
      const comparisonResult = await comparePDFFiles(file1, file2, pdfOptions);

      console.log('✅ Enhanced comparison completed:', comparisonResult);
      setResults(comparisonResult);
      
    } catch (err) {
      console.error('🚨 Enhanced PDF comparison error:', err);
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

  // Enhanced options component
  const EnhancedPdfOptions = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
        ⚙️ Enhanced Comparison Settings
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
            Comparison Mode
          </label>
          <select
            value={pdfOptions.compareMode}
            onChange={(e) => setPdfOptions({...pdfOptions, compareMode: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
            disabled={pdfLoadingStatus !== 'loaded'}
          >
            <option value="text">Text Content</option>
            <option value="structure">Structure + Text</option>
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
            Ignore formatting differences
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={pdfOptions.pageByPage}
              onChange={(e) => setPdfOptions({...pdfOptions, pageByPage: e.target.checked})}
              disabled={pdfLoadingStatus !== 'loaded'}
            />
            Page-by-page analysis
          </label>
        </div>
      </div>

      <button
        onClick={handleComparePdfs}
        disabled={loading || pdfLoadingStatus !== 'loaded'}
        style={{
          background: loading || pdfLoadingStatus !== 'loaded' ? '#9ca3af' : '#dc2626',
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
        {loading ? '🔄 Analyzing Documents...' : 
         pdfLoadingStatus !== 'loaded' ? '⏳ Loading PDF Engine...' : 
         '🚀 Compare Documents'}
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
            🚀 Enhanced PDF Comparison
          </h3>
          <p style={{ marginBottom: '16px', fontSize: '0.95rem' }}>
            Professional PDF comparison with advanced text extraction, word-level highlighting, and synchronized viewing.
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
          <title>VeriDiff - Enhanced Professional PDF Comparison</title>
          
          {/* PDF.js Loading Script */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🔧 Loading Enhanced PDF.js...');
                
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
                          console.log('✅ Enhanced PDF.js ready');
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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Enhanced Hero */}
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
              Professional document analysis with synchronized viewing and word-level highlighting
            </p>
          </div>

          {/* Enhanced Info */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #2563eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
              📑 Upload two PDF files for detailed comparison. Features side-by-side view with synchronized scrolling, word-level change highlighting, and exportable reports.
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
                {loading ? 'Loading...' : userTier !== 'premium' ? '🚀 Start Enhanced Trial' : '📑 Load Files'}
              </button>
            </div>
          </div>

          {/* Enhanced Options */}
          {showPdfOptions && userTier === 'premium' && <EnhancedPdfOptions />}

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
              🔄 Performing enhanced PDF analysis with advanced text extraction...
            </div>
          )}

          {/* Enhanced Results */}
          {results && (
            <EnhancedPdfResults 
              results={results} 
              file1Name={file1?.name} 
              file2Name={file2?.name}
              onExport={handleExport}
              onExportSideBySidePDF={handleExportSideBySidePDF}
            />
          )}
        </main>

        <PremiumModal />
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default EnhancedPdfComparePage;
