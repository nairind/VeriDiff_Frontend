import React, { useState } from 'react';

const TextResults = ({ results, file1Name, file2Name }) => {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'unified'
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [highlightWhitespace, setHighlightWhitespace] = useState(false);

  // Extract data from results - adjust based on actual compareTextFiles_main output
  const {
    differences_found = 0,
    matches_found = 0,
    total_lines = 0,
    changes = [],
    file1_content = '',
    file2_content = '',
    line_by_line_comparison = []
  } = results || {};

  const file1Lines = file1_content.split('\n');
  const file2Lines = file2_content.split('\n');

  // Helper function to highlight whitespace
  const highlightWhitespaceChars = (text) => {
    if (!highlightWhitespace) return text;
    return text
      .replace(/ /g, '·')
      .replace(/\t/g, '→   ');
  };

  // Helper function to get line status styling
  const getLineStyle = (status) => {
    switch (status) {
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

  // Download handlers
  const handleDownloadDiff = () => {
    const diffContent = generateDiffContent();
    const blob = new Blob([diffContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateDiffContent = () => {
    let content = `Comparison Report: ${file1Name} vs ${file2Name}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `Statistics:\n`;
    content += `- Total lines compared: ${total_lines}\n`;
    content += `- Lines with differences: ${differences_found}\n`;
    content += `- Matching lines: ${matches_found}\n\n`;
    content += `Differences:\n`;
    content += `${'='.repeat(60)}\n`;
    
    line_by_line_comparison.forEach((line, index) => {
      if (line.status !== 'unchanged') {
        content += `\nLine ${index + 1}:\n`;
        if (line.status === 'removed' || line.status === 'modified') {
          content += `- ${line.file1_content}\n`;
        }
        if (line.status === 'added' || line.status === 'modified') {
          content += `+ ${line.file2_content}\n`;
        }
      }
    });
    
    return content;
  };

  // Side-by-side view component
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
          height: '100%',
          overflow: 'auto',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {file1Lines.map((line, index) => {
            const comparisonLine = line_by_line_comparison[index];
            const status = comparisonLine?.status || 'unchanged';
            const lineStyle = getLineStyle(status === 'added' ? 'unchanged' : status);
            
            return (
              <div
                key={index}
                style={{
                  ...lineStyle,
                  padding: '4px 12px',
                  display: 'flex',
                  minHeight: '22px'
                }}
              >
                {showLineNumbers && (
                  <span style={{
                    width: '40px',
                    color: '#6b7280',
                    fontSize: '11px',
                    marginRight: '12px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre', wordBreak: 'break-all' }}>
                  {highlightWhitespaceChars(line)}
                </span>
              </div>
            );
          })}
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
          height: '100%',
          overflow: 'auto',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {file2Lines.map((line, index) => {
            const comparisonLine = line_by_line_comparison[index];
            const status = comparisonLine?.status || 'unchanged';
            const lineStyle = getLineStyle(status === 'removed' ? 'unchanged' : status);
            
            return (
              <div
                key={index}
                style={{
                  ...lineStyle,
                  padding: '4px 12px',
                  display: 'flex',
                  minHeight: '22px'
                }}
              >
                {showLineNumbers && (
                  <span style={{
                    width: '40px',
                    color: '#6b7280',
                    fontSize: '11px',
                    marginRight: '12px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre', wordBreak: 'break-all' }}>
                  {highlightWhitespaceChars(line)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Unified diff view component
  const UnifiedView = () => (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '600px'
    }}>
      <div style={{
        background: '#f8fafc',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        📄 Unified Diff: {file1Name} ↔ {file2Name}
      </div>
      <div style={{
        height: '100%',
        overflow: 'auto',
        fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        {line_by_line_comparison.map((comparison, index) => {
          const { status, file1_content, file2_content } = comparison;
          
          if (status === 'unchanged') {
            return (
              <div
                key={index}
                style={{
                  ...getLineStyle('unchanged'),
                  padding: '4px 12px',
                  display: 'flex',
                  minHeight: '22px'
                }}
              >
                {showLineNumbers && (
                  <span style={{
                    width: '60px',
                    color: '#6b7280',
                    fontSize: '11px',
                    marginRight: '12px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre' }}>
                  {highlightWhitespaceChars(file1_content)}
                </span>
              </div>
            );
          }

          const lines = [];
          
          if (status === 'removed' || status === 'modified') {
            lines.push(
              <div
                key={`${index}-removed`}
                style={{
                  ...getLineStyle('removed'),
                  padding: '4px 12px',
                  display: 'flex',
                  minHeight: '22px'
                }}
              >
                {showLineNumbers && (
                  <span style={{
                    width: '60px',
                    color: '#6b7280',
                    fontSize: '11px',
                    marginRight: '12px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    -{index + 1}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre' }}>
                  {highlightWhitespaceChars(file1_content)}
                </span>
              </div>
            );
          }
          
          if (status === 'added' || status === 'modified') {
            lines.push(
              <div
                key={`${index}-added`}
                style={{
                  ...getLineStyle('added'),
                  padding: '4px 12px',
                  display: 'flex',
                  minHeight: '22px'
                }}
              >
                {showLineNumbers && (
                  <span style={{
                    width: '60px',
                    color: '#6b7280',
                    fontSize: '11px',
                    marginRight: '12px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    +{index + 1}
                  </span>
                )}
                <span style={{ whiteSpace: 'pre' }}>
                  {highlightWhitespaceChars(file2_content)}
                </span>
              </div>
            );
          }
          
          return lines;
        })}
      </div>
    </div>
  );

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
          📄 Text Comparison Results
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Line-by-line difference analysis
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
              {total_lines}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Lines</div>
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
              {total_lines > 0 ? Math.round((matches_found / total_lines) * 100) : 0}%
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
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#374151' }}>View:</span>
          <button
            onClick={() => setViewMode('side-by-side')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'side-by-side' ? '#2563eb' : 'white',
              color: viewMode === 'side-by-side' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              background: viewMode === 'unified' ? '#2563eb' : 'white',
              color: viewMode === 'unified' ? 'white' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            Unified
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Line Numbers</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highlightWhitespace}
              onChange={(e) => setHighlightWhitespace(e.target.checked)}
              style={{ accentColor: '#2563eb' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>Show Whitespace</span>
          </label>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownloadDiff}
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
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'none';
            e.target.style.boxShadow = 'none';
          }}
        >
          📄 Download Diff
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
          <span>Added lines</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #e74c3c',
            borderRadius: '3px'
          }}></div>
          <span>Removed lines</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '3px'
          }}></div>
          <span>Modified lines</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '3px'
          }}></div>
          <span>Unchanged lines</span>
        </div>
      </div>

      {/* Main Diff View */}
      {viewMode === 'side-by-side' ? <SideBySideView /> : <UnifiedView />}

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
            Files are identical!
          </h3>
          <p style={{
            color: '#16a34a',
            fontSize: '1.1rem',
            margin: 0
          }}>
            No differences found between the two text files.
          </p>
        </div>
      )}
    </div>
  );
};

export default TextResults;
