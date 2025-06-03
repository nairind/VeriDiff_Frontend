import React from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  // Get all changes for highlighting
  const allChanges = results?.text_changes || [];

  // Function to find if a paragraph has changes
  const findParagraphChange = (pageNumber, paragraphIndex, fileNumber) => {
    return allChanges.find(change => 
      change.page === pageNumber && 
      change.paragraph === paragraphIndex &&
      (change.file === `file${fileNumber}` || change.file === 'both')
    );
  };

  // Function to get colors for change types
  const getChangeColors = (changeType) => {
    switch (changeType) {
      case 'added':
        return { background: '#dcfce7', border: '#166534', color: '#166534' };
      case 'removed':
        return { background: '#fee2e2', border: '#dc2626', color: '#dc2626' };
      case 'modified':
        return { background: '#fef3c7', border: '#d97706', color: '#92400e' };
      default:
        return { background: 'transparent', border: 'transparent', color: '#374151' };
    }
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{
        background: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📄 Side-by-Side Document Comparison</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>
          <strong>{results?.differences_found || 0} changes found</strong> • 
          {results?.similarity_score || 0}% similarity
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
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

      {/* Side-by-Side Document Panels */}
      <div style={{
        display: 'flex',
        gap: '20px',
        minHeight: '600px'
      }}>
        {/* Left Panel - File 1 */}
        <div style={{
          flex: 1,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600'
          }}>
            📄 {file1Name || 'Document 1'}
          </div>
          
          <div style={{
            height: '600px',
            overflowY: 'auto',
            padding: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            {(results?.file1_pages || []).map((page) => (
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
                  const change = findParagraphChange(page.page_number, paraIndex, 1);
                  const colors = getChangeColors(change?.type);
                  
                  return (
                    <div 
                      key={paraIndex} 
                      style={{ 
                        marginBottom: '12px',
                        padding: change ? '8px 12px' : '4px 0',
                        background: colors.background,
                        border: change ? `1px solid ${colors.border}` : 'none',
                        borderRadius: change ? '6px' : '0',
                        color: colors.color,
                        fontWeight: change ? '500' : 'normal',
                        position: 'relative'
                      }}
                    >
                      {/* Change type badge */}
                      {change && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: colors.border,
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {change.type}
                        </div>
                      )}
                      {para.text}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - File 2 */}
        <div style={{
          flex: 1,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600'
          }}>
            📄 {file2Name || 'Document 2'}
          </div>
          
          <div style={{
            height: '600px',
            overflowY: 'auto',
            padding: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            {(results?.file2_pages || []).map((page) => (
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
                  const change = findParagraphChange(page.page_number, paraIndex, 2);
                  const colors = getChangeColors(change?.type);
                  
                  return (
                    <div 
                      key={paraIndex} 
                      style={{ 
                        marginBottom: '12px',
                        padding: change ? '8px 12px' : '4px 0',
                        background: colors.background,
                        border: change ? `1px solid ${colors.border}` : 'none',
                        borderRadius: change ? '6px' : '0',
                        color: colors.color,
                        fontWeight: change ? '500' : 'normal',
                        position: 'relative'
                      }}
                    >
                      {/* Change type badge */}
                      {change && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: colors.border,
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {change.type}
                        </div>
                      )}
                      {para.text}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div style={{
        background: '#f9fafb',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {allChanges.length > 0 ? (
          <>
            <strong>{allChanges.length} changes highlighted</strong> across {results?.total_pages || 0} pages • 
            Scroll through both documents to see all differences
          </>
        ) : (
          <strong>No changes detected</strong> - Documents appear to be identical
        )}
      </div>
    </div>
  );
};

export default PDFSideBySideView;
