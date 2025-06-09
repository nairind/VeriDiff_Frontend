// components/PdfResults.js - Simplified Working Version
import { useState } from 'react';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'sideBySide'

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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle Buttons */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                background: viewMode === 'summary' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'summary' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'summary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📊 Summary View
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              style={{
                background: viewMode === 'sideBySide' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'sideBySide' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'sideBySide' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📄 Side-by-Side View
            </button>
          </div>

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
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'summary' ? (
        /* SUMMARY VIEW */
        <>
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
                  📋 Pages with Changes ({results.page_differences.length} pages)
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
                    {/* Page Header - Clickable */}
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
                      
                      <div style={{
                        fontSize: '1.2rem',
                        transform: expandedPages.has(page.page_number) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>
                        ⌄
                      </div>
                    </div>

                    {/* Page Details - Expandable */}
                    {expandedPages.has(page.page_number) && (
                      <div style={{ padding: '20px' }}>
                        {results.text_changes
                          ?.filter(change => change.page === page.page_number)
                          ?.map((change, changeIndex) => {
                            const getChangeColor = (type) => {
                              switch (type) {
                                case 'added': return '#22c55e';
                                case 'removed': return '#ef4444';
                                case 'modified': return '#f59e0b';
                                default: return '#6b7280';
                              }
                            };

                            const getChangeBackground = (type) => {
                              switch (type) {
                                case 'added': return '#dcfce7';
                                case 'removed': return '#fee2e2';
                                case 'modified': return '#fef3c7';
                                default: return '#f3f4f6';
                              }
                            };

                            return (
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
                            );
                          }) || (
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
                No differences were found between the PDF documents.
              </p>
            </div>
          )}
        </>
      ) : (
        /* SIDE-BY-SIDE VIEW */
        <div>
          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#dcfce7',
                border: '1px solid #166534',
                borderRadius: '3px'
              }}></div>
              <span>Added</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#fee2e2',
                border: '1px solid #dc2626',
                borderRadius: '3px'
              }}></div>
              <span>Removed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            height: '600px'
          }}>
            {/* Document 1 Panel */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'white'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file1Name || 'Document 1'}
              </div>
              <div style={{
                height: 'calc(600px - 60px)',
                overflowY: 'auto',
                padding: '20px'
              }}>
                {(results.file1_pages || []).map(page => (
                  <div key={page.page_number} style={{ marginBottom: '30px' }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}>
                      Page {page.page_number}
                    </div>
                    {(page.paragraphs || []).map((para, index) => {
                      const change = (results.text_changes || []).find(c => 
                        c.page === page.page_number && c.paragraph === index
                      );
                      
                      let style = {
                        marginBottom: '12px',
                        padding: '8px 0',
                        lineHeight: '1.6',
                        color: '#374151'
                      };

                      if (change) {
                        switch (change.type) {
                          case 'added':
                            style = {
                              ...style,
                              background: '#dcfce7',
                              border: '1px solid #166534',
                              color: '#166534',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'removed':
                            style = {
                              ...style,
                              background: '#fee2e2',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'modified':
                            style = {
                              ...style,
                              background: '#fef3c7',
                              border: '1px solid #d97706',
                              color: '#92400e',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                        }
                      }

                      return (
                        <div key={index} style={style}>
                          {para.text}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Document 2 Panel */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'white'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file2Name || 'Document 2'}
              </div>
              <div style={{
                height: 'calc(600px - 60px)',
                overflowY: 'auto',
                padding: '20px'
              }}>
                {(results.file2_pages || []).map(page => (
                  <div key={page.page_number} style={{ marginBottom: '30px' }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}>
                      Page {page.page_number}
                    </div>
                    {(page.paragraphs || []).map((para, index) => {
                      const change = (results.text_changes || []).find(c => 
                        c.page === page.page_number && c.paragraph === index
                      );
                      
                      let style = {
                        marginBottom: '12px',
                        padding: '8px 0',
                        lineHeight: '1.6',
                        color: '#374151'
                      };

                      if (change) {
                        switch (change.type) {
                          case 'added':
                            style = {
                              ...style,
                              background: '#dcfce7',
                              border: '1px solid #166534',
                              color: '#166534',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'removed':
                            style = {
                              ...style,
                              background: '#fee2e2',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'modified':
                            style = {
                              ...style,
                              background: '#fef3c7',
                              border: '1px solid #d97706',
                              color: '#92400e',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                        }
                      }

                      return (
                        <div key={index} style={style}>
                          {para.text}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
        </div>
      ) : (
        /* SIDE-BY-SIDE VIEW */
        <div>
          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#dcfce7',
                border: '1px solid #166534',
                borderRadius: '3px'
              }}></div>
              <span>Added</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#fee2e2',
                border: '1px solid #dc2626',
                borderRadius: '3px'
              }}></div>
              <span>Removed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            height: '600px'
          }}>
            {/* Document 1 Panel */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'white'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file1Name || 'Document 1'}
              </div>
              <div style={{
                height: 'calc(600px - 60px)',
                overflowY: 'auto',
                padding: '20px'
              }}>
                {(results.file1_pages || []).map(page => (
                  <div key={page.page_number} style={{ marginBottom: '30px' }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}>
                      Page {page.page_number}
                    </div>
                    {(page.paragraphs || []).map((para, index) => {
                      const change = (results.text_changes || []).find(c => 
                        c.page === page.page_number && c.paragraph === index
                      );
                      
                      let style = {
                        marginBottom: '12px',
                        padding: '8px 0',
                        lineHeight: '1.6',
                        color: '#374151'
                      };

                      if (change) {
                        switch (change.type) {
                          case 'added':
                            style = {
                              ...style,
                              background: '#dcfce7',
                              border: '1px solid #166534',
                              color: '#166534',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'removed':
                            style = {
                              ...style,
                              background: '#fee2e2',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'modified':
                            style = {
                              ...style,
                              background: '#fef3c7',
                              border: '1px solid #d97706',
                              color: '#92400e',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                        }
                      }

                      return (
                        <div key={index} style={style}>
                          {para.text}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Document 2 Panel */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'white'
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file2Name || 'Document 2'}
              </div>
              <div style={{
                height: 'calc(600px - 60px)',
                overflowY: 'auto',
                padding: '20px'
              }}>
                {(results.file2_pages || []).map(page => (
                  <div key={page.page_number} style={{ marginBottom: '30px' }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}>
                      Page {page.page_number}
                    </div>
                    {(page.paragraphs || []).map((para, index) => {
                      const change = (results.text_changes || []).find(c => 
                        c.page === page.page_number && c.paragraph === index
                      );
                      
                      let style = {
                        marginBottom: '12px',
                        padding: '8px 0',
                        lineHeight: '1.6',
                        color: '#374151'
                      };

                      if (change) {
                        switch (change.type) {
                          case 'added':
                            style = {
                              ...style,
                              background: '#dcfce7',
                              border: '1px solid #166534',
                              color: '#166534',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'removed':
                            style = {
                              ...style,
                              background: '#fee2e2',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                          case 'modified':
                            style = {
                              ...style,
                              background: '#fef3c7',
                              border: '1px solid #d97706',
                              color: '#92400e',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            };
                            break;
                        }
                      }

                      return (
                        <div key={index} style={style}>
                          {para.text}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
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
        Time: {results.processing_time?.total_time_ms || 'N/A'}ms
      </div>
    </div>
  );
};

export default PdfResults;
