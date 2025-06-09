// pdfresults.js - Clean PDF Results Display Component
// This file only handles displaying comparison results, no comparison logic

import React, { useState, useEffect } from 'react';

const PDFResults = ({ comparisonResults, onNewComparison, onDownloadReport }) => {
  const [activeTab, setActiveTab] = useState('changes');
  const [showContext, setShowContext] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Extract results data
  const {
    similarity_score = 0,
    differences_found = 0,
    total_pages = 0,
    text_changes = [],
    page_differences = [],
    comparison_method = 'Basic Comparison',
    file1_metadata = {},
    file2_metadata = {},
    change_summary = {},
    quality_metrics = {}
  } = comparisonResults || {};

  // Determine if this is an enhanced SmartDiff comparison
  const isSmartDiff = comparison_method?.includes('SmartDiff') || 
                     comparison_method?.includes('Enhanced') ||
                     comparisonResults?.comparison_type?.includes('smartdiff');

  const isBasicComparison = !isSmartDiff;

  // Filter changes based on selected filter
  const filteredChanges = text_changes.filter(change => {
    if (filterType === 'all') return true;
    if (filterType === 'added') return change.type === 'added';
    if (filterType === 'removed') return change.type === 'removed';
    if (filterType === 'modified') return change.type === 'modified';
    return true;
  });

  // Group changes by page
  const changesByPage = filteredChanges.reduce((acc, change) => {
    const page = change.page || 1;
    if (!acc[page]) acc[page] = [];
    acc[page].push(change);
    return acc;
  }, {});

  // Format confidence display
  const formatConfidence = (confidence) => {
    if (!confidence) return '';
    return confidence === 'high' ? '🎯 High' : 
           confidence === 'medium' ? '⚠️ Medium' : 
           '❓ Low';
  };

  // Format content type display
  const formatContentType = (contentType) => {
    if (!contentType) return '';
    const typeMap = {
      'subtotal': '💰 Subtotal',
      'tax': '📊 Tax',
      'total': '🧮 Total',
      'line_item': '📝 Line Item',
      'email': '📧 Email',
      'phone': '📞 Phone',
      'address': '🏠 Address',
      'general_text': '📄 Text'
    };
    return typeMap[contentType] || `📋 ${contentType}`;
  };

  // Format alignment type
  const formatAlignmentType = (alignmentType) => {
    if (!alignmentType) return '';
    const alignmentMap = {
      'exact_match': '✅ Exact Match',
      'content_type_match': '🎯 Content Match', 
      'positional': '📍 Positional',
      'added': '➕ Addition',
      'deleted': '➖ Deletion'
    };
    return alignmentMap[alignmentType] || alignmentType;
  };

  return (
    <div className="pdf-results-container">
      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📋 PDF Comparison Results</h1>
            <p className="file-info">
              {file1_metadata.fileName || 'File 1'} vs {file2_metadata.fileName || 'File 2'}
            </p>
          </div>
          <div className="header-right">
            <button onClick={onNewComparison} className="btn-secondary">
              🔄 New Comparison
            </button>
            <button onClick={onDownloadReport} className="btn-primary">
              📥 Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Method Alert */}
      {isBasicComparison && (
        <div className="alert alert-warning">
          <div className="alert-content">
            <div className="alert-icon">⚠️</div>
            <div className="alert-text">
              <strong>Basic Line-by-Line Comparison</strong>
              <p>Prone to alignment errors when items are added/removed (like SSL Certificate issue)</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-enable-smartdiff"
            >
              Enable SmartDiff
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card similarity">
          <div className="metric-value">{similarity_score}%</div>
          <div className="metric-label">Similarity Score</div>
        </div>
        <div className="metric-card changes">
          <div className="metric-value">{differences_found}</div>
          <div className="metric-label">Changes Found</div>
        </div>
        <div className="metric-card pages">
          <div className="metric-value">{page_differences?.length || 0}</div>
          <div className="metric-label">Pages Modified</div>
        </div>
        <div className="metric-card total-pages">
          <div className="metric-value">{total_pages}</div>
          <div className="metric-label">Total Pages</div>
        </div>
      </div>

      {/* Enhanced SmartDiff Stats */}
      {isSmartDiff && change_summary && (
        <div className="smartdiff-stats">
          <h3>🧠 SmartDiff Analysis</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Method:</span>
              <span className="stat-value">{comparison_method}</span>
            </div>
            {change_summary.high_confidence > 0 && (
              <div className="stat-item">
                <span className="stat-label">High Confidence:</span>
                <span className="stat-value">{change_summary.high_confidence}/{change_summary.total_changes}</span>
              </div>
            )}
            {change_summary.exact_alignments > 0 && (
              <div className="stat-item">
                <span className="stat-label">Exact Alignments:</span>
                <span className="stat-value">{change_summary.exact_alignments}</span>
              </div>
            )}
            {change_summary.content_alignments > 0 && (
              <div className="stat-item">
                <span className="stat-label">Content Alignments:</span>
                <span className="stat-value">{change_summary.content_alignments}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'changes' ? 'active' : ''}`}
            onClick={() => setActiveTab('changes')}
          >
            📋 Changes List
          </button>
          <button 
            className={`tab ${activeTab === 'sidebyside' ? 'active' : ''}`}
            onClick={() => setActiveTab('sidebyside')}
          >
            👀 Side-by-Side
          </button>
        </div>
      </div>

      {/* Changes List Tab */}
      {activeTab === 'changes' && (
        <div className="changes-section">
          <div className="changes-header">
            <h2>📋 Changes Found ({filteredChanges.length})</h2>
            
            <div className="changes-controls">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showContext}
                  onChange={(e) => setShowContext(e.target.checked)}
                />
                Show context
              </label>
              
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All changes</option>
                <option value="added">Added only</option>
                <option value="removed">Removed only</option>
                <option value="modified">Modified only</option>
              </select>
            </div>
          </div>

          <div className="changes-list">
            {Object.entries(changesByPage).map(([pageNum, changes]) => (
              <div key={pageNum} className="page-section">
                <h3 className="page-header">Page {pageNum}</h3>
                
                {changes.map((change, index) => (
                  <div key={index} className={`change-item ${change.type}`}>
                    <div className="change-header">
                      <span className="change-location">
                        📝 Page {change.page}, Paragraph {change.paragraph}
                      </span>
                      <span className="change-type-badge">
                        {change.type.toUpperCase()}
                      </span>
                      
                      {/* Enhanced SmartDiff Info */}
                      {isSmartDiff && (
                        <div className="smartdiff-info">
                          {change.confidence && (
                            <span className="confidence-badge">
                              {formatConfidence(change.confidence)}
                            </span>
                          )}
                          {change.content_type && (
                            <span className="content-type-badge">
                              {formatContentType(change.content_type)}
                            </span>
                          )}
                          {change.alignment_type && (
                            <span className="alignment-badge">
                              {formatAlignmentType(change.alignment_type)}
                            </span>
                          )}
                          {change.similarity && (
                            <span className="similarity-badge">
                              {change.similarity}% similar
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="change-content">
                      {/* Added Content */}
                      {change.type === 'added' && (
                        <div className="added-content">
                          <div className="content-label">✅ New:</div>
                          <div className="content-text">{change.text}</div>
                        </div>
                      )}

                      {/* Removed Content */}
                      {change.type === 'removed' && (
                        <div className="removed-content">
                          <div className="content-label">❌ Original:</div>
                          <div className="content-text">{change.text}</div>
                        </div>
                      )}

                      {/* Modified Content */}
                      {change.type === 'modified' && (
                        <div className="modified-content">
                          <div className="original-content">
                            <div className="content-label">❌ Original:</div>
                            <div className="content-text">{change.old_text}</div>
                          </div>
                          <div className="new-content">
                            <div className="content-label">✅ New:</div>
                            <div className="content-text">{change.new_text}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Context Information */}
                    {showContext && (
                      <div className="change-context">
                        <div className="context-item">
                          <strong>File:</strong> {change.file}
                        </div>
                        {change.char_count && (
                          <div className="context-item">
                            <strong>Length:</strong> {change.char_count} characters
                          </div>
                        )}
                        {change.char_count_old && change.char_count_new && (
                          <div className="context-item">
                            <strong>Length Change:</strong> {change.char_count_old} → {change.char_count_new} characters
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {filteredChanges.length === 0 && (
              <div className="no-changes">
                <div className="no-changes-icon">✅</div>
                <div className="no-changes-text">
                  No changes found with the current filter.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Tab */}
      {activeTab === 'sidebyside' && (
        <div className="sidebyside-section">
          <div className="sidebyside-header">
            <h2>👀 Side-by-Side View</h2>
            <p>Compare documents page by page</p>
          </div>
          
          <div className="sidebyside-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🔄</div>
              <div className="placeholder-text">
                Side-by-side view implementation goes here
              </div>
              <div className="placeholder-subtext">
                This would show the original PDFs side by side with changes highlighted
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="results-footer">
        <div className="footer-stats">
          <div className="stat">
            <strong>Processing Method:</strong> {comparison_method}
          </div>
          {quality_metrics?.processing_speed_pages_per_second && (
            <div className="stat">
              <strong>Speed:</strong> {quality_metrics.processing_speed_pages_per_second} pages/second
            </div>
          )}
          {quality_metrics?.memory_usage && (
            <div className="stat">
              <strong>Memory:</strong> {quality_metrics.memory_usage}
            </div>
          )}
          {file1_metadata?.successRate && file2_metadata?.successRate && (
            <div className="stat">
              <strong>Success Rate:</strong> {Math.round((file1_metadata.successRate + file2_metadata.successRate) / 2 * 100)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Styles (include in your stylesheet)
const styles = `
.pdf-results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.results-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.file-info {
  opacity: 0.9;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.alert {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-warning {
  background: #fef3cd;
  border: 1px solid #faebcc;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-icon {
  font-size: 20px;
}

.alert-text {
  flex: 1;
}

.alert-text strong {
  color: #856404;
  display: block;
  margin-bottom: 4px;
}

.alert-text p {
  color: #856404;
  margin: 0;
  font-size: 14px;
}

.btn-enable-smartdiff {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-label {
  color: #6c757d;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.similarity .metric-value { color: #007bff; }
.changes .metric-value { color: #fd7e14; }
.pages .metric-value { color: #28a745; }
.total-pages .metric-value { color: #6f42c1; }

.smartdiff-stats {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.smartdiff-stats h3 {
  margin: 0 0 16px 0;
  color: #495057;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.tabs-container {
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 2px;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: 600;
}

.changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.changes-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
}

.page-section {
  margin-bottom: 30px;
}

.page-header {
  background: #e9ecef;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.change-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.change-item.added { border-left: 4px solid #28a745; }
.change-item.removed { border-left: 4px solid #dc3545; }
.change-item.modified { border-left: 4px solid #ffc107; }

.change-header {
  background: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.change-type-badge {
  background: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.smartdiff-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.confidence-badge,
.content-type-badge,
.alignment-badge,
.similarity-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.confidence-badge { background: #d4edda; color: #155724; }
.content-type-badge { background: #cce5ff; color: #004085; }
.alignment-badge { background: #fff3cd; color: #856404; }
.similarity-badge { background: #e2e3e5; color: #383d41; }

.change-content {
  padding: 16px;
}

.content-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.content-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.modified-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.original-content .content-text {
  background: #f8d7da;
}

.new-content .content-text {
  background: #d4edda;
}

.change-context {
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.context-item {
  font-size: 14px;
  color: #6c757d;
}

.no-changes {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.no-changes-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.sidebyside-placeholder {
  text-align: center;
  padding: 80px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.placeholder-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.placeholder-subtext {
  color: #6c757d;
}

.results-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.footer-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-stats .stat {
  font-size: 14px;
  color: #6c757d;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .changes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .modified-content {
    grid-template-columns: 1fr;
  }
}
`;

export default PDFResults;
