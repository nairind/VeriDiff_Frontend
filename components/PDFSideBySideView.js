// components/PDFSideBySideView.js
import { useState } from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  const [currentChange, setCurrentChange] = useState(0);

  // Safety check
  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No comparison data available.
      </div>
    );
  }

  const allChanges = results.text_changes || [];
  const totalChanges = allChanges.length;

  // Basic change navigation
  const goToNextChange = () => {
    if (currentChange < totalChanges - 1) {
      setCurrentChange(currentChange + 1);
    }
  };

  const goToPrevChange = () => {
    if (currentChange > 0) {
      setCurrentChange(currentChange - 1);
    }
  };

  return (
    <div>
      {/* Change navigation */}
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
            border: '1px solid #92400e',
            borderRadius: '3px' 
          }}></div>
          <span>Modified</span>
        </div>
      </div>

      {/* Side-by-side document panels */}
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
            padding: '15px 20px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937'
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
            {(results.file1_pages || []).map((page) => (
              <div key={page.page_number} style={{ marginBottom: '30px' }}>
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
                
                {(page.paragraphs || []).map((para, paraIndex) => {
                  const hasChange = allChanges.find(c => 
                    c.page === page.page_number && 
                    c.paragraph === paraIndex &&
                    (c.file === 'file1' || c.file === 'both')
                  );
                  
                  return (
                    <div
                      key={paraIndex}
                      style={{
                        marginBottom: '12px',
                        padding: hasChange ? '8px 12px' : '4px 0',
                        background: hasChange ? 
                          (hasChange.type === 'added' ? '#dcfce7' : 
                           hasChange.type === 'removed' ? '#fee2e2' : '#fef3c7') : 
                          'transparent',
                        border: hasChange ? 
                          (hasChange.type === 'added' ? '1px solid #166534' : 
                           hasChange.type === 'removed' ? '1px solid #dc2626' : '1px solid #92400e') : 
                          'none',
                        borderRadius: hasChange ? '6px' : '0',
                        position: 'relative'
                      }}
                    >
                      {hasChange && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: hasChange.type === 'added' ? '#166534' : 
                                     hasChange.type === 'removed' ? '#dc2626' : '#92400e',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {hasChange.type}
                        </div>
                      )}
                      
                      <div style={{
                        color: hasChange ? 
                          (hasChange.type === 'added' ? '#166534' : 
                           hasChange.type === 'removed' ? '#dc2626' : '#92400e') : 
                          '#374151',
                        fontWeight: hasChange ? '500' : 'normal'
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
            padding: '15px 20px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937'
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
            {(results.file2_pages || []).map((page) => (
              <div key={page.page_number} style={{ marginBottom: '30px' }}>
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
                
                {(page.paragraphs || []).map((para, paraIndex) => {
                  const hasChange = allChanges.find(c => 
                    c.page === page.page_number && 
                    c.paragraph === paraIndex &&
                    (c.file === 'file2' || c.file === 'both')
                  );
                  
                  return (
                    <div
                      key={paraIndex}
                      style={{
                        marginBottom: '12px',
                        padding: hasChange ? '8px 12px' : '4px 0',
                        background: hasChange ? 
                          (hasChange.type === 'added' ? '#dcfce7' : 
                           hasChange.type === 'removed' ? '#fee2e2' : '#fef3c7') : 
                          'transparent',
                        border: hasChange ? 
                          (hasChange.type === 'added' ? '1px solid #166534' : 
                           hasChange.type === 'removed' ? '1px solid #dc2626' : '1px solid #92400e') : 
                          'none',
                        borderRadius: hasChange ? '6px' : '0',
                        position: 'relative'
                      }}
                    >
                      {hasChange && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: hasChange.type === 'added' ? '#166534' : 
                                     hasChange.type === 'removed' ? '#dc2626' : '#92400e',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {hasChange.type}
                        </div>
                      )}
                      
                      <div style={{
                        color: hasChange ? 
                          (hasChange.type === 'added' ? '#166534' : 
                           hasChange.type === 'removed' ? '#dc2626' : '#92400e') : 
                          '#374151',
                        fontWeight: hasChange ? '500' : 'normal'
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
