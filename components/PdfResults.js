import React, { useState } from 'react';

const PdfResults = ({ results, file1Name, file2Name }) => {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'overlay'
  const [currentPage, setCurrentPage] = useState(1);
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [highlightLevel, setHighlightLevel] = useState('word'); // 'word' or 'paragraph'

  // Extract data from results
  const {
    differences_found = 0,
    matches_found = 0,
    total_pages = 0,
    total_paragraphs = 0,
    page_differences = [],
    text_changes = [],
    file1_pages = [],
    file2_pages = [],
    similarity_score = 0
  } = results || {};

  // Helper function to get change styling
  const getChangeStyle = (changeType, isInline = false) => {
    const baseStyle = isInline ? { display: 'inline', padding: '2px 4px', borderRadius: '3px' } : { padding: '8px 12px', borderRadius: '6px', margin: '4px 0' };
    
    switch (changeType) {
      case 'added':
        return {
          ...baseStyle,
          backgroundColor: '#e6ffe6',
          border: isInline ? '1px solid #27ae60' : '2px solid #27ae60',
          color: '#155724'
        };
      case 'removed':
        return {
          ...baseStyle,
          backgroundColor: '#ffe6e6',
          border: isInline ? '1px solid #e74c3c' : '2px solid #e74c3c',
          color: '#721c24',
          textDecoration: isInline ? 'line-through' : 'none'
        };
      case 'modified':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          border: isInline ? '1px solid #ffc107' : '2px solid #ffc107',
          color: '#856404'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#374151'
        };
    }
  };

  // Helper to highlight text with changes
  const highlightText = (text, changes = []) => {
    if (!changes || changes.length === 0) {
      return <span>{text}</span>;
    }

    let result = [];
    let lastIndex = 0;

    changes.forEach((change, index) => {
      // Add text before the change
      if (change.start > lastIndex) {
        result.push(
          <span key={`before-${index}`}>
            {text.substring(lastIndex, change.start)}
          </span>
        );
      }

      // Add the changed text with highlighting
      result.push(
        <span key={`change-${index}`} style={getChangeStyle(change.type, true)}>
          {text.substring(change.start, change.end)}
        </span>
      );

      lastIndex = change.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="after">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{result}</>;
  };

  // Component for single page view
  const PageView = ({ pageData, pageNum, isFile1 = true }) => {
    const pageChanges = text_changes.filter(change => change.page === pageNum);
    
    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '600px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            📑 {isFile1 ? (file1Name || 'File 1') : (file2Name || 'File 2')} - Page {pageNum}
          </span>
          {pageChanges.length > 0 && (
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {pageChanges.length} change{pageChanges.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div style={{
          height: 'calc(100% - 60px)',
          overflow: 'auto',
          padding: '20px',
          background: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          {pageData?.paragraphs?.map((paragraph, index) => {
            const paragraphChanges = pageChanges.filter(change => 
              change.paragraph === index && 
              change.file === (isFile1 ? 'file1' : 'file2')
            );
            
            if (showChangesOnly && paragraphChanges.length === 0) {
              return null;
            }

            return (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  padding: paragraphChanges.length > 0 ? '12px' : '0',
                  ...(paragraphChanges.length > 0 ? getChangeStyle(paragraphChanges[0]?.type) : {})
                }}
              >
                {highlightLevel === 'word' && paragraphChanges.length > 0 ? 
                  highlightText(paragraph.text, paragraphChanges) : 
                  paragraph.text
                }
              </div>
            );
          })}
          
          {(!pageData?.paragraphs || pageData.paragraphs.length === 0) && (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontStyle: 'italic',
              padding: '40px'
            }}>
              No text content found on this page
            </div>
          )}
        </div>
      </div>
    );
  };

  // Side-by-side view component
  const SideBySideView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    }}>
      <PageView 
        pageData={file1_pages[currentPage - 1]} 
        pageNum={currentPage} 
        isFile1={true}
      />
      <PageView 
        pageData={file2_pages[currentPage - 1]} 
        pageNum={currentPage} 
        isFile1={false}
      />
    </div>
  );

  // Overlay view component (single document with changes highlighted)
  const OverlayView = () => {
    const pageData = file1_pages[currentPage - 1] || file2_pages[currentPage - 1];
    const pageChanges = text_changes.filter(change => change.page === currentPage);
    
    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '600px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>📑 Merged View - Page {currentPage}</span>
          <span style={{
            background: pageChanges.length > 0 ? '#fef3c7' : '#ecfdf5',
            color: pageChanges.length > 0 ? '#92400e' : '#166534',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {pageChanges.length} change{pageChanges.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div style={{
          height: 'calc(100% - 60px)',
          overflow: 'auto',
          padding: '20px',
          background: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          {pageData?.paragraphs?.map((paragraph, index) => {
            const paragraphChanges = pageChanges.filter(change => change.paragraph === index);
            
            if (showChangesOnly && paragraphChanges.length === 0) {
              return null;
            }

            return (
              <div key={index} style={{ marginBottom: '16px' }}>
                {paragraphChanges.map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    style={{
                      ...getChangeStyle(change.type),
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', opacity: 0.8 }}>
                      {change.type === 'added' ? '+ Added' : change.type === 'removed' ? '- Removed' : '~ Modified'}
                    </div>
                    {change.text}
                  </div>
                ))}
                
                {paragraphChanges.length === 0 && (
                  <div>{paragraph.text}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Page navigation component
  const PageNavigation = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        style={{
          background: currentPage <= 1 ? '#f3f4f6' : '#2563eb',
          color: currentPage <= 1 ? '#9ca3af' : 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          fontWeight: '500'
        }}
      >
        ← Previous
      </button>
      
      <span style={{
        padding: '8px 16px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontWeight: '500',
        color: '#374151'
      }}>
        Page {currentPage} of {total_pages}
      </span>
      
      <button
        onClick={() => setCurrentPage(Math.min(total_pages, currentPage + 1))}
        disabled={currentPage >= total_pages}
        style={{
          background: currentPage >= total_pages ? '#f3f4f6' : '#2563eb',
          color: currentPage >= total_pages ? '#9ca3af' : 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: currentPage >= total_pages ? 'not-allowed' : 'pointer',
          fontWeight: '500'
        }}
      >
        Next →
      </button>
    </div>
  );

  // Download handler
  const handleDownloadReport = () => {
    const report = generatePdfReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdf_comparison_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePdfReport = () => {
    let report = `PDF COMPARISON REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `${'='.repeat(60)}\n\n`;
    report += `Files Compared:\n`;
    report += `File 1: ${file1Name || 'File 1'}\n`;
    report += `File 2: ${file2Name || 'File 2'}\n\n`;
    report += `Statistics:\n`;
    report += `- Total pages: ${total_pages}\n`;
    report += `- Total paragraphs: ${total_paragraphs}\n`;
    report += `- Differences found: ${differences_found}\n`;
    report += `- Matches found: ${matches_found}\n`;
    report += `- Similarity score: ${similarity_score}%\n\n`;
    report += `Page-by-Page Changes:\n`;
    report += `${'='.repeat(60)}\n`;
    
    page_differences.forEach(page => {
      report += `\nPage ${page.page_number}:\n`;
      report += `- Changes: ${page.changes_count}\n`;
      if (page.summary) {
        report += `- Summary: ${page.summary}\n`;
      }
    });
    
    return report;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2rem',
          fontWeight: '700',
          margin: '0 0 15px 0'
        }}>
          📑 PDF Comparison Results
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Document-level analysis with page-by-page comparison
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
              {total_pages}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Pages</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
              {differences_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Differences</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
              {matches_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Matches</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
              {similarity_score}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Similarity</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }}>
              {total_paragraphs}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Paragraphs</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '25px',
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        {/* View Mode */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>View:</span>
          <button
            onClick={() => setViewMode('side-by-side')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'side-by-side' ? '#2563eb' : 'white',
              color: viewMode === 'side-by-side' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            📄 Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'overlay' ? '#2563eb' : 'white',
              color: viewMode === 'overlay' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            🔄 Merged
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showChangesOnly}
              onChange={(e) => setShowChangesOnly(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Changes Only</span>
          </label>
          
          <select
            value={highlightLevel}
            onChange={(e) => setHighlightLevel(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              color: '#374151'
            }}
          >
            <option value="word">Word Level</option>
            <option value="paragraph">Paragraph Level</option>
          </select>
        </div>

        {/* Download */}
        <button
          onClick={handleDownloadReport}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
        >
          📄 Download Report
        </button>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e6ffe6',
            border: '1px solid #27ae60',
            borderRadius: '3px'
          }}></div>
          <span>Added content</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #e74c3c',
            borderRadius: '3px'
          }}></div>
          <span>Removed content</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '3px'
          }}></div>
          <span>Modified content</span>
        </div>
      </div>

      {/* Page Navigation */}
      {total_pages > 1 && <PageNavigation />}

      {/* Main View */}
      {total_pages > 0 ? (
        viewMode === 'side-by-side' ? <SideBySideView /> : <OverlayView />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
          No pages found in the PDF files to compare.
        </div>
      )}

      {/* No differences message */}
      {differences_found === 0 && total_pages > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
          <h3 style={{
            color: '#166534',
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 10px 0'
          }}>
            PDF documents are identical!
          </h3>
          <p style={{
            color: '#16a34a',
            fontSize: '1.1rem',
            margin: 0
          }}>
            No differences found between the PDF files.
          </p>
        </div>
      )}
    </div>
  );
};

export default PdfResults;
