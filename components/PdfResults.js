import { useState, useRef, useCallback } from 'react';

const ImprovedPdfResults = ({ results, file1Name, file2Name }) => {
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [viewMode, setViewMode] = useState('changes');
  const [selectedPage, setSelectedPage] = useState(null);
  const [showContext, setShowContext] = useState(true);
  
  // Refs for synchronized scrolling
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Mock data to demonstrate the improved design
  const mockResults = {
    similarity_score: 87,
    differences_found: 12,
    total_pages: 45,
    page_differences: [
      {
        page_number: 3,
        summary: "Account information updated",
        changes_count: 2
      },
      {
        page_number: 7,
        summary: "Contact details modified",
        changes_count: 1
      },
      {
        page_number: 12,
        summary: "Terms and conditions revised", 
        changes_count: 3
      }
    ],
    text_changes: [
      {
        page: 3,
        paragraph: 1,
        type: 'modified',
        old_text: 'Bank: First National Bank',
        new_text: 'Account Name: TechCorp Solutions',
        context_before: 'Customer Information:',
        context_after: 'Account Type: Business Checking'
      },
      {
        page: 3,
        paragraph: 2,
        type: 'modified',
        old_text: 'Account Name: TechCorp Solutions',
        new_text: 'Account Number: 1234567890',
        context_before: 'Account Name: TechCorp Solutions',
        context_after: 'Routing Number: 987654321'
      },
      {
        page: 7,
        paragraph: 5,
        type: 'added',
        new_text: 'Emergency Contact: John Smith (555) 123-4567',
        context_before: 'Primary Contact: Jane Doe',
        context_after: 'Department: IT Operations'
      },
      {
        page: 12,
        paragraph: 1,
        type: 'removed',
        old_text: 'This agreement is valid for 12 months only.',
        context_before: 'Terms of Service:',
        context_after: 'All parties agree to the following conditions:'
      }
    ],
    processing_time: { total_time_ms: 1247 },
    file1_metadata: { totalPages: 45, totalWords: 12450 },
    file2_metadata: { totalPages: 45, totalWords: 12523 }
  };

  const data = results || mockResults;

  // Synchronized scrolling functions
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

  const downloadReport = () => {
    setIsGeneratingDownload(true);
    setTimeout(() => setIsGeneratingDownload(false), 2000);
  };

  const renderSummaryStats = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #3b82f6',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#1d4ed8',
          marginBottom: '5px'
        }}>
          {data.similarity_score}%
        </div>
        <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>
          Similarity Score
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #f97316',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#c2410c',
          marginBottom: '5px'
        }}>
          {data.differences_found}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#ea580c', fontWeight: '600' }}>
          Changes Found
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, #bbf7d0, #86efac)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #22c55e',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#15803d',
          marginBottom: '5px'
        }}>
          {data.page_differences?.length || 0}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '600' }}>
          Pages Modified
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, #e9d5ff, #d8b4fe)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #a855f7',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#7c3aed',
          marginBottom: '5px'
        }}>
          {data.total_pages}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#6d28d9', fontWeight: '600' }}>
          Total Pages
        </div>
      </div>
    </div>
  );

  const renderChangeItem = (change, index) => {
    const getChangeIcon = (type) => {
      switch (type) {
        case 'added': return '➕';
        case 'removed': return '➖';
        case 'modified': return '✏️';
        default: return '📝';
      }
    };

    const getChangeColors = (type) => {
      switch (type) {
        case 'added': 
          return {
            background: '#dcfce7',
            border: '#22c55e',
            badgeColor: '#166534',
            badgeBg: '#bbf7d0'
          };
        case 'removed': 
          return {
            background: '#fee2e2',
            border: '#ef4444',
            badgeColor: '#dc2626',
            badgeBg: '#fca5a5'
          };
        case 'modified': 
          return {
            background: '#fef3c7',
            border: '#f59e0b',
            badgeColor: '#d97706',
            badgeBg: '#fed7aa'
          };
        default: 
          return {
            background: '#f3f4f6',
            border: '#6b7280',
            badgeColor: '#374151',
            badgeBg: '#e5e7eb'
          };
      }
    };

    const colors = getChangeColors(change.type);

    return (
      <div key={index} style={{
        background: colors.background,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        {/* Change Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>{getChangeIcon(change.type)}</span>
            <span style={{ 
              fontWeight: '600', 
              color: '#1f2937',
              fontSize: '1rem'
            }}>
              Page {change.page}, Paragraph {change.paragraph}
            </span>
            <span style={{
              background: colors.badgeBg,
              color: colors.badgeColor,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {change.type}
            </span>
          </div>
          <button
            onClick={() => setSelectedPage(change.page)}
            style={{
              background: 'white',
              color: '#2563eb',
              border: '1px solid #3b82f6',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            View Page →
          </button>
        </div>

        {/* Context Before */}
        {showContext && change.context_before && (
          <div style={{
            marginBottom: '12px',
            fontSize: '0.9rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            <strong>Context:</strong> ...{change.context_before}...
          </div>
        )}

        {/* Change Content */}
        <div style={{ marginBottom: '12px' }}>
          {change.type === 'modified' ? (
            <div>
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  color: '#dc2626', 
                  fontWeight: '600', 
                  fontSize: '0.9rem',
                  marginBottom: '8px'
                }}>
                  ❌ Original:
                </div>
                <div style={{ 
                  color: '#7f1d1d', 
                  fontFamily: 'monospace', 
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  "{change.old_text}"
                </div>
              </div>
              <div style={{
                background: '#dcfce7',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ 
                  color: '#166534', 
                  fontWeight: '600', 
                  fontSize: '0.9rem',
                  marginBottom: '8px'
                }}>
                  ✅ New:
                </div>
                <div style={{ 
                  color: '#14532d', 
                  fontFamily: 'monospace', 
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  "{change.new_text}"
                </div>
              </div>
            </div>
          ) : change.type === 'added' ? (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ 
                color: '#166534', 
                fontWeight: '600', 
                fontSize: '0.9rem',
                marginBottom: '8px'
              }}>
                ✅ Added:
              </div>
              <div style={{ 
                color: '#14532d', 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                "{change.new_text}"
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ 
                color: '#dc2626', 
                fontWeight: '600', 
                fontSize: '0.9rem',
                marginBottom: '8px'
              }}>
                ❌ Removed:
              </div>
              <div style={{ 
                color: '#7f1d1d', 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                "{change.old_text}"
              </div>
            </div>
          )}
        </div>

        {/* Context After */}
        {showContext && change.context_after && (
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            <strong>Continues:</strong> ...{change.context_after}...
          </div>
        )}
      </div>
    );
  };

  const renderChangesView = () => (
    <div>
      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          📋 Changes Found ({data.text_changes?.length || 0})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.9rem',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showContext}
              onChange={(e) => setShowContext(e.target.checked)}
              style={{ 
                width: '16px', 
                height: '16px',
                borderRadius: '4px'
              }}
            />
            Show context
          </label>
          <select 
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: 'white'
            }}
            onChange={(e) => {
              console.log('Filter by:', e.target.value);
            }}
          >
            <option value="all">All changes</option>
            <option value="added">Added only</option>
            <option value="removed">Removed only</option>
            <option value="modified">Modified only</option>
          </select>
        </div>
      </div>

      {/* Changes List */}
      <div>
        {data.text_changes?.map((change, index) => renderChangeItem(change, index)) || (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#f0fdf4',
            borderRadius: '12px',
            border: '2px solid #22c55e'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎉</div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: '#166534',
              marginBottom: '8px'
            }}>
              No differences found!
            </div>
            <div style={{ fontSize: '1rem', color: '#15803d' }}>
              The documents are identical.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSideBySideView = () => {
    // Mock document content with highlighted changes
    const mockPages = [
      {
        page: 1,
        doc1_content: [
          { text: "Customer Information:", type: "unchanged" },
          { text: "Bank: First National Bank", type: "removed" },
          { text: "Account Type: Business Checking", type: "unchanged" },
          { text: "Routing Number: 987654321", type: "unchanged" },
          { text: "Date Opened: January 15, 2024", type: "unchanged" }
        ],
        doc2_content: [
          { text: "Customer Information:", type: "unchanged" },
          { text: "Account Name: TechCorp Solutions", type: "added" },
          { text: "Account Type: Business Checking", type: "unchanged" },
          { text: "Routing Number: 987654321", type: "unchanged" },
          { text: "Date Opened: January 15, 2024", type: "unchanged" }
        ]
      },
      {
        page: 2,
        doc1_content: [
          { text: "Contact Information:", type: "unchanged" },
          { text: "Primary Contact: Jane Doe", type: "unchanged" },
          { text: "Department: IT Operations", type: "unchanged" },
          { text: "Phone: (555) 123-4567", type: "unchanged" }
        ],
        doc2_content: [
          { text: "Contact Information:", type: "unchanged" },
          { text: "Primary Contact: Jane Doe", type: "unchanged" },
          { text: "Emergency Contact: John Smith (555) 123-4567", type: "added" },
          { text: "Department: IT Operations", type: "unchanged" },
          { text: "Phone: (555) 123-4567", type: "unchanged" }
        ]
      },
      {
        page: 3,
        doc1_content: [
          { text: "Terms of Service:", type: "unchanged" },
          { text: "This agreement is valid for 12 months only.", type: "removed" },
          { text: "All parties agree to the following conditions:", type: "unchanged" },
          { text: "Payment terms: Net 30 days", type: "unchanged" },
          { text: "Late fees may apply after 30 days", type: "unchanged" }
        ],
        doc2_content: [
          { text: "Terms of Service:", type: "unchanged" },
          { text: "All parties agree to the following conditions:", type: "unchanged" },
          { text: "Payment terms: Net 30 days", type: "unchanged" },
          { text: "Late fees may apply after 30 days", type: "unchanged" }
        ]
      }
    ];

    const getHighlightStyle = (type) => {
      switch (type) {
        case 'added':
          return {
            backgroundColor: '#dcfce7',
            borderLeft: '4px solid #22c55e',
            padding: '12px 16px',
            margin: '6px 0',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          };
        case 'removed':
          return {
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            padding: '12px 16px',
            margin: '6px 0',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          };
        case 'modified':
          return {
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            padding: '12px 16px',
            margin: '6px 0',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          };
        default:
          return {
            padding: '12px 16px',
            margin: '6px 0',
            lineHeight: '1.5',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            color: '#374151'
          };
      }
    };

    return (
      <div>
        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '25px',
          fontSize: '0.9rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '16px',
              background: '#dcfce7',
              borderLeft: '4px solid #22c55e',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontWeight: '500' }}>Added</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '16px',
              background: '#fee2e2',
              borderLeft: '4px solid #ef4444',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontWeight: '500' }}>Removed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '16px',
              background: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontWeight: '500' }}>Modified</span>
          </div>
        </div>

        {/* Synchronized Side-by-Side Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          height: '500px'
        }}>
          {/* Left Document */}
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              padding: '15px 20px',
              fontWeight: '600',
              color: '#1f2937',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '1.1rem'
            }}>
              📄 {file1Name || 'Document 1'} (Original)
            </div>
            <div 
              ref={leftPaneRef}
              style={{
                height: '440px',
                overflowY: 'auto',
                padding: '20px'
              }}
              onScroll={(e) => handleScroll(e.target, rightPaneRef)}
            >
              {mockPages.map((page) => (
                <div key={`left-${page.page}`} style={{ marginBottom: '30px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    padding: '10px 15px',
                    color: '#1d4ed8',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    📄 Page {page.page}
                  </div>
                  {page.doc1_content.map((item, index) => (
                    <div 
                      key={`left-${page.page}-${index}`} 
                      style={getHighlightStyle(item.type)}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Document */}
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              padding: '15px 20px',
              fontWeight: '600',
              color: '#1f2937',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '1.1rem'
            }}>
              📄 {file2Name || 'Document 2'} (Updated)
            </div>
            <div 
              ref={rightPaneRef}
              style={{
                height: '440px',
                overflowY: 'auto',
                padding: '20px'
              }}
              onScroll={(e) => handleScroll(e.target, leftPaneRef)}
            >
              {mockPages.map((page) => (
                <div key={`right-${page.page}`} style={{ marginBottom: '30px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    padding: '10px 15px',
                    color: '#1d4ed8',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    📄 Page {page.page}
                  </div>
                  {page.doc2_content.map((item, index) => (
                    <div 
                      key={`right-${page.page}-${index}`} 
                      style={getHighlightStyle(item.type)}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              ))}
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
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        color: 'white',
        padding: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              marginBottom: '8px',
              margin: 0
            }}>
              📊 PDF Comparison Results
            </h1>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1.1rem'
            }}>
              {file1Name || 'Document 1'} vs {file2Name || 'Document 2'}
            </div>
          </div>
          <button
            onClick={downloadReport}
            disabled={isGeneratingDownload}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isGeneratingDownload ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isGeneratingDownload ? 0.7 : 1
            }}
          >
            {isGeneratingDownload ? '⏳ Generating...' : '📥 Download Report'}
          </button>
        </div>
      </div>

      <div style={{ padding: '30px' }}>
        {/* Summary Statistics */}
        {renderSummaryStats()}

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('changes')}
              style={{
                background: viewMode === 'changes' ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: viewMode === 'changes' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'changes' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              📋 Changes List
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              style={{
                background: viewMode === 'sideBySide' ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: viewMode === 'sideBySide' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'sideBySide' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              📄 Side-by-Side
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'changes' ? renderChangesView() : renderSideBySideView()}

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.9rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          ⚡ Processed in {data.processing_time?.total_time_ms}ms • 
          📄 {data.file1_metadata?.totalPages} pages • 
          📝 {data.file1_metadata?.totalWords} words analyzed
        </div>
      </div>
    </div>
  );
};

export default ImprovedPdfResults;
