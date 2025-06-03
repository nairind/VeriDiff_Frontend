import React from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  const allChanges = results?.text_changes || [];

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

  return (
    <div>
      <div style={{
        background: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📄 Side-by-Side Document Comparison</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>
          <strong>{allChanges.length} changes found</strong> • {results?.similarity_score || 0}% similarity
        </p>
      </div>

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

      <div style={{
        display: 'flex',
        gap: '20px',
        minHeight: '600px'
      }}>
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
      </div>

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
          <span>
            <strong>{allChanges.length} changes highlighted</strong> across {results?.total_pages || 0} pages
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
