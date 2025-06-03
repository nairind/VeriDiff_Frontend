import React, { useState, useEffect } from 'react';

const JsonResults = ({ results, file1Name, file2Name }) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [showUnchanged, setShowUnchanged] = useState(true);

  // Extract data from results
  const {
    differences_found = 0,
    matches_found = 0,
    total_records = 0,
    changes = [],
    file1_content = {},
    file2_content = {},
    nested_differences = []
  } = results || {};

  // Auto-expand paths with differences on load
  useEffect(() => {
    const pathsToExpand = new Set(['root']);
    
    // Add all paths with changes
    changes.forEach(change => {
      if (change.path) {
        // Add the path itself
        pathsToExpand.add(change.path);
        
        // Add all parent paths
        const pathParts = change.path.split('.');
        for (let i = 1; i < pathParts.length; i++) {
          pathsToExpand.add(pathParts.slice(0, i).join('.'));
        }
      }
    });

    setExpandedPaths(pathsToExpand);
  }, [changes]);

  // Debug logging
  console.log('🐛 JsonResults Debug Info:');
  console.log('Results object:', results);
  console.log('Changes array:', changes);
  console.log('Auto-expanded paths:', Array.from(expandedPaths));

  // Toggle expansion of object paths
  const toggleExpanded = (path) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  // Helper function to determine change type for a path
  const getChangeType = (path) => {
    const change = changes.find(c => c.path === path);
    return change ? change.type : 'unchanged';
  };

  // Enhanced highlighting with very prominent colors
  const getChangeStyle = (changeType) => {
    const baseStyle = {
      borderRadius: '8px',
      margin: '2px 0',
      fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
      fontSize: '14px',
      padding: '12px 16px',
      transition: 'all 0.3s ease'
    };

    switch (changeType) {
      case 'added':
        return {
          ...baseStyle,
          backgroundColor: '#059669',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #047857',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
          animation: 'glow-green 2s ease-in-out infinite alternate'
        };
      case 'removed':
        return {
          ...baseStyle,
          backgroundColor: '#dc2626',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #b91c1c',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
          animation: 'glow-red 2s ease-in-out infinite alternate'
        };
      case 'modified':
        return {
          ...baseStyle,
          backgroundColor: '#d97706',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #b45309',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
          animation: 'glow-orange 2s ease-in-out infinite alternate'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: showUnchanged ? '#f8f9fa' : 'transparent',
          color: '#374151',
          fontWeight: '400',
          border: '1px solid transparent'
        };
    }
  };

  // Recursive component to render JSON tree
  const JsonTreeNode = ({ obj, path = '', level = 0, fileNumber = 1 }) => {
    if (obj === null) {
      const changeType = getChangeType(path);
      if (!showUnchanged && changeType === 'unchanged') return null;
      
      return (
        <div style={getChangeStyle(changeType)}>
          <span>null</span>
          {changeType !== 'unchanged' && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              marginLeft: '8px',
              textTransform: 'uppercase'
            }}>
              {changeType}
            </span>
          )}
        </div>
      );
    }

    if (typeof obj !== 'object' || Array.isArray(obj)) {
      const changeType = getChangeType(path);
      if (!showUnchanged && changeType === 'unchanged') return null;
      
      return (
        <div style={getChangeStyle(changeType)}>
          <span style={{ 
            color: changeType !== 'unchanged' ? 'white' : (typeof obj === 'string' ? '#059669' : '#2563eb')
          }}>
            {JSON.stringify(obj)}
          </span>
          {changeType !== 'unchanged' && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              marginLeft: '8px',
              textTransform: 'uppercase'
            }}>
              {changeType}
            </span>
          )}
        </div>
      );
    }

    const keys = Object.keys(obj);
    const isExpanded = expandedPaths.has(path || 'root');
    const rootChangeType = getChangeType(path);

    return (
      <div>
        <div style={{
          ...getChangeStyle(rootChangeType),
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => toggleExpanded(path || 'root')}
        >
          <span style={{ 
            fontSize: '12px',
            transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            width: '12px'
          }}>
            ▶
          </span>
          <span style={{ fontWeight: '700' }}>
            {path ? path.split('.').pop() : 'root'}: {'{'}
          </span>
          <span style={{ 
            color: rootChangeType !== 'unchanged' ? 'rgba(255,255,255,0.8)' : '#6b7280', 
            fontSize: '12px' 
          }}>
            {keys.length} properties
          </span>
          {rootChangeType !== 'unchanged' && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              textTransform: 'uppercase',
              marginLeft: 'auto'
            }}>
              {rootChangeType}
            </span>
          )}
        </div>
        
        {isExpanded && (
          <div style={{ marginLeft: '20px' }}>
            {keys.map(key => {
              const childPath = path ? `${path}.${key}` : key;
              const childChangeType = getChangeType(childPath);
              
              // Hide unchanged items if showUnchanged is false
              if (!showUnchanged && childChangeType === 'unchanged') {
                return null;
              }
              
              return (
                <div key={key} style={{ margin: '4px 0' }}>
                  <div style={{
                    ...getChangeStyle(childChangeType),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ 
                      color: childChangeType !== 'unchanged' ? 'white' : '#7c3aed', 
                      fontWeight: '600', 
                      minWidth: 'fit-content' 
                    }}>
                      "{key}":
                    </span>
                    {typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) ? (
                      <JsonTreeNode 
                        obj={obj[key]} 
                        path={childPath} 
                        level={level + 1}
                        fileNumber={fileNumber}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ 
                          color: childChangeType !== 'unchanged' ? 'white' : (typeof obj[key] === 'string' ? '#059669' : '#2563eb'),
                          fontWeight: childChangeType !== 'unchanged' ? '700' : '400'
                        }}>
                          {JSON.stringify(obj[key])}
                        </span>
                        {childChangeType !== 'unchanged' && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            marginLeft: 'auto'
                          }}>
                            {childChangeType}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isExpanded && (
          <div style={{
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '14px',
            color: '#6b7280',
            padding: '4px 16px'
          }}>
            {'}'}
          </div>
        )}
      </div>
    );
  };

  // Compact side-by-side view with immediate difference visibility
  const CompactSideBySideView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      minHeight: 'auto' // Remove fixed height
    }}>
      {/* File 1 */}
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          padding: '12px 16px',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '700',
          color: '#1f2937',
          fontSize: '14px'
        }}>
          📄 {file1Name || 'File 1'}
        </div>
        <div style={{
          padding: '12px',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <JsonTreeNode obj={file1_content} path="" fileNumber={1} />
        </div>
      </div>

      {/* File 2 */}
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          padding: '12px 16px',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '700',
          color: '#1f2937',
          fontSize: '14px'
        }}>
          📄 {file2Name || 'File 2'}
        </div>
        <div style={{
          padding: '12px',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          <JsonTreeNode obj={file2_content} path="" fileNumber={2} />
        </div>
      </div>
    </div>
  );

  // Quick differences overview for immediate visibility
  const QuickDifferencesOverview = () => {
    if (!changes || changes.length === 0) return null;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        border: '2px solid #d97706',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: '#92400e',
          fontSize: '16px',
          fontWeight: '700',
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Quick Differences Overview
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {changes.slice(0, 6).map((change, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d97706',
                fontSize: '13px'
              }}
            >
              <span style={{ fontWeight: '600', color: '#92400e' }}>
                {change.path}
              </span>
              <span style={{
                marginLeft: '8px',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: '600',
                backgroundColor: change.type === 'added' ? '#059669' : 
                              change.type === 'removed' ? '#dc2626' : '#d97706',
                color: 'white'
              }}>
                {change.type}
              </span>
            </div>
          ))}
          {changes.length > 6 && (
            <div style={{
              background: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d97706',
              fontSize: '13px',
              color: '#92400e',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              +{changes.length - 6} more...
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes glow-green {
            0% { box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4); }
            100% { box-shadow: 0 6px 20px rgba(5, 150, 105, 0.6); }
          }
          @keyframes glow-red {
            0% { box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
            100% { box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6); }
          }
          @keyframes glow-orange {
            0% { box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4); }
            100% { box-shadow: 0 6px 20px rgba(217, 119, 6, 0.6); }
          }
        `}
      </style>

      {/* Compact Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          🌳 JSON Comparison
        </h2>
      </div>

      {/* Compact Statistics */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ef4444' }}>
            {differences_found}
          </div>
          <div style={{ color: '#6b7280', fontWeight: '600' }}>Differences</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#10b981' }}>
            {matches_found}
          </div>
          <div style={{ color: '#6b7280', fontWeight: '600' }}>Matches</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2563eb' }}>
            {total_records > 0 ? Math.round((matches_found / total_records) * 100) : 0}%
          </div>
          <div style={{ color: '#6b7280', fontWeight: '600' }}>Similarity</div>
        </div>
      </div>

      {/* Quick Differences Overview */}
      <QuickDifferencesOverview />

      {/* Compact Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setExpandedPaths(new Set())}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            📦 Collapse All
          </button>
          <button
            onClick={() => {
              const pathsToExpand = new Set(['root']);
              changes.forEach(change => {
                if (change.path) {
                  pathsToExpand.add(change.path);
                  const pathParts = change.path.split('.');
                  for (let i = 1; i < pathParts.length; i++) {
                    pathsToExpand.add(pathParts.slice(0, i).join('.'));
                  }
                }
              });
              setExpandedPaths(pathsToExpand);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            📂 Show Differences
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Show Unchanged</span>
        </label>
      </div>

      {/* Compact Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '16px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px', height: '12px', backgroundColor: '#059669',
            borderRadius: '3px', border: '1px solid #047857'
          }}></div>
          <span>Added</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px', height: '12px', backgroundColor: '#dc2626',
            borderRadius: '3px', border: '1px solid #b91c1c'
          }}></div>
          <span>Removed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px', height: '12px', backgroundColor: '#d97706',
            borderRadius: '3px', border: '1px solid #b45309'
          }}></div>
          <span>Modified</span>
        </div>
      </div>

      {/* Main Comparison View - Compact */}
      <CompactSideBySideView />

      {/* Success message for no differences */}
      {differences_found === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: '2px solid #10b981',
          borderRadius: '12px',
          marginTop: '16px'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
          <h3 style={{
            color: '#166534',
            fontSize: '1.2rem',
            fontWeight: '700',
            margin: '0 0 4px 0'
          }}>
            JSON structures are identical!
          </h3>
        </div>
      )}
    </div>
  );
};

export default JsonResults;
