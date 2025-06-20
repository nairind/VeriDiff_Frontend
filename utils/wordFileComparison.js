// /components/WordResults.js - PROFESSIONAL WORD COMPARISON RESULTS WITH SEMANTIC ANALYSIS
import React, { useState, useEffect, useMemo, useRef } from 'react';

const WordResults = ({ results, file1Name, file2Name, options, isAuthenticated, onSignUp, onSignIn }) => {
  // Navigation and filtering state
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [viewMode, setViewMode] = useState('unified'); // 'unified', 'side-by-side', 'track-changes'
  
  // Responsive design state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  const resultsRef = useRef(null);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process enhanced changes for filtering and navigation
  const processedChanges = useMemo(() => {
    if (!results?.enhanced_changes) return [];
    
    return results.enhanced_changes.map((change, index) => ({
      ...change,
      id: `change_${index}`,
      displayIndex: index + 1
    }));
  }, [results]);

  // Filtered changes based on active filter
  const filteredChanges = useMemo(() => {
    if (!processedChanges.length) return [];
    
    switch (activeFilter) {
      case 'additions':
        return processedChanges.filter(c => c.type.includes('added'));
      case 'deletions':
        return processedChanges.filter(c => c.type.includes('removed'));
      case 'modifications':
        return processedChanges.filter(c => c.type.includes('modified'));
      case 'financial':
        return processedChanges.filter(c => c.semantic?.type === 'financial');
      case 'quantitative':
        return processedChanges.filter(c => c.semantic?.type === 'quantitative');
      case 'major':
        return processedChanges.filter(c => c.severity === 'high');
      default:
        return processedChanges;
    }
  }, [processedChanges, activeFilter]);

  // Statistics for dashboard
  const stats = useMemo(() => {
    const base = results?.change_statistics || {};
    return {
      totalChanges: base.total_changes || 0,
      additions: base.additions || 0,
      deletions: base.deletions || 0,
      modifications: base.modifications || 0,
      financial: base.semantic_breakdown?.financial || 0,
      quantitative: base.semantic_breakdown?.quantitative || 0,
      qualitative: base.semantic_breakdown?.qualitative || 0,
      similarity: results?.similarity_score || 0
    };
  }, [results]);

  // Navigation functions
  const goToChange = (index) => {
    if (index >= 0 && index < filteredChanges.length) {
      setCurrentChangeIndex(index);
      
      // Scroll to change
      const changeElement = document.getElementById(`change_${filteredChanges[index].id}`);
      if (changeElement) {
        changeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const previousChange = () => {
    const newIndex = Math.max(0, currentChangeIndex - 1);
    goToChange(newIndex);
  };

  const nextChange = () => {
    const newIndex = Math.min(filteredChanges.length - 1, currentChangeIndex + 1);
    goToChange(newIndex);
  };

  const jumpToMajorChanges = () => {
    const majorChanges = filteredChanges.filter(c => c.severity === 'high');
    if (majorChanges.length > 0) {
      const majorIndex = filteredChanges.indexOf(majorChanges[0]);
      goToChange(majorIndex);
    }
  };

  // Section expansion management
  const toggleSection = (sectionIndex) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  const expandAllSections = () => {
    const allSections = new Set();
    for (let i = 0; i < (results?.navigation?.total_sections || 0); i++) {
      allSections.add(i);
    }
    setExpandedSections(allSections);
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  // Render functions
  const renderStatsPanel = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: stats.similarity >= 80 ? '#22c55e' : stats.similarity >= 60 ? '#f59e0b' : '#ef4444'
          }}>
            {stats.similarity}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Similarity</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }}>
            {stats.totalChanges}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Changes</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
            {stats.financial + stats.quantitative}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Data Changes</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
            {filteredChanges.filter(c => c.severity === 'high').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Major Changes</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '15px'
      }}>
        {[
          { key: 'all', label: 'All', count: stats.totalChanges },
          { key: 'additions', label: '➕ Added', count: stats.additions },
          { key: 'deletions', label: '🗑️ Removed', count: stats.deletions },
          { key: 'modifications', label: '✏️ Modified', count: stats.modifications },
          { key: 'financial', label: '💰 Financial', count: stats.financial },
          { key: 'quantitative', label: '📊 Numbers', count: stats.quantitative },
          { key: 'major', label: '🎯 Major', count: filteredChanges.filter(c => c.severity === 'high').length }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => {
              setActiveFilter(filter.key);
              setCurrentChangeIndex(0);
            }}
            style={{
              background: activeFilter === filter.key ? '#059669' : '#f3f4f6',
              color: activeFilter === filter.key ? 'white' : '#374151',
              border: '1px solid ' + (activeFilter === filter.key ? '#059669' : '#d1d5db'),
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {filter.label}
            <span style={{
              background: activeFilter === filter.key ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              borderRadius: '10px',
              padding: '1px 6px',
              fontSize: '0.7rem'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      {filteredChanges.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={previousChange}
              disabled={currentChangeIndex === 0}
              style={{
                background: currentChangeIndex === 0 ? '#e5e7eb' : '#059669',
                color: currentChangeIndex === 0 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: currentChangeIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀️ Prev
            </button>
            
            <span style={{ color: '#374151', fontWeight: '500' }}>
              {currentChangeIndex + 1} of {filteredChanges.length}
            </span>
            
            <button
              onClick={nextChange}
              disabled={currentChangeIndex === filteredChanges.length - 1}
              style={{
                background: currentChangeIndex === filteredChanges.length - 1 ? '#e5e7eb' : '#059669',
                color: currentChangeIndex === filteredChanges.length - 1 ? '#9ca3af' : 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: currentChangeIndex === filteredChanges.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Next ▶️
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={jumpToMajorChanges}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🎯 Major Changes
            </button>
            
            <button
              onClick={() => setViewMode(
                viewMode === 'unified' ? 'side-by-side' : 
                viewMode === 'side-by-side' ? 'track-changes' : 'unified'
              )}
              style={{
                background: '#6366f1',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {viewMode === 'unified' ? '📊 Side-by-Side' : 
               viewMode === 'side-by-side' ? '📝 Track Changes' : '📄 Unified'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMarginAnnotation = (change, position = 'right') => {
    if (isMobile) return null;
    
    return (
      <div style={{
        position: 'absolute',
        [position]: '-200px',
        top: '0px',
        width: '180px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{
          fontWeight: '600',
          color: getSeverityColor(change.severity),
          marginBottom: '4px'
        }}>
          {change.annotation}
        </div>
        {change.semantic && (
          <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            {change.semantic.category}
            {change.semantic.metadata?.change && (
              <div style={{ fontWeight: '600', color: '#374151' }}>
                {typeof change.semantic.metadata.change === 'number' 
                  ? (change.semantic.metadata.change > 0 ? '+' : '') + change.semantic.metadata.change
                  : change.semantic.metadata.change
                }
              </div>
            )}
          </div>
        )}
        <div style={{
          fontSize: '0.7rem',
          color: '#9ca3af',
          marginTop: '4px'
        }}>
          Change {change.displayIndex} • {change.severity}
        </div>
      </div>
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const renderWordDiff = (wordDiff) => {
    if (!wordDiff || !Array.isArray(wordDiff)) return null;
    
    return (
      <div style={{ lineHeight: '1.8', fontSize: '1rem' }}>
        {wordDiff.map((word, index) => {
          let style = {};
          
          switch (word.type) {
            case 'added':
              style = {
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: '3px',
                padding: '2px 4px',
                fontWeight: '600'
              };
              break;
            case 'removed':
              style = {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '3px',
                padding: '2px 4px',
                textDecoration: 'line-through',
                fontWeight: '600'
              };
              break;
            case 'unchanged':
              style = { color: '#374151' };
              break;
          }
          
          return (
            <span key={index} style={style}>
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  // NEW: Unified diff view (like GitHub)
  const renderUnifiedView = () => {
    if (!processedChanges.length) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
          <h3>Documents are identical!</h3>
          <p>No changes detected between the documents.</p>
        </div>
      );
    }

    // Group changes by section for unified view
    const changesBySection = filteredChanges.reduce((acc, change) => {
      const sectionKey = change.sectionIndex || 0;
      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          title: change.sectionTitle || 'Document Content',
          changes: []
        };
      }
      acc[sectionKey].changes.push(change);
      return acc;
    }, {});

    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        {Object.entries(changesBySection).map(([sectionIndex, section]) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            <div style={{
              background: '#f8fafc',
              padding: '15px 20px',
              borderBottom: '2px solid #e5e7eb',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📂</span>
              {section.title}
              <span style={{
                background: '#e5e7eb',
                color: '#6b7280',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                {section.changes.length} changes
              </span>
            </div>

            {/* Changes in unified view */}
            {section.changes.map((change, changeIndex) => (
              <div
                key={change.id}
                id={`change_${change.id}`}
                style={{
                  position: 'relative',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                {/* Change annotation bar */}
                <div style={{
                  background: change.severity === 'high' ? '#fef2f2' : 
                           change.severity === 'medium' ? '#fefbf2' : '#f0fdf4',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${getSeverityColor(change.severity)}`
                }}>
                  <span style={{ 
                    color: getSeverityColor(change.severity),
                    fontWeight: '600'
                  }}>
                    {change.annotation} • {change.type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.8)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    #{change.displayIndex}
                  </span>
                </div>

                {/* Content display */}
                <div style={{ padding: '15px 20px' }}>
                  {change.type === 'paragraph_modified' && change.wordDiff ? (
                    // Show inline diff
                    <div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        marginBottom: '10px',
                        fontWeight: '500'
                      }}>
                        📝 Word-level changes:
                      </div>
                      {renderWordDiff(change.wordDiff)}
                    </div>
                  ) : change.type === 'paragraph_added' ? (
                    // Added content
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: '4px solid #22c55e'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#166534',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        ➕ Added content:
                      </div>
                      <div style={{ color: '#166534', lineHeight: '1.6' }}>
                        {change.content}
                      </div>
                    </div>
                  ) : change.type === 'paragraph_removed' ? (
                    // Removed content
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: '4px solid #dc2626'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#dc2626',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        🗑️ Removed content:
                      </div>
                      <div style={{ 
                        color: '#dc2626', 
                        lineHeight: '1.6',
                        textDecoration: 'line-through',
                        opacity: 0.8
                      }}>
                        {change.content}
                      </div>
                    </div>
                  ) : (
                    // Other changes
                    <div style={{
                      background: '#fefbf2',
                      border: '1px solid #fed7aa',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: '4px solid #f59e0b',
                      color: '#92400e',
                      lineHeight: '1.6'
                    }}>
                      {change.newContent || change.content}
                    </div>
                  )}

                  {/* Word count info */}
                  {change.wordCount && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      {typeof change.wordCount === 'object' ? (
                        <>
                          Words: {change.wordCount.old} → {change.wordCount.new} 
                          ({change.wordCount.change > 0 ? '+' : ''}{change.wordCount.change})
                        </>
                      ) : (
                        `Word count: ${change.wordCount}`
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // NEW: Track Changes view (like Microsoft Word)
  const renderTrackChangesView = () => {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#374151',
          maxWidth: isMobile ? '100%' : '70%' // Leave space for margin comments
        }}>
          {/* Reconstruct document with inline changes */}
          {filteredChanges.map((change, index) => (
            <div
              key={change.id}
              style={{
                marginBottom: '20px',
                position: 'relative'
              }}
            >
              {change.type === 'paragraph_modified' && change.wordDiff ? (
                <div style={{ position: 'relative' }}>
                  {renderWordDiff(change.wordDiff)}
                  
                  {/* Margin comment (desktop only) */}
                  {!isMobile && (
                    <div style={{
                      position: 'absolute',
                      right: '-280px',
                      top: '0',
                      width: '250px',
                      background: '#fefbf2',
                      border: '2px solid #fed7aa',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      color: '#92400e'
                    }}>
                      <strong>{change.annotation}</strong>
                      <br />
                      {change.semantic?.category}
                      <div style={{ fontSize: '0.7rem', marginTop: '5px', color: '#6b7280' }}>
                        Change #{change.displayIndex}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span style={{
                    background: change.type.includes('added') ? '#dcfce7' : 
                               change.type.includes('removed') ? '#fee2e2' : '#fefbf2',
                    color: change.type.includes('added') ? '#166534' : 
                           change.type.includes('removed') ? '#dc2626' : '#92400e',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textDecoration: change.type.includes('removed') ? 'line-through' : 'none'
                  }}>
                    {change.content || change.newContent}
                  </span>
                  
                  {/* Mobile annotation */}
                  {isMobile && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: getSeverityColor(change.severity),
                      marginTop: '5px',
                      fontWeight: '600'
                    }}>
                      {change.annotation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChange = (change, index) => {
    const isCurrentChange = index === currentChangeIndex;
    
    return (
      <div
        key={change.id}
        id={`change_${change.id}`}
        style={{
          position: 'relative',
          background: isCurrentChange ? '#f0fdf4' : 'white',
          border: `2px solid ${isCurrentChange ? '#22c55e' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          ...(isMobile ? {} : { marginRight: '200px' }) // Space for annotations
        }}
      >
        {/* Margin annotation for desktop */}
        {!isMobile && renderMarginAnnotation(change)}
        
        {/* Mobile annotation */}
        {isMobile && (
          <div style={{
            background: getSeverityColor(change.severity),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginBottom: '10px',
            display: 'inline-block'
          }}>
            {change.annotation}
          </div>
        )}
        
        {/* Change header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            {change.sectionTitle && `${change.sectionTitle} • `}
            {change.type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
          </div>
          
          <div style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            #{change.displayIndex}
          </div>
        </div>
        
        {/* Change content */}
        {viewMode === 'side-by-side' && change.type === 'paragraph_modified' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '15px'
          }}>
            <div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '8px'
              }}>
                Original:
              </div>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {change.oldContent}
              </div>
            </div>
            
            <div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '8px'
              }}>
                Revised:
              </div>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {change.newContent}
              </div>
            </div>
          </div>
        ) : change.type === 'paragraph_modified' && change.wordDiff ? (
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Detailed Changes:
            </div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '0.9rem'
            }}>
              {renderWordDiff(change.wordDiff)}
            </div>
          </div>
        ) : (
          <div style={{
            background: change.type.includes('added') ? '#f0fdf4' 
              : change.type.includes('removed') ? '#fef2f2' 
              : '#fef3c7',
            border: `1px solid ${change.type.includes('added') ? '#bbf7d0' 
              : change.type.includes('removed') ? '#fecaca' 
              : '#fde047'}`,
            borderRadius: '6px',
            padding: '10px',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            {change.content || change.newContent || change.oldContent}
          </div>
        )}
        
        {/* Word count information */}
        {change.wordCount && (
          <div style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            {typeof change.wordCount === 'object' ? (
              <>
                Words: {change.wordCount.old} → {change.wordCount.new} 
                ({change.wordCount.change > 0 ? '+' : ''}{change.wordCount.change})
              </>
            ) : (
              `Word count: ${change.wordCount}`
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSectionControls = () => (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.9rem',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
          />
          Show unchanged content
        </label>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={expandAllSections}
          style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            color: '#374151',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          📂 Expand All
        </button>
        
        <button
          onClick={collapseAllSections}
          style={{
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            color: '#374151',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          📁 Collapse All
        </button>
      </div>
    </div>
  );

  // Main render
  if (!results || !results.enhanced_changes) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
        <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>
          No comparison results available
        </h3>
        <p style={{ color: '#6b7280' }}>
          Please run the Word comparison again to see detailed results.
        </p>
      </div>
    );
  }

  return (
    <div ref={resultsRef} style={{ position: 'relative' }}>
      {/* Mobile Navigation Toggle */}
      {isMobile && (
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          📊
        </button>
      )}

      {/* Stats Panel */}
      {(!isMobile || showMobileNav) && renderStatsPanel()}
      
      {/* Section Controls */}
      {(!isMobile || showMobileNav) && renderSectionControls()}
      
      {/* Results Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        minHeight: '400px'
      }}>
        {filteredChanges.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '40px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
            <h3 style={{ marginBottom: '10px' }}>
              {activeFilter === 'all' ? 'No Changes Found' : `No ${activeFilter} Changes`}
            </h3>
            <p>
              {activeFilter === 'all' 
                ? 'The documents are identical!'
                : `Try selecting a different filter to see other types of changes.`
              }
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: '0 0 5px 0',
                color: '#1f2937',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {viewMode === 'unified' ? '📄 Unified Document View' :
                 viewMode === 'track-changes' ? '📝 Track Changes View' :
                 '📊 Side-by-Side Comparison'
                }
                
                <span style={{
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  {viewMode.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
                </span>
              </h3>
              
              <p style={{
                margin: 0,
                color: '#6b7280',
                fontSize: '0.9rem'
              }}>
                {viewMode === 'unified' 
                  ? `Showing ${filteredChanges.length} changes organized by document section (GitHub-style)`
                  : viewMode === 'track-changes'
                    ? `Showing changes inline with margin annotations (Microsoft Word-style)`
                    : `Showing ${filteredChanges.length} changes with original vs revised comparison`
                }
                {activeFilter !== 'all' && ` (${activeFilter} filter applied)`}
              </p>
            </div>
            
            {/* Changes Content - Multiple View Modes */}
            <div>
              {viewMode === 'unified' ? renderUnifiedView() :
               viewMode === 'track-changes' ? renderTrackChangesView() :
               // Default: Side-by-side view
               <div>
                 {filteredChanges.map((change, index) => renderChange(change, index))}
               </div>
              }
            </div>
            
            {/* Professional footer */}
            <div style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.85rem'
            }}>
              <p>
                Analysis completed with {Math.round((results.quality_metrics?.semantic_analysis_coverage || 0) * 100)}% semantic coverage
              </p>
              <p style={{ marginTop: '5px' }}>
                Processing time: {results.processing_time?.total_time_ms || 0}ms
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Authentication overlay for enhanced features */}
      {!isAuthenticated && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          border: '2px solid #059669',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          maxWidth: '300px',
          zIndex: 1000
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            color: '#059669',
            fontSize: '1rem'
          }}>
            🚀 Unlock Full Features
          </h4>
          <p style={{
            margin: '0 0 15px 0',
            fontSize: '0.85rem',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            Get unlimited comparisons, export reports, and advanced semantic analysis
          </p>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={onSignUp}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Sign Up
            </button>
            <button
              onClick={onSignIn}
              style={{
                background: 'transparent',
                color: '#059669',
                border: '1px solid #059669',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordResults;
