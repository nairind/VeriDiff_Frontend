import React, { useState, useEffect } from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [screenSize, setScreenSize] = useState('desktop');
  
  const allChanges = results?.text_changes || [];

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const findParagraphChange = (pageNumber, paragraphIndex, fileNumber) => {
    return allChanges.find(change => 
      change.page === pageNumber && 
      change.paragraph === paragraphIndex &&
      (change.file === `file${fileNumber}` || change.file === 'both')
    );
  };

  const getHighlightStyle = (changeType) => {
    if (changeType === 'added') {
      return {
        background: '#dcfce7',
        border: '1px solid #166534',
        color: '#166534',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    if (changeType === 'removed') {
      return {
        background: '#fee2e2',
        border: '1px solid #dc2626',
        color: '#dc2626',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    if (changeType === 'modified') {
      return {
        background: '#fef3c7',
        border: '1px solid #d97706',
        color: '#92400e',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    return {
      padding: '4px 0',
      color: '#374151'
    };
  };

  const renderDocument = (pages, fileName, fileNumber) => {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        height: screenSize === 'mobile' ? 'auto' : '700px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          fontSize: screenSize === 'mobile' ? '0.95rem' : '1rem'
        }}>
          📄 {fileName || `Document ${fileNumber}`}
        </div>
        
        <div style={{
          height: screenSize === 'mobile' ? '400px' : '600px',
          overflowY: 'auto',
          padding: screenSize === 'mobile' ? '15px' : '20px',
          fontSize: screenSize === 'mobile' ? '0.85rem' : '0.9rem',
          lineHeight: '1.6'
        }}>
          {(pages || []).map((page) => (
            <div key={page.page_number} style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#f3f4f6',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Page {page.page_number}
              </div>
              
              {(page.paragraphs || []).map((para, paraIndex) => {
                const change = findParagraphChange(page.page_number, paraIndex, fileNumber);
                const style = getHighlightStyle(change?.type);
                
                return (
                  <div key={paraIndex} style={{ marginBottom: '12px', ...style }}>
                    {para.text}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#f8fafc',
        padding: screenSize === 'mobile' ? '12px' : '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          margin: '0 0 10px 0',
          fontSize: screenSize === 'mobile' ? '1.1rem' : '1.3rem'
        }}>
          📄 Side-by-Side Document Comparison
        </h3>
        <p style={{ 
          margin: 0, 
          color: '#6b7280',
          fontSize: screenSize === 'mobile' ? '0.85rem' : '0.95rem'
        }}>
          <strong>{allChanges.length} changes found</strong> • {results?.similarity_score || 0}% similarity
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: screenSize === 'mobile' ? '12px' : '20px',
        marginBottom: '20px',
        fontSize: screenSize === 'mobile' ? '0.8rem' : '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#dcfce7', 
            border: '1px solid #166534',
            borderRadius: '3px' 
          }}></div>
          <span>Added</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#fee2e2', 
            border: '1px solid #dc2626',
            borderRadius: '3px' 
          }}></div>
          <span>Removed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#fef3c7', 
            border: '1px solid #d97706',
            borderRadius: '3px' 
          }}></div>
          <span>Modified</span>
        </div>
      </div>

      {/* Mobile: Tab View */}
      {screenSize === 'mobile' && (
        <div>
          {/* Tab Buttons */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab(1)}
              style={{
                flex: 1,
                background: activeTab === 1 ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 1 ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📄 {file1Name ? file1Name.substring(0, 20) + '...' : 'Document 1'}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              style={{
                flex: 1,
                background: activeTab === 2 ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 2 ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📄 {file2Name ? file2Name.substring(0, 20) + '...' : 'Document 2'}
            </button>
          </div>

          {/* Single Document View */}
          {activeTab === 1 ? 
            renderDocument(results?.file1_pages, file1Name, 1) :
            renderDocument(results?.file2_pages, file2Name, 2)
          }
        </div>
      )}

      {/* Tablet: Stacked View */}
      {screenSize === 'tablet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {renderDocument(results?.file1_pages, file1Name, 1)}
          {renderDocument(results?.file2_pages, file2Name, 2)}
        </div>
      )}

      {/* Desktop: Side-by-Side View */}
      {screenSize === 'desktop' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            {renderDocument(results?.file1_pages, file1Name, 1)}
          </div>
          <div style={{ flex: 1 }}>
            {renderDocument(results?.file2_pages, file2Name, 2)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        background: '#f9fafb',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: screenSize === 'mobile' ? '0.8rem' : '0.9rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {allChanges.length > 0 ? (
          <span>
            <strong>{allChanges.length} changes highlighted</strong> across {results?.total_pages || 0} pages
            {screenSize === 'mobile' && <span><br />Swipe between tabs to compare documents</span>}
          </span>
        ) : (
          <span>
            <strong>No changes detected</strong> - Documents appear to be identical
          </span>
        )}
      </div>
    </div>
  );
};

export default PDFSideBySideView;
