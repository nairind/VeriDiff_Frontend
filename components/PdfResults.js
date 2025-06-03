// components/PdfResults.js
import { useState } from 'react';

const PdfResults = ({ results, file1Name, file2Name }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Toggle page expansion
  const togglePageExpansion = (pageNumber) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageNumber)) {
      newExpanded.delete(pageNumber);
    } else {
      newExpanded.add(pageNumber);
    }
    setExpandedPages(newExpanded);
  };

  // Expand/collapse all pages
  const toggleAllPages = () => {
    if (expandedPages.size === results.page_differences?.length) {
      setExpandedPages(new Set());
    } else {
      const allPages = new Set(results.page_differences?.map(p => p.page_number) || []);
      setExpandedPages(allPages);
    }
  };

  // Generate and download detailed report
  const downloadReport = async () => {
    setDownloadingReport(true);
    try {
      const reportContent = generateDetailedReport();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDF_Comparison_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  };

  // Generate comprehensive text report
  const generateDetailedReport = () => {
    const timestamp = new Date().toLocaleString();
    const line = '='.repeat(80);
    
    return `${line}
PDF DOCUMENT COMPARISON REPORT
Generated: ${timestamp}
${line}

FILE INFORMATION:
• File 1: ${file1Name || 'Document 1'}
• File 2: ${file2Name || 'Document 2'}

DOCUMENT STATISTICS:
• File 1: ${results.file1_metadata?.totalPages || 0} pages, ${results.file1_metadata?.totalWords || 0} words
• File 2: ${results.file2_metadata?.totalPages || 0} pages, ${results.file2_metadata?.totalWords || 0} words
• Total Pages Compared: ${results.total_pages || 0}

COMPARISON SUMMARY:
• Overall Similarity: ${results.similarity_score || 0}%
• Total Differences Found: ${results.differences_found || 0}
• Total Matches Found: ${results.matches_found || 0}
• Pages with Changes: ${results.page_differences?.length || 0}

CHANGE BREAKDOWN:
• Added Content: ${results.added_count || 0} items
• Removed Content: ${results.removed_count || 0} items
• Modified Content: ${results.modified_count || 0} items

WORD COUNT ANALYSIS:
• File 1 Total Words: ${results.word_changes?.file1_words || 0}
• File 2 Total Words: ${results.word_changes?.file2_words || 0}
• Word Difference: ${results.word_changes?.word_difference || 0}
• Word Change Percentage: ${results.word_changes?.word_change_percentage || 0}%

${line}
DETAILED CHANGES BY PAGE:
${line}

${results.page_differences?.map(page => `
PAGE ${page.page_number} - ${page.changes_count} Change${page.changes_count > 1 ? 's' : ''}:
${'-'.repeat(40)}
${results.text_changes
  ?.filter(change => change.page === page.page_number)
  ?.map((change, index) => {
    let changeText = `${index + 1}. [${change.type.toUpperCase()}] `;
    if (change.type === 'modified') {
      changeText += `Paragraph ${change.paragraph}:\n   OLD: "${change.old_text}"\n   NEW: "${change.new_text}"`;
    } else {
      changeText += `Paragraph ${change.paragraph}: "${change.text}"`;
    }
    return changeText;
  }).join('\n\n') || 'No detailed changes available'}
`).join('\n') || 'No page differences found'}

${line}
PROCESSING INFORMATION:
• Comparison Type: ${results.comparison_type || 'PDF Document'}
• Processing Method: ${results.processing_note || 'Standard PDF comparison'}
• Processing Time: ${results.processing_time?.total_time_ms || 'N/A'}ms
• Quality Rate: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%

${line}
TECHNICAL DETAILS:
• File 1 Success Rate: ${Math.round((results.quality_metrics?.file1_success_rate || 1) * 100)}%
• File 2 Success Rate: ${Math.round((results.quality_metrics?.file2_success_rate || 1) * 100)}%
• Comparison Options: ${JSON.stringify(results.comparison_options || {}, null, 2)}

${line}
END OF REPORT
${line}`;
  };

  // Get status color for different change types
  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return '#22c55e';
      case 'removed': return '#ef4444';
      case 'modified': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Get status background color
  const getChangeBackground = (type) => {
    switch (type) {
      case 'added': return '#dcfce7';
      case 'removed': return '#fee2e2';
      case 'modified': return '#fef3c7';
      default: return '#f3f4f6';
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
      {/* Header Section */}
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
          disabled={downloadingReport}
          style={{
            background: downloadingReport ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: downloadingReport ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {downloadingReport ? '⏳' : '📥'} 
          {downloadingReport ? 'Generating...' : 'Download Report'}
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

      {/* Page Differences Section */}
      {results.page_differences && results.page_differences.length > 0 ? (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: 0,
              color: '#1f2937'
            }}>
              📋 Page-by-Page Changes ({results.page_differences.length} pages affected)
            </h3>
            
            <button
              onClick={toggleAllPages}
              style={{
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              {expandedPages.size === results.page_differences.length ? '📕 Collapse All' : '📖 Expand All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.page_differences.map((page, index) => (
              <div
                key={page.page_number}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                {/* Page Header */}
                <div
                  onClick={() => togglePageExpansion(page.page_number)}
                  style={{
                    background: '#f8fafc',
                    padding: '15px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: expandedPages.has(page.page_number) ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      📄 Page {page.page_number}
                    </h4>
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.9rem',
                      color: '#6b7280'
                    }}>
                      {page.summary} • {page.page1_paragraphs || 0} → {page.page2_paragraphs || 0} paragraphs
                    </p>
                  </div>
                  
                  <div style={{
                    fontSize: '1.2rem',
                    transform: expandedPages.has(page.page_number) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}>
                    ⌄
                  </div>
                </div>

                {/* Page Details */}
                {expandedPages.has(page.page_number) && (
                  <div style={{ padding: '20px' }}>
                    {results.text_changes
                      ?.filter(change => change.page === page.page_number)
                      ?.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          style={{
                            background: getChangeBackground(change.type),
                            border: `1px solid ${getChangeColor(change.type)}`,
                            borderRadius: '6px',
                            padding: '15px',
                            marginBottom: changeIndex < results.text_changes.filter(c => c.page === page.page_number).length - 1 ? '12px' : '0'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px'
                          }}>
                            <span style={{
                              background: getChangeColor(change.type),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {change.type}
                            </span>
                            <span style={{
                              fontSize: '0.9rem',
                              color: '#6b7280'
                            }}>
                              Paragraph {change.paragraph}
                            </span>
                          </div>

                          {change.type === 'modified' ? (
                            <div style={{ fontSize: '0.9rem' }}>
                              <div style={{
                                background: '#fee2e2',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                border: '1px solid #fca5a5'
                              }}>
                                <strong style={{ color: '#dc2626' }}>❌ Original:</strong>
                                <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                  "{change.old_text}"
                                </div>
                              </div>
                              <div style={{
                                background: '#dcfce7',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #a7f3d0'
                              }}>
                                <strong style={{ color: '#166534' }}>✅ New:</strong>
                                <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                  "{change.new_text}"
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              fontSize: '0.9rem',
                              fontFamily: 'monospace',
                              lineHeight: '1.4',
                              color: '#374151'
                            }}>
                              "{change.text}"
                            </div>
                          )}
                        </div>
                      )) || (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          No detailed changes available for this page
                        </div>
                      )}
                  </div>
                )}
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
            No differences were found between the PDF documents. The content appears to be identical.
          </p>
        </div>
      )}

      {/* Word Count Analysis */}
      {results.word_changes && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '25px'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            margin: '0 0 15px 0',
            color: '#1f2937'
          }}>
            📊 Word Count Analysis
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <strong>File 1:</strong> {results.word_changes.file1_words} words
            </div>
            <div>
              <strong>File 2:</strong> {results.word_changes.file2_words} words
            </div>
            <div>
              <strong>Difference:</strong> {results.word_changes.word_difference} words
            </div>
            <div>
              <strong>Change:</strong> {results.word_changes.word_change_percentage}%
            </div>
          </div>
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
        Time: {results.processing_time?.total_time_ms || 'N/A'}ms •
        Type: {results.comparison_type || 'PDF Document'}
      </div>
    </div>
  );
};

export default PdfResults;
