// components/PDFSideBySideView.js
import { useState, useEffect, useRef } from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  const [currentChange, setCurrentChange] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveFile, setMobileActiveFile] = useState(1);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get all changes for navigation
  const allChanges = results.text_changes || [];
  const totalChanges = allChanges.length;

  // Create enhanced document data with change highlighting
  const createDocumentData = (pages, fileNumber) => {
    if (!pages) return [];
    
    return pages.map(page => ({
      ...page,
      enhancedParagraphs: (page.paragraphs || []).map((para, paraIndex) => {
        // Find changes for this paragraph
        const change = allChanges.find(c => 
          c.page === page.page_number && 
          c.paragraph === paraIndex &&
          (c.file === `file${fileNumber}` || c.file === 'both')
        );
        
        return {
          ...para,
          change: change,
          isHighlighted: !!change
        };
      })
    }));
  };

  const file1Data = createDocumentData(results.file1_pages || [], 1);
  const file2Data = createDocumentData(results.file2_pages || [], 2);

  // Navigation functions
  const goToNextChange = () => {
    if (currentChange < totalChanges - 1) {
      setCurrentChange(currentChange + 1);
      scrollToChange(currentChange + 1);
    }
  };

  const goToPrevChange = () => {
    if (currentChange > 0) {
      setCurrentChange(currentChange - 1);
      scrollToChange(currentChange - 1);
    }
  };

  const scrollToChange = (changeIndex) => {
    const change = allChanges[changeIndex];
    if (!change) return;

    // Find the element to scroll to
    const elementId = `change-${change.page}-${change.paragraph}`;
    const element = document.getElementById(elementId);
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // Get color for change type
  const getChangeColor = (changeType, isBackground = false) => {
    if (!changeType) return isBackground ? 'transparent' : 'inherit';
    
    const colors = {
      added: isBackground ? '#dcfce7' : '#166534',
      removed: isBackground ? '#fee2e2' : '#dc2626', 
      modified: isBackground ? '#fef3c7' : '#92400e'
    };
    
    return colors[changeType] || (isBackground ? 'transparent' : 'inherit');
  };

  // Render a single document panel
  const renderDocumentPanel = (documentData, fileName, fileNumber) => {
    return (
      <div style={{
        flex: 1,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Panel Header */}
        <div style={{
          background: '#f8fafc',
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📄 {fileName || `Document ${fileNumber}`}
          <div style={{ 
            fontSize: '0.85rem', 
            fontWeight: 'normal', 
            color: '#6b7280',
            marginTop: '4px'
          }}>
            {documentData.length} pages • {
              documentData.reduce((total, page) => total + (page.word_count || 0), 0)
            } words
          </div>
        </div>

        {/* Document Content */}
        <div 
          ref={fileNumber === 1 ? leftPanelRef : rightPanelRef}
          style={{
            height: '600px',
            overflowY: 'auto',
            padding: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}
        >
          {documentData.map((page) => (
            <div key={page.page_number} style={{ marginBottom: '30px' }}>
              {/* Page Header */}
              <div style={{
                background: '#f3f4f6',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '15px'
              }}>
                Page {page.page_number}
              </div>

              {/* Page Content */}
              {(page.enhancedParagraphs || []).map((para, paraIndex) => {
                const changeId = `change-${page.page_number}-${paraIndex}`;
                const isCurrentChange = allChanges[currentChange]?.page === page.page_number && 
                                       allChanges[currentChange]?.paragraph === paraIndex;
                
                return (
                  <div
                    key={paraIndex}
                    id={changeId}
                    style={{
                      marginBottom: '12px',
                      padding: para.isHighlighted ? '8px 12px' : '4px 0',
                      background: para.isHighlighted ? 
                        getChangeColor(para.change?.type, true) : 'transparent',
                      border: isCurrentChange ? 
                        '2px solid #2563eb' : 
                        para.isHighlighted ? `1px solid ${getChangeColor(para.change?.type)}` : 'none',
                      borderRadius: para.isHighlighted ? '6px' : '0',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* Change indicator badge */}
                    {para.isHighlighted && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '8px',
                        background: getChangeColor(para.change?.type),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {para.change?.type}
                      </div>
                    )}
                    
                    {/* Text content */}
                    <div style={{
                      color: para.isHighlighted ? getChangeColor(para.change?.type) : '#374151',
                      fontWeight: para.isHighlighted ? '500' : 'normal'
                    }}>
                      {para.text}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Mobile view (single column with tab switching)
  if (isMobile) {
    return (
      <div>
        {/* Mobile file selector */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setMobileActiveFile(1)}
            style={{
              flex: 1,
              background: mobileActiveFile === 1 ? 'white' : 'transparent',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              color: mobileActiveFile === 1 ? '#2563eb' : '#6b7280'
            }}
          >
            📄 {file1Name || 'Document 1'}
          </button>
          <button
            onClick={() => setMobileActiveFile(2)}
            style={{
              flex: 1,
              background: mobileActiveFile === 2 ? 'white' : 'transparent',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              color: mobileActiveFile === 2 ? '#2563eb' : '#6b7280'
            }}
          >
            📄 {file2Name || 'Document 2'}
          </button>
        </div>

        {/* Change navigation for mobile */}
        {totalChanges > 0 && (
          <div style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={goToPrevChange}
              disabled={currentChange === 0}
              style={{
                background: currentChange === 0 ? '#f3f4f6' : '#2563eb',
                color: currentChange === 0 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentChange === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>
            
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Change {currentChange + 1} of {totalChanges}
            </span>
            
            <button
              onClick={goToNextChange}
              disabled={currentChange === totalChanges - 1}
              style={{
                background: currentChange === totalChanges - 1 ? '#f3f4f6' : '#2563eb',
                color: currentChange === totalChanges - 1 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: currentChange === totalChanges - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Single document view */}
        {mobileActiveFile === 1 ? 
          renderDocumentPanel(file1Data, file1Name, 1) :
          renderDocumentPanel(file2Data, file2Name, 2)
        }
      </div>
    );
  }

  // Desktop view (side-by-side)
  return (
    <div>
      {/* Change navigation bar */}
      {totalChanges > 0 && (
        <div style={{
          background: '#f8fafc',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={goToPrevChange}
              disabled={currentChange === 0}
              style={{
                background: currentChange === 0 ? '#f3f4f6' : '#2563eb',
                color: currentChange === 0 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: currentChange === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Previous Change
            </button>
            
            <button
              onClick={goToNextChange}
              disabled={currentChange === totalChanges - 1}
              style={{
                background: currentChange === totalChanges - 1 ? '#f3f4f6' : '#2563eb',
                color: currentChange === totalChanges - 1 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: currentChange === totalChanges - 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Next Change →
            </button>
          </div>
          
          <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
            <strong>Change {currentChange + 1} of {totalChanges}</strong>
            {allChanges[currentChange] && (
              <span style={{ marginLeft: '8px' }}>
                (Page {allChanges[currentChange].page}, {allChanges[currentChange].type})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#dcfce7', 
            border: '1px solid #166534',
            borderRadius: '3px' 
          }} />
          <span>Added</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#fee2e2', 
            border: '1px solid #dc2626',
            borderRadius: '3px' 
          }} />
          <span>Removed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: '#fef3c7', 
            border: '1px solid #92400e',
            borderRadius: '3px' 
          }} />
          <span>Modified</span>
        </div>
      </div>

      {/* Side-by-side document panels */}
      <div style={{
        display: 'flex',
        gap: '20px',
        minHeight: '600px'
      }}>
        {renderDocumentPanel(file1Data, file1Name, 1)}
        {renderDocumentPanel(file2Data, file2Name, 2)}
      </div>

      {/* Summary footer */}
      <div style={{
        background: '#f9fafb',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {totalChanges > 0 ? (
          <>
            <strong>{totalChanges} changes found</strong> across {results.total_pages || 0} pages • 
            {results.similarity_score || 0}% similarity • 
            Use navigation buttons above to jump between changes
          </>
        ) : (
          <strong>No changes detected</strong> - Documents appear to be identical
        )}
      </div>
    </div>
  );
};

export default PDFSideBySideView;
