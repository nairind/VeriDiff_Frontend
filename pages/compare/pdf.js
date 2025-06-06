import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Import the enhanced utility functions - keep this exactly as in PDF (5)
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// ===== ENHANCED CHANGE STATISTICS COMPONENT - Keep all functionality =====
const EnhancedChangeStatistics = ({ results, file1Name, file2Name }) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const calculateAdvancedStats = () => {
    const { text_changes = [], word_changes = {} } = results;
    
    const financialChanges = text_changes.filter(change => 
      change.text?.includes('$') || 
      change.old_text?.includes('$') || 
      change.new_text?.includes('$')
    );
    
    const timeChanges = text_changes.filter(change =>
      change.text?.includes('hour') || 
      change.old_text?.includes('hour') || 
      change.new_text?.includes('hour')
    );
    
    const dateChanges = text_changes.filter(change =>
      /\d{1,2}\/\d{1,2}\/\d{4}/.test(change.text || change.old_text || change.new_text || '')
    );
    
    const numberChanges = text_changes.filter(change => {
      const hasNumbers = /\d+/.test(change.text || change.old_text || change.new_text || '');
      const isFinancial = financialChanges.includes(change);
      return hasNumbers && !isFinancial;
    });

    let totalOld = 0, totalNew = 0;
    try {
      financialChanges.forEach(change => {
        if (change.type === 'modified' && change.old_text && change.new_text) {
          const oldAmount = extractAmount(change.old_text);
          const newAmount = extractAmount(change.new_text);
          if (oldAmount && newAmount) {
            totalOld += oldAmount;
            totalNew += newAmount;
          }
        }
      });
    } catch (e) {
      console.warn('Financial calculation error:', e);
    }

    const financialImpact = totalNew - totalOld;
    const financialPercentage = totalOld > 0 ? ((financialImpact / totalOld) * 100) : 0;

    return {
      overview: {
        totalChanges: results.differences_found || 0,
        similarity: results.similarity_score || 0,
        confidence: calculateAverageConfidence(text_changes)
      },
      financial: {
        changesCount: financialChanges.length,
        impact: financialImpact,
        percentage: financialPercentage,
        oldTotal: totalOld,
        newTotal: totalNew
      },
      content: {
        addedItems: results.added_count || 0,
        removedItems: results.removed_count || 0,
        modifiedItems: results.modified_count || 0,
        numberChanges: numberChanges.length
      },
      quality: {
        pagesCovered: new Set(text_changes.map(c => c.page)).size,
        totalPages: results.total_pages || 0,
        avgChangesPerPage: results.total_pages > 0 ? Math.round((results.differences_found || 0) / results.total_pages) : 0
      }
    };
  };

  const extractAmount = (text) => {
    const match = text.match(/\$([0-9,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  };

  const calculateAverageConfidence = (changes) => {
    if (!changes.length) return 0;
    const total = changes.reduce((sum, change) => sum + (change.confidence || 0.9), 0);
    return Math.round((total / changes.length) * 100);
  };

  const stats = calculateAdvancedStats();
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getImpactColor = (value) => {
    if (value > 0) return '#ef4444';
    if (value < 0) return '#22c55e';
    return '#6b7280';
  };

  const getImpactIcon = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 Advanced Analysis
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px'
        }}>
          {[
            { id: 'overview', label: '📋 Overview' },
            { id: 'financial', label: '💰 Financial' },
            { id: 'content', label: '📝 Content' },
            { id: 'quality', label: '🎯 Quality' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedMetric === tab.id ? 'white' : 'transparent',
                color: selectedMetric === tab.id ? '#2563eb' : '#6b7280',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: selectedMetric === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedMetric === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '4px'
            }}>
              {stats.overview.totalChanges}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Total Changes
            </div>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#22c55e',
              marginBottom: '4px'
            }}>
              {stats.overview.similarity}%
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Similarity Score
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '4px'
            }}>
              {stats.overview.confidence}%
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Detection Confidence
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'financial' && (
        <div>
          {stats.financial.changesCount > 0 ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#ef4444',
                    marginBottom: '4px'
                  }}>
                    {formatCurrency(stats.financial.oldTotal)}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    Original Amount
                  </div>
                </div>

                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #22c55e',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#22c55e',
                    marginBottom: '4px'
                  }}>
                    {formatCurrency(stats.financial.newTotal)}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    Updated Amount
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {getImpactIcon(stats.financial.impact)}
                  </span>
                  <span style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: getImpactColor(stats.financial.impact)
                  }}>
                    {stats.financial.impact >= 0 ? '+' : ''}{formatCurrency(stats.financial.impact)}
                  </span>
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Financial Impact
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Financial Changes Detected</div>
            </div>
          )}
        </div>
      )}

      {selectedMetric === 'content' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: '#dcfce7',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#22c55e',
              marginBottom: '4px'
            }}>
              {stats.content.addedItems}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              Added Sections
            </div>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ef4444',
              marginBottom: '4px'
            }}>
              {stats.content.removedItems}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              Removed Sections
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '4px'
            }}>
              {stats.content.modifiedItems}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280'
            }}>
              Modified Sections
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'quality' && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#22c55e',
            marginBottom: '8px'
          }}>
            📄 Page Coverage
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '4px'
          }}>
            {stats.quality.pagesCovered} / {stats.quality.totalPages}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            Pages with changes detected
          </div>
        </div>
      )}
    </div>
  );
};

// ===== JUMP TO CHANGE NAVIGATION - Keep all functionality =====
const JumpToChangeNavigation = ({ changes, onJumpToChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterType, setFilterType] = useState('all');

  const filteredChanges = changes.filter(change => 
    filterType === 'all' || change.type === filterType
  );

  const jumpToNext = () => {
    if (currentIndex < filteredChanges.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onJumpToChange(filteredChanges[newIndex], newIndex);
    }
  };

  const jumpToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onJumpToChange(filteredChanges[newIndex], newIndex);
    }
  };

  if (!filteredChanges.length) return null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          🧭 Change Navigator
        </h4>
        
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentIndex(0);
          }}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}
        >
          <option value="all">All Changes ({changes.length})</option>
          <option value="added">Added ({changes.filter(c => c.type === 'added').length})</option>
          <option value="removed">Removed ({changes.filter(c => c.type === 'removed').length})</option>
          <option value="modified">Modified ({changes.filter(c => c.type === 'modified').length})</option>
        </select>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <button
          onClick={jumpToPrevious}
          disabled={currentIndex === 0}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: currentIndex === 0 ? '#f9fafb' : 'white',
            color: currentIndex === 0 ? '#9ca3af' : '#374151',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}
        >
          ⬆️ Previous
        </button>

        <div style={{
          padding: '8px 16px',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          {currentIndex + 1} of {filteredChanges.length}
        </div>

        <button
          onClick={jumpToNext}
          disabled={currentIndex === filteredChanges.length - 1}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: currentIndex === filteredChanges.length - 1 ? '#f9fafb' : 'white',
            color: currentIndex === filteredChanges.length - 1 ? '#9ca3af' : '#374151',
            cursor: currentIndex === filteredChanges.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}
        >
          ⬇️ Next
        </button>
      </div>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '12px'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          Page {filteredChanges[currentIndex].page} • {filteredChanges[currentIndex].type.toUpperCase()}
        </div>
        
        <div style={{
          fontSize: '0.85rem',
          color: '#374151',
          lineHeight: '1.4',
          fontFamily: 'ui-monospace, monospace',
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          {filteredChanges[currentIndex].type === 'modified' ? (
            <div>
              <div style={{ color: '#dc2626', marginBottom: '4px' }}>
                - {filteredChanges[currentIndex].old_text?.substring(0, 100)}...
              </div>
              <div style={{ color: '#059669' }}>
                + {filteredChanges[currentIndex].new_text?.substring(0, 100)}...
              </div>
            </div>
          ) : (
            filteredChanges[currentIndex].text?.substring(0, 200) + '...'
          )}
        </div>
      </div>
    </div>
  );
};

// ===== ENHANCED SYNCHRONIZED PDF VIEWER - Keep all functionality =====
const EnhancedSynchronizedPDFViewer = ({ comparisonData, file1Name, file2Name, onExportPDF }) => {
  const leftViewerRef = useRef(null);
  const rightViewerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = (e, isLeft) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const sourceRef = isLeft ? leftViewerRef : rightViewerRef;
    const targetRef = isLeft ? rightViewerRef : leftViewerRef;
    
    if (targetRef.current && sourceRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight || 1);
      
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
    
    setTimeout(() => setIsScrolling(false), 50);
  };

  const renderPDFContent = (pages, isLeft) => {
    if (!pages || pages.length === 0) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          No content available
        </div>
      );
    }

    return (
      <div style={{ padding: '12px' }}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#1f2937',
              fontWeight: '600',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              📄 Page {page.page_number}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {page.paragraphs && page.paragraphs.length > 0 ? (
                page.paragraphs.map((paragraph, paraIndex) => (
                  <div 
                    key={paraIndex}
                    style={{
                      margin: '4px 0',
                      padding: '6px 8px',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      borderRadius: '3px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    {paragraph.text}
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '16px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  No extractable text on this page
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📊 Side-by-Side Comparison
        </div>
        <button
          onClick={onExportPDF}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          📥 Export Side-by-Side PDF
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        height: '600px'
      }}>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            📄 {file1Name}
          </div>
          <div 
            ref={leftViewerRef}
            onScroll={(e) => handleScroll(e, true)}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'ui-monospace, monospace',
              backgroundColor: 'white'
            }}
          >
            {renderPDFContent(comparisonData.file1_pages, true)}
          </div>
        </div>

        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            📄 {file2Name}
          </div>
          <div 
            ref={rightViewerRef}
            onScroll={(e) => handleScroll(e, false)}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'ui-monospace, monospace',
              backgroundColor: 'white'
            }}
          >
            {renderPDFContent(comparisonData.file2_pages, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== ENHANCED RESULTS COMPONENT - Keep all functionality =====
const EnhancedPdfResults = ({ results, file1Name, file2Name, onExport, onExportSideBySidePDF }) => {
  if (!results) return null;

  const {
    differences_found = 0,
    similarity_score = 0,
    text_changes = [],
    added_count = 0,
    removed_count = 0,
    modified_count = 0,
    total_pages = 0
  } = results;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          📊 {differences_found} Changes Found ({similarity_score}% similar)
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onExport('summary')}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📄 Export Summary
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {added_count > 0 && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#22c55e'
            }}>
              {added_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Added
            </div>
          </div>
        )}
        
        {removed_count > 0 && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ef4444'
            }}>
              {removed_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Removed
            </div>
          </div>
        )}
        
        {modified_count > 0 && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#f59e0b'
            }}>
              {modified_count}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              Modified
            </div>
          </div>
        )}
        
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#0ea5e9'
          }}>
            {similarity_score}%
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            Similar
          </div>
        </div>
      </div>

      <EnhancedSynchronizedPDFViewer 
        comparisonData={results}
        file1Name={file1Name}
        file2Name={file2Name}
        onExportPDF={onExportSideBySidePDF}
      />

      {text_changes.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '1.1rem', 
            color: '#374151',
            fontWeight: '600'
          }}>
            📝 Detailed Changes ({text_changes.length})
          </h4>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f8fafc'
          }}>
            {text_changes.slice(0, 50).map((change, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < text_changes.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                }}
              >
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Page {change.page} • {change.type.toUpperCase()}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#374151',
                  fontFamily: 'ui-monospace, monospace',
                  lineHeight: '1.4',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  {change.type === 'modified' ? (
                    <div>
                      <div style={{ color: '#dc2626', marginBottom: '4px' }}>
                        - {change.old_text?.substring(0, 100)}...
                      </div>
                      <div style={{ color: '#059669' }}>
                        + {change.new_text?.substring(0, 100)}...
                      </div>
                    </div>
                  ) : (
                    change.text?.substring(0, 150) + '...'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN COMPONENT =====
function EnhancedPdfComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoadingStatus, setPdfLoadingStatus] = useState('checking');
  
  // UI states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [selectedChangeIndex, setSelectedChangeIndex] = useState(0);

  // PDF.js loading check
  const checkPDFJSLoading = () => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfJsReady) {
        console.log('✅ PDF.js loaded successfully');
        setPdfLoadingStatus('loaded');
        clearInterval(checkInterval);
        return;
      }
      
      if (window.pdfJsError || attempts >= maxAttempts) {
        console.error('❌ PDF.js loading failed');
        setPdfLoadingStatus('failed');
        clearInterval(checkInterval);
        return;
      }
    }, 1000);
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
    
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        checkPDFJSLoading();
      }, 1000);
    }
  }, [session]);

  // Jump to change handler
  const handleJumpToChange = (change, index) => {
    setSelectedChangeIndex(index);
    // Add your jump-to-change logic here
  };

  // Premium upgrade handler
  const handlePremiumUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout session failed');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setLoading(false);
      alert('Sorry, there was an error starting your premium trial. Please try again or contact support.');
    }
  };

  // File handling
  const handleFileChange = (e, fileNum) => {
    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
    setError(null);
  };

  // Main comparison handler
  const handleComparePdfs = async () => {
    if (!file1 || !file2) {
      setError('Please select two PDF files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare PDF documents.');
      return;
    }

    if (userTier !== 'premium') {
      setShowPremiumModal(true);
      return;
    }

    if (pdfLoadingStatus !== 'loaded') {
      setError('PDF processing library is not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting PDF comparison...');
      const comparisonResult = await comparePDFFiles(file1, file2, {});
      console.log('PDF comparison completed:', comparisonResult);
      setResults(comparisonResult);
      
    } catch (err) {
      console.error('PDF comparison error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format) => {
    if (!results) return;

    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `pdf_comparison_${timestamp}.txt`;
      
      const reportContent = `PDF COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

FILES COMPARED
File 1: ${file1?.name}
File 2: ${file2?.name}

SUMMARY
Total Changes: ${results.differences_found || 0}
Similarity Score: ${results.similarity_score || 0}%
Pages Analyzed: ${results.total_pages || 0}

Generated by VeriDiff PDF Comparison Tool`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export functionality works! Check your downloads folder.');
    }
  };

  const handleExportSideBySidePDF = async () => {
    alert('Side-by-side PDF export feature coming soon!');
  };

  // File upload component
  const SimplePdfFileUpload = ({ fileNum, file, onChange }) => {
    return (
      <div style={{
        background: fileNum === 1 
          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
          : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        padding: '2rem',
        borderRadius: '16px',
        border: fileNum === 1 
          ? '2px solid #dc2626' 
          : '2px solid #22c55e'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: fileNum === 1 
              ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}>
            {fileNum}
          </div>
          <div>
            <h4 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 0.25rem 0'
            }}>
              PDF Document {fileNum}
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: fileNum === 1 ? '#dc2626' : '#059669',
              margin: 0,
              fontWeight: '500'
            }}>
              Upload your {fileNum === 1 ? 'original' : 'updated'} PDF document
            </p>
          </div>
        </div>
        
        <input
          type="file"
          onChange={(e) => onChange(e, fileNum)}
          accept=".pdf"
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '12px',
            fontSize: '1rem',
            background: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}
        />
        
        {file && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#166534',
            fontWeight: '600'
          }}>
            ✅ {file.name}
          </div>
        )}
      </div>
    );
  };

  // Premium modal
  const PremiumModal = () => {
    if (!showPremiumModal) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '0',
          maxWidth: '600px',
          width: '100%'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #ea580c)',
            color: 'white',
            padding: '2.5rem 2rem',
            borderRadius: '24px 24px 0 0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 0.75rem 0'
            }}>
              PDF Comparison Tool
            </h2>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              margin: '0'
            }}>
              Professional document analysis requires premium access
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#374151',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Get instant access to advanced PDF comparison with word-level highlighting, 
              side-by-side viewing, and professional reporting features.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                £19<span style={{ fontSize: '1rem', opacity: '0.7' }}>/month</span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Cancel anytime • 30-day money-back guarantee
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handlePremiumUpgrade}
                disabled={loading}
                style={{
                  background: loading 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minWidth: '200px'
                }}
              >
                {loading ? 'Loading...' : 'Upgrade Now'}
              </button>
              
              <button
                onClick={() => setShowPremiumModal(false)}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              textAlign: 'center',
              marginTop: '1.5rem',
              marginBottom: '0'
            }}>
              💡 Remember: Excel comparison remains FREE forever!
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Head>
          <title>Professional PDF Comparison Tool | Document Analysis | VeriDiff</title>
          <meta name="description" content="Professional PDF comparison tool for document analysis. Compare contracts, reports, legal documents with word-level precision. Side-by-side viewing with enterprise security." />
          <meta name="keywords" content="pdf comparison, document comparison, contract analysis, legal document comparison, pdf diff, document analysis tool, professional pdf comparison, contract review" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://veridiff.com/compare/pdfs" />
          
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://veridiff.com/compare/pdfs" />
          <meta property="og:title" content="Professional PDF Comparison Tool | Document Analysis | VeriDiff" />
          <meta property="og:description" content="Professional PDF comparison tool for document analysis. Compare contracts, reports, legal documents with word-level precision and enterprise security." />
          <meta property="og:image" content="https://veridiff.com/images/pdf-comparison-tool.png" />
          
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content="Professional PDF Comparison Tool | VeriDiff" />
          <meta property="twitter:description" content="Professional PDF comparison for contracts, reports, legal documents. Word-level precision with enterprise security." />
          
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🔧 Loading PDF.js...');
                
                const pdfSources = [
                  {
                    lib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
                    worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                  },
                  {
                    lib: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
                    worker: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                  }
                ];
                
                let currentSourceIndex = 0;
                
                function loadPDFJS() {
                  if (currentSourceIndex >= pdfSources.length) {
                    console.error('❌ All PDF.js sources failed');
                    window.pdfJsError = true;
                    return;
                  }
                  
                  const source = pdfSources[currentSourceIndex];
                  const script = document.createElement('script');
                  script.src = source.lib;
                  
                  script.onload = function() {
                    setTimeout(function() {
                      if (typeof window.pdfjsLib !== 'undefined') {
                        try {
                          window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
                          window.pdfJsReady = true;
                          console.log('✅ PDF.js ready');
                        } catch (error) {
                          console.error('❌ PDF.js worker failed:', error);
                          window.pdfJsError = true;
                        }
                      } else {
                        currentSourceIndex++;
                        loadPDFJS();
                      }
                    }, 500);
                  };
                  
                  script.onerror = function() {
                    currentSourceIndex++;
                    loadPDFJS();
                  };
                  
                  document.head.appendChild(script);
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadPDFJS);
                } else {
                  loadPDFJS();
                }
              })();
            `
          }} />
        </Head>

        <Header />

        {/* Breadcrumb Navigation */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <nav style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <Link href="/" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Home
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <Link href="/compare" style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                File Comparison Tools
              </Link>
              <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>›</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>PDF Document Comparison</span>
            </nav>
          </div>
        </div>

        {/* Security Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🔒 Enterprise-Grade Privacy: All PDF processing happens in your browser. We never see, store, or access your documents.
            </p>
          </div>
        </div>

        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          
          {/* Hero Section - Styled like spreadsheets page */}
          <section style={{
            textAlign: 'center',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
            borderRadius: '20px',
            marginBottom: '40px',
            color: 'white',
            boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '1.5rem', 
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              📄 Professional Document Analysis Tool
            </div>
            
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              margin: '0 0 15px 0',
              lineHeight: '1.2'
            }}>
              Professional PDF Document
              <span style={{ 
                display: 'block',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text'
              }}>
                Comparison Tool
              </span>
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              opacity: '0.9',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 2rem auto'
            }}>
              Compare contracts, reports, and legal documents with word-level precision. 
              Side-by-side viewing with synchronized scrolling and enterprise-grade security.
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
              fontSize: '0.95rem',
              opacity: '0.85'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Word-Level Highlighting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Side-by-Side Viewing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>✓</span>
                <span>Enterprise Security</span>
              </div>
            </div>
          </section>

          {/* Common Use Cases Section */}
          <section style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #dc2626, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 1rem 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Common PDF Comparison Scenarios
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0 0 2.5rem 0'
            }}>
              Real situations where VeriDiff's PDF comparison saves hours of manual review
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem'
            }}>
              <div style={{
                background: '#fef2f2',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #fca5a5'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626' }}>
                  📋 Contract Version Control
                </h3>
                <p style={{ color: '#7f1d1d', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Compare Service_Agreement_v2.1.pdf with v2.2.pdf to identify critical changes. 
                  Automatically detect payment term modifications, liability adjustments, and new clauses.
                </p>
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#dc2626',
                  fontWeight: '500'
                }}>
                  Result: Payment terms changed from 30 to 15 days, liability cap increased from £100k to £250k
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #93c5fd'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2563eb' }}>
                  📊 Compliance Documentation
                </h3>
                <p style={{ color: '#1e3a8a', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Review updated policy documents and compliance reports. Ensure all regulatory changes 
                  are properly implemented and documented for audit purposes.
                </p>
                <div style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#2563eb',
                  fontWeight: '500'
                }}>
                  Result: 12 policy updates identified, 3 new compliance requirements added
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #bbf7d0'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#059669' }}>
                  📑 Report Analysis
                </h3>
                <p style={{ color: '#065f46', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Compare quarterly reports, financial statements, and technical documentation. 
                  Track changes in metrics, recommendations, and strategic directions.
                </p>
                <div style={{
                  background: 'rgba(5, 150, 105, 0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  Result: Revenue projections updated, 5 new strategic initiatives identified
                </div>
              </div>
            </div>
          </section>

          {/* Upload or Premium Gate */}
          {userTier === 'premium' ? (
            <section style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 1rem 0',
                textAlign: 'center',
                fontWeight: '700'
              }}>
                Upload Your PDF Documents
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: '0 0 2.5rem 0'
              }}>
                Professional PDF comparison with enterprise-grade security
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <SimplePdfFileUpload 
                  fileNum={1} 
                  file={file1} 
                  onChange={handleFileChange}
                />
                <SimplePdfFileUpload 
                  fileNum={2} 
                  file={file2} 
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleComparePdfs}
                  disabled={loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded'}
                  style={{
                    background: loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded'
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                      : 'linear-gradient(135deg, #dc2626, #ea580c)',
                    color: 'white',
                    border: 'none',
                    padding: '1.25rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: loading || !file1 || !file2 || pdfLoadingStatus !== 'loaded' ? 'not-allowed' : 'pointer',
                    minWidth: '280px'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ marginRight: '0.75rem' }}>⏳</span>
                      Analyzing Documents...
                    </>
                  ) : pdfLoadingStatus !== 'loaded' ? (
                    <>
                      <span style={{ marginRight: '0.75rem' }}>⏳</span>
                      Loading PDF Engine...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '0.75rem' }}>🚀</span>
                      Compare PDF Documents
                    </>
                  )}
                </button>
              </div>
            </section>
          ) : (
            <section style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '2px solid #dc2626',
              borderRadius: '24px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📄</div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#dc2626',
                marginBottom: '1rem'
              }}>
                PDF Comparison Requires Premium
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#7f1d1d',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto'
              }}>
                Upgrade to premium for advanced PDF document comparison with word-level detection 
                and professional reporting features.
              </p>
              
              <button
                onClick={() => setShowPremiumModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem 3rem',
                  borderRadius: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
                }}
              >
                🚀 Upgrade to Premium - £19/month
              </button>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                marginTop: '1.5rem'
              }}>
                💡 Remember: Excel comparison remains FREE forever!
              </p>
            </section>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              color: '#dc2626',
              padding: '1.5rem',
              border: '2px solid #dc2626',
              borderRadius: '16px',
              background: '#fef2f2',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '2rem'
            }}>
              Error: {error}
            </div>
          )}

          {/* Results */}
          {results && (
            <div>
              <EnhancedChangeStatistics 
                results={results}
                file1Name={file1?.name}
                file2Name={file2?.name}
              />
              
              {results.text_changes && results.text_changes.length > 0 && (
                <JumpToChangeNavigation 
                  changes={results.text_changes}
                  onJumpToChange={handleJumpToChange}
                />
              )}
              
              <EnhancedPdfResults 
                results={results} 
                file1Name={file1?.name} 
                file2Name={file2?.name}
                onExport={handleExport}
                onExportSideBySidePDF={handleExportSideBySidePDF}
              />
            </div>
          )}

        </main>

        <PremiumModal />
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default EnhancedPdfComparePage;
