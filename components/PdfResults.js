// components/PdfResults.js - Simplified Working Version
import { useState } from 'react';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);

  // Simple text report generation
  const generateTextReport = () => {
    const timestamp = new Date().toLocaleString();
    const line = '='.repeat(60);
    
    return `${line}
PDF COMPARISON REPORT
Generated: ${timestamp}
${line}

FILES COMPARED:
• File 1: ${file1Name || 'Document 1'}
• File 2: ${file2Name || 'Document 2'}

SUMMARY:
• Similarity Score: ${results.similarity_score || 0}%
• Total Pages: ${results.total_pages || 0}
• Differences Found: ${results.differences_found || 0}
• Pages with Changes: ${results.page_differences?.length || 0}

CHANGES:
• Added: ${results.added_count || 0}
• Removed: ${results.removed_count || 0}
• Modified: ${results.modified_count || 0}

${line}
DETAILED CHANGES:
${(results.page_differences || []).map(page => 
  `Page ${page.page_number}: ${page.summary}`
).join('\n')}

${line}
END OF REPORT
${line}`;
  };

  // Simple download function
  const downloadReport = () => {
    setIsGeneratingDownload(true);
    
    try {
      const content = generateTextReport();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDF_Comparison_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate report');
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        No PDF comparison results to display.
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginTop: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📑 PDF Comparison Results
        </h2>

        <button
          onClick={downloadReport}
          disabled={isGeneratingDownload}
          style={{
            background: isGeneratingDownload ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: isGeneratingDownload ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isGeneratingDownload ? '⏳ Generating...' : '📥 Download Report'}
        </button>
      </div>

      {/* File Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
            📄 File 1: {file1Name || 'Document 1'}
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            <div>📊 {results.file1_metadata?.totalPages || 0} pages</div>
            <div>📝 {results.file1_metadata?.totalWords || 0} words</div>
            <div>💾 {results.file1_metadata?.fileSize ? `${(results.file1_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
          </div>
        </div>

        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
            📄 File 2: {file2Name || 'Document 2'}
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            <div>📊 {results.file2_metadata?.totalPages || 0} pages</div>
            <div>📝 {results.file2_metadata?.totalWords || 0} words</div>
            <div>💾 {results.file2_metadata?.fileSize ? `${(results.file2_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Comparison Summary */}
      <div style={{
        background: results.similarity_score >= 90 ? '#f0fdf4' : 
                   results.similarity_score >= 70 ? '#fefce8' : '#fef2f2',
        border: `2px solid ${results.similarity_score >= 90 ? '#22c55e' : 
                             results.similarity_score >= 70 ? '#eab308' : '#ef4444'}`,
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '25px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: results.similarity_score >= 90 ? '#166534' : 
                     results.similarity_score >= 70 ? '#a16207' : '#dc2626'
            }}>
              {results.similarity_score || 0}%
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: results.similarity_score >= 90 ? '#166534' : 
                     results.similarity_score >= 70 ? '#a16207' : '#dc2626',
              fontWeight: '600'
            }}>
              Similarity Score
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
              <strong>📊 Comparison Summary:</strong>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              • <strong>{results.differences_found || 0}</strong> differences found<br/>
              • <strong>{results.matches_found || 0}</strong> matching elements<br/>
              • <strong>{results.page_differences?.length || 0}</strong> pages with changes<br/>
              • <strong>{results.total_pages || 0}</strong> total pages compared
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
              <strong>🔄 Change Breakdown:</strong>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              • <span style={{ color: '#22c55e' }}>➕ {results.added_count || 0} added</span><br/>
              • <span style={{ color: '#ef4444' }}>➖ {results.removed_count || 0} removed</span><br/>
              • <span style={{ color: '#f59e0b' }}>✏️ {results.modified_count || 0} modified</span><br/>
              • ⚡ Processed in {results.processing_time?.total_time_ms || 'N/A'}ms
            </div>
          </div>
        </div>
      </div>

      {/* Changes List */}
      {results.page_differences && results.page_differences.length > 0 ? (
        <div>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            margin: '0 0 20px 0',
            color: '#1f2937'
          }}>
            📋 Pages with Changes ({results.page_differences.length} pages)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.page_differences.map((page, index) => (
              <div
                key={page.page_number}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px 20px'
                }}
              >
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '5px'
                }}>
                  📄 Page {page.page_number}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#6b7280'
                }}>
                  {page.summary} • {page.page1_paragraphs || 0} → {page.page2_paragraphs || 0} paragraphs
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#166534',
            margin: '0 0 10px 0'
          }}>
            Perfect Match!
          </h3>
          <p style={{
            margin: 0,
            color: '#166534',
            fontSize: '1rem'
          }}>
            No differences were found between the PDF documents.
          </p>
        </div>
      )}

      {/* Processing Information */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        fontSize: '0.85rem',
        color: '#6b7280'
      }}>
        <strong>Processing Info:</strong> {results.processing_note || 'PDF comparison completed'} •
        Quality: {Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}% •
        Time: {results.processing_time?.total_time_ms || 'N/A'}ms
      </div>
    </div>
  );
};

export default PdfResults;
