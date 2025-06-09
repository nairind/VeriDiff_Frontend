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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-700">{data.similarity_score}%</div>
        <div className="text-sm text-blue-600">Similarity</div>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="text-2xl font-bold text-orange-700">{data.differences_found}</div>
        <div className="text-sm text-orange-600">Changes Found</div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <div className="text-2xl font-bold text-green-700">{data.page_differences?.length || 0}</div>
        <div className="text-sm text-green-600">Pages Modified</div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div className="text-2xl font-bold text-purple-700">{data.total_pages}</div>
        <div className="text-sm text-purple-600">Total Pages</div>
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

    const getChangeColor = (type) => {
      switch (type) {
        case 'added': return 'border-green-200 bg-green-50';
        case 'removed': return 'border-red-200 bg-red-50';
        case 'modified': return 'border-orange-200 bg-orange-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    };

    return (
      <div key={index} className={`border rounded-lg p-4 ${getChangeColor(change.type)}`}>
        {/* Change Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getChangeIcon(change.type)}</span>
            <span className="font-semibold text-gray-800">
              Page {change.page}, Paragraph {change.paragraph}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              change.type === 'added' ? 'bg-green-100 text-green-800' :
              change.type === 'removed' ? 'bg-red-100 text-red-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {change.type.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => setSelectedPage(change.page)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Page →
          </button>
        </div>

        {/* Context Before (if enabled) */}
        {showContext && change.context_before && (
          <div className="mb-2 text-sm text-gray-600">
            <span className="font-medium">Context:</span> ...{change.context_before}...
          </div>
        )}

        {/* Change Content */}
        <div className="space-y-2">
          {change.type === 'modified' ? (
            <>
              <div className="bg-red-100 border border-red-200 rounded p-3">
                <div className="text-red-800 font-medium text-sm mb-1">Original:</div>
                <div className="text-red-900 font-mono text-sm">"{change.old_text}"</div>
              </div>
              <div className="bg-green-100 border border-green-200 rounded p-3">
                <div className="text-green-800 font-medium text-sm mb-1">Changed to:</div>
                <div className="text-green-900 font-mono text-sm">"{change.new_text}"</div>
              </div>
            </>
          ) : change.type === 'added' ? (
            <div className="bg-green-100 border border-green-200 rounded p-3">
              <div className="text-green-800 font-medium text-sm mb-1">Added:</div>
              <div className="text-green-900 font-mono text-sm">"{change.new_text}"</div>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-200 rounded p-3">
              <div className="text-red-800 font-medium text-sm mb-1">Removed:</div>
              <div className="text-red-900 font-mono text-sm">"{change.old_text}"</div>
            </div>
          )}
        </div>

        {/* Context After (if enabled) */}
        {showContext && change.context_after && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Continues:</span> ...{change.context_after}...
          </div>
        )}
      </div>
    );
  };

  const renderChangesView = () => (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Changes Found ({data.text_changes?.length || 0})
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showContext}
              onChange={(e) => setShowContext(e.target.checked)}
              className="rounded"
            />
            Show context
          </label>
          <select 
            className="px-3 py-1 border border-gray-300 rounded text-sm"
            onChange={(e) => {
              // Filter changes by type
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
      <div className="space-y-4">
        {data.text_changes?.map((change, index) => renderChangeItem(change, index)) || (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-medium">No differences found!</div>
            <div className="text-sm">The documents are identical.</div>
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
            padding: '8px 12px',
            margin: '4px 0',
            borderRadius: '4px'
          };
        case 'removed':
          return {
            backgroundColor: '#fee2e2',
            borderLeft: '4px solid #ef4444',
            padding: '8px 12px',
            margin: '4px 0',
            borderRadius: '4px'
          };
        case 'modified':
          return {
            backgroundColor: '#fef3c7',
            borderLeft: '4px solid #f59e0b',
            padding: '8px 12px',
            margin: '4px 0',
            borderRadius: '4px'
          };
        default:
          return {
            padding: '8px 12px',
            margin: '4px 0',
            lineHeight: '1.5'
          };
      }
    };

    return (
      <div>
        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500 rounded"></div>
            <span>Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500 rounded"></div>
            <span>Removed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-l-4 border-orange-500 rounded"></div>
            <span>Modified</span>
          </div>
        </div>

        {/* Synchronized Side-by-Side Panels */}
        <div className="grid grid-cols-2 gap-4 h-96">
          {/* Left Document */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-800 border-b">
              📄 {file1Name || 'Document 1'} (Original)
            </div>
            <div 
              ref={leftPaneRef}
              className="h-80 overflow-y-auto p-4"
              onScroll={(e) => handleScroll(e.target, rightPaneRef)}
            >
              {mockPages.map((page) => (
                <div key={`left-${page.page}`} className="mb-6">
                  <div className="bg-blue-50 px-3 py-2 text-blue-800 font-medium text-sm rounded mb-3">
                    Page {page.page}
                  </div>
                  {page.doc1_content.map((item, index) => (
                    <div 
                      key={`left-${page.page}-${index}`} 
                      style={getHighlightStyle(item.type)}
                      className="font-mono text-sm"
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Document */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-800 border-b">
              📄 {file2Name || 'Document 2'} (Updated)
            </div>
            <div 
              ref={rightPaneRef}
              className="h-80 overflow-y-auto p-4"
              onScroll={(e) => handleScroll(e.target, leftPaneRef)}
            >
              {mockPages.map((page) => (
                <div key={`right-${page.page}`} className="mb-6">
                  <div className="bg-blue-50 px-3 py-2 text-blue-800 font-medium text-sm rounded mb-3">
                    Page {page.page}
                  </div>
                  {page.doc2_content.map((item, index) => (
                    <div 
                      key={`right-${page.page}-${index}`} 
                      style={getHighlightStyle(item.type)}
                      className="font-mono text-sm"
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
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0;
                if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0;
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              ⬆️ Top
            </button>
            <button 
              onClick={() => {
                const scrollToNext = () => {
                  // Find next change and scroll to it
                  if (leftPaneRef.current && rightPaneRef.current) {
                    const currentScroll = leftPaneRef.current.scrollTop;
                    leftPaneRef.current.scrollTop = currentScroll + 200;
                    rightPaneRef.current.scrollTop = currentScroll + 200;
                  }
                };
                scrollToNext();
              }}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
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
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              ⬇️ Bottom
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">📊 PDF Comparison Results</h1>
            <div className="text-blue-100 text-sm">
              {file1Name || 'Document 1'} vs {file2Name || 'Document 2'}
            </div>
          </div>
          <button
            onClick={downloadReport}
            disabled={isGeneratingDownload}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 flex items-center gap-2"
          >
            {isGeneratingDownload ? '⏳ Generating...' : '📥 Download Report'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Statistics */}
        {renderSummaryStats()}

        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('changes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'changes' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Changes List
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'sideBySide' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📄 Side-by-Side
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'changes' ? renderChangesView() : renderSideBySideView()}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600">
          Processed in {data.processing_time?.total_time_ms}ms • 
          {data.file1_metadata?.totalPages} pages • 
          {data.file1_metadata?.totalWords} words analyzed
        </div>
      </div>
    </div>
  );
};

export default ImprovedPdfResults;
