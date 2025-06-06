import React, { useState } from 'react'; 

const XmlResults = ({ results, file1Name, file2Name }) => {
  const [viewMode, setViewMode] = useState('structured'); // 'structured' or 'source'
  const [expandedElements, setExpandedElements] = useState(new Set(['root']));
  const [showAttributes, setShowAttributes] = useState(true);
  const [highlightChanges, setHighlightChanges] = useState(true);

  // Extract data from results
  const {
    differences_found = 0,
    matches_found = 0,
    total_elements = 0,
    changes = [],
    file1_content = '',
    file2_content = '',
    element_changes = [],
    attribute_changes = []
  } = results || {};

  // Toggle expansion of XML elements
  const toggleExpanded = (elementPath) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(elementPath)) {
      newExpanded.delete(elementPath);
    } else {
      newExpanded.add(elementPath);
    }
    setExpandedElements(newExpanded);
  };

  // Helper function to get change type styling
  const getChangeStyle = (changeType) => {
    if (!highlightChanges) return { backgroundColor: '#f8f9fa' };
    
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
      case 'attribute_changed':
        return {
          backgroundColor: '#e1f5fe',
          borderLeft: '4px solid #0ea5e9',
          color: '#0c4a6e'
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          borderLeft: '4px solid #e9ecef',
          color: '#495057'
        };
    }
  };

  // Component to render XML element with proper indentation and highlighting
  const XmlElement = ({ element, level = 0, changeType = 'unchanged' }) => {
    const indent = level * 20;
    const isExpanded = expandedElements.has(element.path || 'root');
    const hasChildren = element.children && element.children.length > 0;
    
    return (
      <div style={{ marginLeft: `${indent}px` }}>
        {/* Element opening tag */}
        <div style={{
          ...getChangeStyle(changeType),
          padding: '4px 8px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: hasChildren ? 'pointer' : 'default'
        }}
        onClick={hasChildren ? () => toggleExpanded(element.path) : undefined}
        >
          {hasChildren && (
            <span style={{ 
              fontSize: '10px',
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              width: '12px'
            }}>
              ▶
            </span>
          )}
          
          <span style={{ color: '#2563eb' }}>{'<'}</span>
          <span style={{ color: '#7c3aed', fontWeight: '600' }}>
            {element.name}
          </span>
          
          {/* Attributes */}
          {showAttributes && element.attributes && Object.keys(element.attributes).length > 0 && (
            <span style={{ color: '#059669' }}>
              {Object.entries(element.attributes).map(([key, value]) => (
                <span key={key}>
                  {' '}
                  <span style={{ color: '#dc2626' }}>{key}</span>
                  <span style={{ color: '#2563eb' }}>="</span>
                  <span style={{ color: '#059669' }}>{value}</span>
                  <span style={{ color: '#2563eb' }}>"</span>
                </span>
              ))}
            </span>
          )}
          
          <span style={{ color: '#2563eb' }}>
            {element.selfClosing ? '/>' : '>'}
          </span>
          
          {/* Text content (if short and no children) */}
          {element.text && !hasChildren && element.text.length < 50 && (
            <>
              <span style={{ color: '#374151' }}>{element.text}</span>
              <span style={{ color: '#2563eb' }}>{'</'}</span>
              <span style={{ color: '#7c3aed', fontWeight: '600' }}>{element.name}</span>
              <span style={{ color: '#2563eb' }}>{'>'}</span>
            </>
          )}
        </div>

        {/* Element content and children */}
        {!element.selfClosing && isExpanded && (
          <div style={{ marginLeft: '20px' }}>
            {/* Text content (if longer or has children) */}
            {element.text && (hasChildren || element.text.length >= 50) && (
              <div style={{
                ...getChangeStyle(changeType),
                padding: '4px 8px',
                fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                fontSize: '13px',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {element.text}
              </div>
            )}
            
            {/* Child elements */}
            {hasChildren && element.children.map((child, index) => {
              const childChangeType = getElementChangeType(child.path);
              return (
                <XmlElement
                  key={index}
                  element={child}
                  level={0}
                  changeType={childChangeType}
                />
              );
            })}
          </div>
        )}

        {/* Element closing tag */}
        {!element.selfClosing && isExpanded && (element.text?.length >= 50 || hasChildren) && (
          <div style={{
            ...getChangeStyle(changeType),
            padding: '4px 8px',
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '13px',
            marginLeft: '20px'
          }}>
            <span style={{ color: '#2563eb' }}>{'</'}</span>
            <span style={{ color: '#7c3aed', fontWeight: '600' }}>{element.name}</span>
            <span style={{ color: '#2563eb' }}>{'>'}</span>
          </div>
        )}
      </div>
    );
  };

  // Helper to get change type for an element path
  const getElementChangeType = (path) => {
    const elementChange = element_changes.find(change => change.path === path);
    const attributeChange = attribute_changes.find(change => change.path === path);
    
    if (elementChange) return elementChange.type;
    if (attributeChange) return 'attribute_changed';
    return 'unchanged';
  };

  // Structured XML view component
  const StructuredView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      minHeight: '400px',
      maxHeight: '600px'
    }}>
      {/* File 1 */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white'
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
          height: '350px',
          overflow: 'auto',
          padding: '12px'
        }}>
          {results?.file1_parsed ? (
            <XmlElement element={results.file1_parsed} />
          ) : (
            <div style={{ 
              color: '#6b7280', 
              fontStyle: 'italic',
              padding: '20px',
              textAlign: 'center' 
            }}>
              No XML structure to display
            </div>
          )}
        </div>
      </div>

      {/* File 2 */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white'
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
          height: '350px',
          overflow: 'auto',
          padding: '12px'
        }}>
          {results?.file2_parsed ? (
            <XmlElement element={results.file2_parsed} />
          ) : (
            <div style={{ 
              color: '#6b7280', 
              fontStyle: 'italic',
              padding: '20px',
              textAlign: 'center' 
            }}>
              No XML structure to display
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Source code view component
  const SourceView = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      minHeight: '400px',
      maxHeight: '600px'
    }}>
      {/* File 1 Source */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📄 {file1Name || 'File 1'} (Source)
        </div>
        <div style={{
          height: '350px',
          overflow: 'auto',
          padding: '12px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          background: '#f8f9fa'
        }}>
          {file1_content || 'No content available'}
        </div>
      </div>

      {/* File 2 Source */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          📄 {file2Name || 'File 2'} (Source)
        </div>
        <div style={{
          height: '350px',
          overflow: 'auto',
          padding: '12px',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.4',
          whiteSpace: 'pre-wrap',
          background: '#f8f9fa'
        }}>
          {file2_content || 'No content available'}
        </div>
      </div>
    </div>
  );

  // Changes summary component
  const ChangesSummary = () => {
    const allChanges = [...element_changes, ...attribute_changes];
    
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
          🔄 XML Changes Summary ({allChanges.length})
        </div>
        
        {allChanges.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            No changes detected. This might indicate an issue with the XML comparison logic.
          </div>
        ) : (
          <div style={{
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {allChanges.map((change, index) => (
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
                  📍 {change.path}
                </div>
                
                {change.type === 'removed' && (
                  <div style={{ color: '#dc2626' }}>
                    <strong>- Removed element:</strong> &lt;{change.elementName}&gt;
                  </div>
                )}
                
                {change.type === 'added' && (
                  <div style={{ color: '#16a34a' }}>
                    <strong>+ Added element:</strong> &lt;{change.elementName}&gt;
                  </div>
                )}
                
                {change.type === 'modified' && (
                  <div>
                    <div style={{ color: '#dc2626' }}>
                      <strong>- Old content:</strong> {change.oldValue}
                    </div>
                    <div style={{ color: '#16a34a' }}>
                      <strong>+ New content:</strong> {change.newValue}
                    </div>
                  </div>
                )}
                
                {change.type === 'attribute_changed' && (
                  <div>
                    <div style={{ color: '#0c4a6e' }}>
                      <strong>🏷️ Attribute "{change.attributeName}" changed:</strong>
                    </div>
                    <div style={{ color: '#dc2626', marginLeft: '16px' }}>
                      <strong>- Old:</strong> {change.oldValue}
                    </div>
                    <div style={{ color: '#16a34a', marginLeft: '16px' }}>
                      <strong>+ New:</strong> {change.newValue}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Download handler
  const handleDownloadReport = () => {
    const report = generateXmlReport();
    const blob = new Blob([report], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xml_comparison_${new Date().toISOString().slice(0,10)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateXmlReport = () => {
    const report = `<?xml version="1.0" encoding="UTF-8"?>
<comparison_report>
  <metadata>
    <generated_at>${new Date().toISOString()}</generated_at>
    <file1>${file1Name || 'File 1'}</file1>
    <file2>${file2Name || 'File 2'}</file2>
  </metadata>
  
  <statistics>
    <total_elements>${total_elements}</total_elements>
    <differences_found>${differences_found}</differences_found>
    <matches_found>${matches_found}</matches_found>
    <similarity_percentage>${total_elements > 0 ? Math.round((matches_found / total_elements) * 100) : 0}</similarity_percentage>
  </statistics>
  
  <changes>
    ${[...element_changes, ...attribute_changes].map(change => `
    <change type="${change.type}" path="${change.path}">
      ${change.oldValue ? `<old_value><![CDATA[${change.oldValue}]]></old_value>` : ''}
      ${change.newValue ? `<new_value><![CDATA[${change.newValue}]]></new_value>` : ''}
      ${change.elementName ? `<element_name>${change.elementName}</element_name>` : ''}
      ${change.attributeName ? `<attribute_name>${change.attributeName}</attribute_name>` : ''}
    </change>`).join('')}
  </changes>
</comparison_report>`;
    
    return report;
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
          🏗️ XML Comparison Results
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Element-based structural comparison with attributes analysis
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
              {total_elements}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Elements</div>
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
              {total_elements > 0 ? Math.round((matches_found / total_elements) * 100) : 0}%
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
        {/* View Mode */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>View:</span>
          <button
            onClick={() => setViewMode('structured')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'structured' ? '#2563eb' : 'white',
              color: viewMode === 'structured' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            🏗️ Structured
          </button>
          <button
            onClick={() => setViewMode('source')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'source' ? '#2563eb' : 'white',
              color: viewMode === 'source' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            📄 Source
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showAttributes}
              onChange={(e) => setShowAttributes(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Show Attributes</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highlightChanges}
              onChange={(e) => setHighlightChanges(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Highlight Changes</span>
          </label>
        </div>

        {/* Download */}
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
          <span>Added elements</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #e74c3c',
            borderRadius: '3px'
          }}></div>
          <span>Removed elements</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '3px'
          }}></div>
          <span>Modified elements</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e1f5fe',
            border: '1px solid #0ea5e9',
            borderRadius: '3px'
          }}></div>
          <span>Attribute changes</span>
        </div>
      </div>

      {/* Main View */}
      {viewMode === 'structured' ? <StructuredView /> : <SourceView />}

      {/* Changes Summary */}
      <ChangesSummary />

      {/* Debug Information (temporary for troubleshooting) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginTop: '20px',
          background: '#fffbeb'
        }}>
          <div style={{
            background: '#fef3c7',
            padding: '12px 16px',
            borderBottom: '1px solid #f59e0b',
            fontWeight: '600',
            color: '#92400e'
          }}>
            🐛 Debug Information
          </div>
          <div style={{
            padding: '16px',
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '12px',
            color: '#92400e'
          }}>
            <div><strong>Total Elements:</strong> {total_elements}</div>
            <div><strong>Differences Found:</strong> {differences_found}</div>
            <div><strong>Matches Found:</strong> {matches_found}</div>
            <div><strong>Element Changes:</strong> {element_changes.length}</div>
            <div><strong>Attribute Changes:</strong> {attribute_changes.length}</div>
            <div><strong>File 1 Parsed:</strong> {results?.file1_parsed ? 'Yes' : 'No'}</div>
            <div><strong>File 2 Parsed:</strong> {results?.file2_parsed ? 'Yes' : 'No'}</div>
            <div><strong>Results Object Keys:</strong> {results ? Object.keys(results).join(', ') : 'None'}</div>
          </div>
        </div>
      )}

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
            XML documents are identical!
          </h3>
          <p style={{
            color: '#16a34a',
            fontSize: '1.1rem',
            margin: 0
          }}>
            No differences found between the XML structures.
          </p>
        </div>
      )}
    </div>
  );
};

export default XmlResults;
