import React, { useRef, useCallback } from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  // Refs for synchronized scrolling
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Synchronized scrolling function
  const handleScroll = useCallback((scrollingPane, otherPaneRef) => {
    if (isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    if (otherPaneRef.current) {
      otherPaneRef.current.scrollTop = scrollingPane.scrollTop;
    }
    
    // Reset the flag after a brief delay
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  }, []);

  const findParagraphChange = (pageNumber, paragraphIndex, fileNumber) => {
    const allChanges = results?.text_changes || [];
    return allChanges.find(change => 
      change.page === pageNumber && 
      change.paragraph === paragraphIndex &&
      (change.file === `file${fileNumber}` || change.file === 'both')
    );
  };

  const getChangeStyle = (changeType) => {
    switch (changeType) {
      case 'added':
        return {
          background: '#dcfce7',
          border: '1px solid #166534',
          color: '#166534',
          padding: '8px 12px',
          borderRadius: '6px',
          fontWeight: '500'
        };
      case 'removed':
        return {
          background: '#fee2e2',
          border: '1px solid #dc2626',
          color: '#dc2626',
          padding: '8px 12px',
          borderRadius: '6px',
          fontWeight: '500'
        };
      case 'modified':
        return {
          background: '#fef3c7',
          border: '1px solid #d97706',
          color: '#92400e',
          padding: '8px 12px',
          borderRadius: '6px',
          fontWeight: '500'
        };
      default:
        return {
          padding: '4px 0',
          color: '#374151'
        };
    }
  };

  const renderDocument = (pages, fileName, fileNumber) => {
    if (!pages || pages.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No pages available for {fileName}
        </div>
      );
    }

    return (
      <div>
        {pages.map((page) => (
          <div key={page.page_number} style={{ marginBottom: '30px' }}>
            <div style={{
              background: '#f3f4f6',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              Page {page.page_number}
            </div>
            
            {(page.paragraphs || []).map((para, paraIndex) => {
              const change = findParagraphChange(page.page_number, paraIndex, fileNumber);
              const changeType = change?.type;
              const style = getChangeStyle(changeType);
              
              return (
                <div key={paraIndex} style={{ marginBottom: '12px', ...style }}>
                  {para.text}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const file1Pages = results?.file1_pages || [];
  const file2Pages = results?.file2_pages || [];
  const allChanges = results?.text_changes || [];
  
  // SmartDiff detection (minimal addition)
  const hasSmartDiff = !!(results?.smart_changes && results?.smart_changes.length >= 0);
  const smartChanges = results?.smart_changes || [];
  const overallSimilarity = results?.overall_similarity || results?.similarity_score || 0;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', color: '#1f2937' }}>
          📄 {hasSmartDiff ? 'SmartDiff Enhanced ' : ''}Side-by-Side Document Comparison
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
          <strong>{hasSmartDiff ? smartChanges.length : allChanges.length} changes found</strong> • {overallSimilarity}% similarity
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
        fontSize: '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#dcfce7', 
            border: '1px solid #166534',
            borderRadius: '3px' 
          }}></div>
          <span>Added</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#fee2e2', 
            border: '1px solid #dc2626',
            borderRadius: '3px' 
          }}></div>
          <span>Removed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#fef3c7', 
            border: '1px solid #d97706',
            borderRadius: '3px' 
          }}></div>
          <span>Modified</span>
        </div>
      </div>

      {/* Side-by-Side Layout with Synchronized Scrolling */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
        gap: '20px'
      }}>
        {/* Left Panel - Document 1 */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            📄 {file1Name || 'Document 1'}
            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '10px' }}>
              ({file1Pages.length} pages)
            </span>
          </div>
          
          <div 
            ref={leftPaneRef}
            style={{
              height: '600px',
              overflowY: 'auto',
              padding: '20px',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}
            onScroll={(e) => handleScroll(e.target, rightPaneRef)}
          >
            {renderDocument(file1Pages, file1Name, 1)}
          </div>
        </div>

        {/* Right Panel - Document 2 */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            📄 {file2Name || 'Document 2'}
            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '10px' }}>
              ({file2Pages.length} pages)
            </span>
          </div>
          
          <div 
            ref={rightPaneRef}
            style={{
              height: '600px',
              overflowY: 'auto',
              padding: '20px',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}
            onScroll={(e) => handleScroll(e.target, leftPaneRef)}
          >
            {renderDocument(file2Pages, file2Name, 2)}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => {
              if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0;
              if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0;
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              color: '#1d4ed8',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ⬆️ Top
          </button>
          <button 
            onClick={() => {
              const scrollToNext = () => {
                if (leftPaneRef.current && rightPaneRef.current) {
                  const currentScroll = leftPaneRef.current.scrollTop;
                  leftPaneRef.current.scrollTop = currentScroll + 200;
                  rightPaneRef.current.scrollTop = currentScroll + 200;
                }
              };
              scrollToNext();
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
              color: '#c2410c',
              border: '1px solid #f97316',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🔍 Next Change
          </button>
          <button 
            onClick={() => {
              if (leftPaneRef.current && rightPaneRef.current) {
                const maxScroll = leftPaneRef.current.scrollHeight - leftPaneRef.current.clientHeight;
                leftPaneRef.current.scrollTop = maxScroll;
                rightPaneRef.current.scrollTop = maxScroll;
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              color: '#1d4ed8',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ⬇️ Bottom
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#f9fafb',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {(hasSmartDiff ? smartChanges.length : allChanges.length) > 0 ? (
          <span>
            <strong>{hasSmartDiff ? smartChanges.length : allChanges.length} changes highlighted</strong> across {results?.total_pages || 0} pages
            {hasSmartDiff && <span style={{ color: '#059669', marginLeft: '8px' }}>• SmartDiff Active</span>}
          </span>
        ) : (
          <span>
            <strong>No changes detected</strong> - Documents appear to be identical
          </span>
        )}
        <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
          🚀 <strong>Powered by VeriDiff{hasSmartDiff ? ' SmartDiff' : ''}</strong>
        </div>
      </div>
    </div>
  );
};

export default PDFSideBySideView;
