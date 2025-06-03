import React, { useState } from 'react';

const JsonResults = ({ results, file1Name, file2Name }) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']));
  const [showUnchanged, setShowUnchanged] = useState(false);

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

  // Debug logging to see what we're working with
  console.log('🐛 JsonResults Debug Info:');
  console.log('Results object:', results);
  console.log('Changes array:', changes);
  console.log('File1 content:', file1_content);
  console.log('File2 content:', file2_content);

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
    console.log(`🔍 Checking path "${path}":`, change ? change.type : 'unchanged');
    return change ? change.type : 'unchanged';
  };

  // Enhanced highlighting with more prominent colors and effects
  const getChangeStyle = (changeType) => {
    const baseStyle = {
      transition: 'all 0.3s ease',
      borderRadius: '8px',
      margin: '2px 0',
      position: 'relative'
    };

    switch (changeType) {
      case 'added':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
          borderLeft: '8px solid #059669',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #059669',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          transform: 'scale(1.02)',
          animation: 'pulse 2s infinite'
        };
      case 'removed':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
          borderLeft: '8px solid #dc2626',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #dc2626',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          transform: 'scale(1.02)',
          animation: 'pulse 2s infinite'
        };
      case 'modified':
        return {
          ...baseStyle,
          backgroundColor: '#f59e0b',
          borderLeft: '8px solid #d97706',
          color: 'white',
          fontWeight: '700',
          border: '3px solid #d97706',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          transform: 'scale(1.02)',
          animation: 'pulse 2s infinite'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: showUnchanged ? '#f8f9fa' : 'transparent',
          borderLeft: '4px solid transparent',
          color: '#374151',
          fontWeight: '400'
        };
    }
  };

  // Recursive component to render JSON tree with consistent highlighting
  const JsonTreeNode = ({ obj, path = '', level = 0, fileNumber = 1 }) => {
    const indent = level * 20;
    
    // Get change type for this specific path
    const getChangeTypeForPath = (checkPath) => {
      const change = changes.find(c => c.path === checkPath);
      
      // Enhanced debug logging
      console.log(`🎨 Path "${checkPath}" in file ${fileNumber}:`, {
        found: !!change,
        changeType: change?.type || 'unchanged',
        changeDetails: change
      });
      
      return change ? change.type : 'unchanged';
    };
    
    if (obj === null) {
      const changeType = getChangeTypeForPath(path);
      return (
        <div style={{ 
          marginLeft: `${indent}px`,
          ...getChangeStyle(changeType),
          padding: '8px 12px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '14px'
        }}>
          <span style={{ color: changeType !== 'unchanged' ? 'white' : '#6b7280' }}>null</span>
        </div>
      );
    }

    if (typeof obj !== 'object' || Array.isArray(obj)) {
      const changeType = getChangeTypeForPath(path);
      return (
        <div style={{ 
          marginLeft: `${indent}px`,
          ...getChangeStyle(changeType),
          padding: '8px 12px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '14px'
        }}>
          <span style={{ 
            color: changeType !== 'unchanged' ? 'white' : (typeof obj === 'string' ? '#059669' : '#2563eb')
          }}>
            {JSON.stringify(obj)}
          </span>
        </div>
      );
    }

    const keys = Object.keys(obj);
    const isExpanded = expandedPaths.has(path || 'root');
    const rootChangeType = getChangeTypeForPath(path);

    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <div style={{
          ...getChangeStyle(rootChangeType),
          padding: '8px 12px',
          cursor: 'pointer',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '14px',
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
          <span style={{ fontWeight: '600' }}>
            {path ? path.split('.').pop() : 'root'}: {'{'}
          </span>
          <span style={{ 
            color: rootChangeType !== 'unchanged' ? 'rgba(255,255,255,0.8)' : '#6b7280', 
            fontSize: '12px' 
          }}>
            {keys.length} {keys.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
        
        {isExpanded && (
          <div>
            {keys.map(key => {
              const childPath = path ? `${path}.${key}` : key;
              const childChangeType = getChangeTypeForPath(childPath);
              
              // Hide unchanged items if showUnchanged is false
              if (!showUnchanged && childChangeType === 'unchanged') {
                return null;
              }
              
              return (
                <div key={key} style={{ marginLeft: '20px' }}>
                  <div style={{
                    ...getChangeStyle(childChangeType),
                    padding: '10px 16px',
                    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minHeight: '40px'
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
                        level={0}
                        fileNumber={fileNumber}
                      />
                    ) : (
                      <span style={{ 
                        color: childChangeType !== 'unchanged' ? 'white' : (typeof obj[key] === 'string' ? '#059669' : '#2563eb'),
                        fontWeight: childChangeType !== 'unchanged' ? '600' : '400'
                      }}>
                        {JSON.stringify(obj[key])}
                      </span>
                    )}
                    {/* Add change indicator badge */}
                    {childChangeType !== 'unchanged' && (
                      <span style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '2px 6px',
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
                </div>
              );
            })}
          </div>
        )}
        
        {isExpanded && (
          <div style={{
            marginLeft: `${indent}px`,
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '14px',
            color: '#6b7280',
            padding: '4px 12px'
          }}>
            {'}'}
          </div>
        )}
      </div>
    );
  };

  // Component for side-by-side JSON comparison with consistent highlighting
  const SideBySideView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      minHeight: '600px'
    }}>
      {/* File 1 */}
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          padding: '16px 20px',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '700',
          color: '#1f2937',
          fontSize: '16px'
        }}>
          📄 {file1Name || 'File 1'}
        </div>
        <div style={{
          height: 'calc(100% - 60px)',
          overflow: 'auto',
          padding: '16px'
        }}>
          <JsonTreeNode obj={file1_content} path="root" fileNumber={1} />
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
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          padding: '16px 20px',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '700',
          color: '#1f2937',
          fontSize: '16px'
        }}>
          📄 {file2Name || 'File 2'}
        </div>
        <div style={{
          height: 'calc(100% - 60px)',
          overflow: 'auto',
          padding: '16px'
        }}>
          <JsonTreeNode obj={file2_content} path="root" fileNumber={2} />
        </div>
      </div>
    </div>
  );

  // Component for changes summary
  const ChangesSummary = () => {
    if (!changes || changes.length === 0) return null;

    return (
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '24px',
        backgroundColor: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          padding: '16px 20px',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '700',
          color: '#1f2937',
          fontSize: '16px'
        }}>
          🔄 Changes Summary ({changes.length})
        </div>
        <div style={{
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {changes.map((change, index) => (
            <div
              key={index}
              style={{
                ...getChangeStyle(change.type),
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>
                📍 {change.path || 'root'}
              </div>
              
              {change.type === 'removed' && (
                <div style={{ color: change.type !== 'unchanged' ? 'white' : '#dc2626' }}>
                  <strong>- Removed:</strong> {JSON.stringify(change.oldValue)}
                </div>
              )}
              
              {change.type === 'added' && (
                <div style={{ color: change.type !== 'unchanged' ? 'white' : '#16a34a' }}>
                  <strong>+ Added:</strong> {JSON.stringify(change.newValue)}
                </div>
              )}
              
              {change.type === 'modified' && (
                <div>
                  <div style={{ color: change.type !== 'unchanged' ? 'rgba(255,255,255,0.9)' : '#dc2626', marginBottom: '4px' }}>
                    <strong>- Old:</strong> {JSON.stringify(change.oldValue)}
                  </div>
                  <div style={{ color: change.type !== 'unchanged' ? 'white' : '#16a34a' }}>
                    <strong>+ New:</strong> {JSON.stringify(change.newValue)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Download handler
  const handleDownloadReport = () => {
    const report = generateJsonReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json_comparison_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateJsonReport = () => {
    const report = {
      comparison_report: {
        generated_at: new Date().toISOString(),
        files: {
          file1: file1Name || 'File 1',
          file2: file2Name || 'File 2'
        },
        statistics: {
          total_properties: total_records,
          differences_found,
          matches_found,
          similarity_percentage: total_records > 0 ? Math.round((matches_found / total_records) * 100) : 0
        },
        changes: changes.map(change => ({
          path: change.path,
          type: change.type,
          old_value: change.oldValue,
          new_value: change.newValue
        }))
      }
    };
    
    return JSON.stringify(report, null, 2);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.2rem',
          fontWeight: '700',
          margin: '0 0 15px 0'
        }}>
          🌳 JSON Comparison Results
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Hierarchical structure comparison with prominent difference highlighting
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '25px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#1f2937' }}>
              {total_records}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>Total Properties</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ef4444' }}>
              {differences_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>Differences</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#10b981' }}>
              {matches_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>Matches</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#2563eb' }}>
              {total_records > 0 ? Math.round((matches_found / total_records) * 100) : 0}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>Similarity</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '25px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '12px',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => setExpandedPaths(new Set())}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            📦 Collapse All
          </button>
          <button
            onClick={() => {
              const newPaths = new Set(['root']);
              if (file1_content && typeof file1_content === 'object') {
                Object.keys(file1_content).forEach(key => {
                  newPaths.add(key);
                });
              }
              setExpandedPaths(newPaths);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            📂 Expand All
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              style={{ accentColor: '#2563eb', transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>Show Unchanged</span>
          </label>

          <button
            onClick={handleDownloadReport}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            📄 Download Report
          </button>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '25px',
        fontSize: '14px',
        padding: '16px',
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '12px',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#10b981',
            border: '2px solid #059669',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
          }}></div>
          <span style={{ fontWeight: '600' }}>Added properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#ef4444',
            border: '2px solid #dc2626',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
          }}></div>
          <span style={{ fontWeight: '600' }}>Removed properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#f59e0b',
            border: '2px solid #d97706',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
          }}></div>
          <span style={{ fontWeight: '600' }}>Modified properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#f8f9fa',
            border: '2px solid #e9ecef',
            borderRadius: '6px'
          }}></div>
          <span style={{ fontWeight: '600' }}>Unchanged properties</span>
        </div>
      </div>

      {/* Main Comparison View */}
      <SideBySideView />

      {/* Changes Summary */}
      <ChangesSummary />

      {/* No differences message */}
      {differences_found === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: '3px solid #10b981',
          borderRadius: '16px',
          marginTop: '24px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎉</div>
          <h3 style={{
            color: '#166534',
            fontSize: '1.6rem',
            fontWeight: '700',
            margin: '0 0 10px 0'
          }}>
            JSON structures are identical!
          </h3>
          <p style={{
            color: '#16a34a',
            fontSize: '1.2rem',
            margin: 0,
            fontWeight: '500'
          }}>
            No differences found between the JSON files.
          </p>
        </div>
      )}
    </div>
  );
};

export default JsonResults;
