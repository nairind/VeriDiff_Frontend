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
    if (change) {
      return change.type;
    }
    return 'unchanged';
  };

  // Helper function to get styling for change types
  const getChangeStyle = (changeType) => {
    switch (changeType) {
      case 'added':
        return {
          backgroundColor: '#e6ffe6',
          borderLeft: '4px solid #27ae60',
          color: '#155724'
        };
      case 'removed':
        return {
          backgroundColor: '#ffe6e6',
          borderLeft: '4px solid #e74c3c',
          color: '#721c24'
        };
      case 'modified':
        return {
          backgroundColor: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          color: '#856404'
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          borderLeft: '4px solid #e9ecef',
          color: '#495057'
        };
    }
  };

  // Recursive component to render JSON tree
  const JsonTreeNode = ({ obj, path = '', level = 0, changeType = 'unchanged' }) => {
    const indent = level * 20;
    
    if (obj === null) {
      return (
        <div style={{ 
          marginLeft: `${indent}px`,
          ...getChangeStyle(changeType),
          padding: '2px 8px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px'
        }}>
          <span style={{ color: '#6b7280' }}>null</span>
        </div>
      );
    }

    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return (
        <div style={{ 
          marginLeft: `${indent}px`,
          ...getChangeStyle(changeType),
          padding: '2px 8px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px'
        }}>
          <span style={{ color: typeof obj === 'string' ? '#059669' : '#2563eb' }}>
            {JSON.stringify(obj)}
          </span>
        </div>
      );
    }

    const keys = Object.keys(obj);
    const isExpanded = expandedPaths.has(path || 'root');

    return (
      <div style={{ marginLeft: `${indent}px` }}>
        <div style={{
          ...getChangeStyle(changeType),
          padding: '4px 8px',
          cursor: 'pointer',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onClick={() => toggleExpanded(path || 'root')}
        >
          <span style={{ 
            fontSize: '10px',
            transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            width: '12px'
          }}>
            ▶
          </span>
          <span style={{ fontWeight: '600' }}>
            {path ? path.split('.').pop() : 'root'}: {'{'}
          </span>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>
            {keys.length} {keys.length === 1 ? 'property' : 'properties'}
          </span>
        </div>
        
        {isExpanded && (
          <div>
            {keys.map(key => {
              const childPath = path ? `${path}.${key}` : key;
              const childChangeType = getChangeType(childPath);
              
              return (
                <div key={key} style={{ marginLeft: '20px' }}>
                  <div style={{
                    ...getChangeStyle(childChangeType),
                    padding: '2px 8px',
                    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#7c3aed', fontWeight: '500' }}>"{key}":</span>
                    {typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) ? (
                      <JsonTreeNode 
                        obj={obj[key]} 
                        path={childPath} 
                        level={0}
                        changeType={childChangeType}
                      />
                    ) : (
                      <span style={{ 
                        color: typeof obj[key] === 'string' ? '#059669' : '#2563eb' 
                      }}>
                        {JSON.stringify(obj[key])}
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
            fontSize: '13px',
            color: '#6b7280',
            padding: '2px 8px'
          }}>
            {'}'}
          </div>
        )}
      </div>
    );
  };

  // Component for side-by-side JSON comparison
  const SideBySideView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      height: '600px'
    }}>
      {/* File 1 */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📄 {file1Name || 'File 1'}
        </div>
        <div style={{
          height: 'calc(100% - 50px)',
          overflow: 'auto',
          padding: '12px'
        }}>
          <JsonTreeNode obj={file1_content} path="root" />
        </div>
      </div>

      {/* File 2 */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📄 {file2Name || 'File 2'}
        </div>
        <div style={{
          height: 'calc(100% - 50px)',
          overflow: 'auto',
          padding: '12px'
        }}>
          <JsonTreeNode obj={file2_content} path="root" />
        </div>
      </div>
    </div>
  );

  // Component for changes summary
  const ChangesSummary = () => {
    if (!changes || changes.length === 0) return null;

    return (
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        marginTop: '20px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937'
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
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb',
                fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                fontSize: '13px'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                📍 {change.path || 'root'}
              </div>
              
              {change.type === 'removed' && (
                <div style={{ color: '#dc2626' }}>
                  <strong>- Old:</strong> {JSON.stringify(change.oldValue)}
                </div>
              )}
              
              {change.type === 'added' && (
                <div style={{ color: '#16a34a' }}>
                  <strong>+ Added:</strong> {JSON.stringify(change.newValue)}
                </div>
              )}
              
              {change.type === 'modified' && (
                <div>
                  <div style={{ color: '#dc2626' }}>
                    <strong>- Old:</strong> {JSON.stringify(change.oldValue)}
                  </div>
                  <div style={{ color: '#16a34a' }}>
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
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
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
          fontSize: '2rem',
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
          Hierarchical structure comparison with nested analysis
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
              {total_records}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Properties</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
              {differences_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Differences</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
              {matches_found}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Matches</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
              {total_records > 0 ? Math.round((matches_found / total_records) * 100) : 0}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Similarity</div>
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
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={() => setExpandedPaths(new Set())}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.9rem'
            }}
          >
            📦 Collapse All
          </button>
          <button
            onClick={() => {
              // Expand root and first level
              const newPaths = new Set(['root']);
              if (file1_content && typeof file1_content === 'object') {
                Object.keys(file1_content).forEach(key => {
                  newPaths.add(key);
                });
              }
              setExpandedPaths(newPaths);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.9rem'
            }}
          >
            📂 Expand All
          </button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Show Unchanged</span>
          </label>
        </div>

        <button
          onClick={handleDownloadReport}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
        >
          📄 Download Report
        </button>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e6ffe6',
            border: '1px solid #27ae60',
            borderRadius: '3px'
          }}></div>
          <span>Added properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #e74c3c',
            borderRadius: '3px'
          }}></div>
          <span>Removed properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '3px'
          }}></div>
          <span>Modified properties</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '3px'
          }}></div>
          <span>Unchanged properties</span>
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
          border: '2px solid #22c55e',
          borderRadius: '12px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
          <h3 style={{
            color: '#166534',
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 10px 0'
          }}>
            JSON structures are identical!
          </h3>
          <p style={{
            color: '#16a34a',
            fontSize: '1.1rem',
            margin: 0
          }}>
            No differences found between the JSON files.
          </p>
        </div>
      )}
    </div>
  );
};

export default JsonResults;
