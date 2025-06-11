/* SUMMARY VIEW: Show filtered changes */
        <>
          {session ? (
            /* AUTHENTICATED: Show full expandable pages */
            results.page_differences && results.page_differences.length > 0 ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: 0,
                    color: '#1f2937'
                  }}>
                    📋 Page-by-Page Changes ({results.page_differences.length} pages affected)
                  </h3>
                  
                  <button
                    onClick={toggleAllPages}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                  >
                    {expandedPages.size === results.page_differences.length ? '📕 Collapse All' : '📖 Expand All'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {results.page_differences.map((page, index) => (
                    <div
                      key={page.page_number}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Page Header */}
                      <div
                        onClick={() => togglePageExpansion(page.page_number)}
                        style={{
                          background: '#f8fafc',
                          padding: '15px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: expandedPages.has(page.page_number) ? '1px solid #e5e7eb' : 'none'
                        }}
                      >
                        <div>
                          <h4 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            📄 Page {page.page_number}
                          </h4>
                          <p style={{
                            margin: '5px 0 0 0',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            {page.summary} • {page.page1_paragraphs || 0} → {page.page2_paragraphs || 0} paragraphs
                          </p>
                        </div>
                        
                        <div style={{
                          fontSize: '1.2rem',
                          transform: expandedPages.has(page.page_number) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2// components/PdfResults.js - Excel-Style Dashboard with Progressive Display
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PDFSideBySideView from '../components/PDFSideBySideView';
import { useRef, useCallback } from 'react';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const { data: session, status } = useSession();
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'sideBySide'
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  
  // Advanced Options State
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'changes', 'matches'
  const [focusMode, setFocusMode] = useState(false);
  const [groupSimilar, setGroupSimilar] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs for managing focus and scroll
  const searchInputRef = useRef(null);
  const filterSelectRef = useRef(null);
  const focusModeRef = useRef(null);
  const groupSimilarRef = useRef(null);
  const ignoreWhitespaceRef = useRef(null);
  const advancedOptionsRef = useRef(null);
  
  // Handle search input with focus preservation
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Preserve focus after state update
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  }, []);

  // Handle filter dropdown with focus preservation
  const handleFilterChange = useCallback((e) => {
    const value = e.target.value;
    setFilterMode(value);
    
    // Preserve focus after state update
    setTimeout(() => {
      if (filterSelectRef.current) {
        filterSelectRef.current.focus();
      }
    }, 0);
  }, []);

  // Handle focus mode checkbox with focus preservation
  const handleFocusModeChange = useCallback((e) => {
    const checked = e.target.checked;
    setFocusMode(checked);
    
    // Preserve focus after state update
    setTimeout(() => {
      if (focusModeRef.current) {
        focusModeRef.current.focus();
      }
    }, 0);
  }, []);

  // Handle group similar checkbox with focus preservation
  const handleGroupSimilarChange = useCallback((e) => {
    const checked = e.target.checked;
    setGroupSimilar(checked);
    
    // Preserve focus after state update
    setTimeout(() => {
      if (groupSimilarRef.current) {
        groupSimilarRef.current.focus();
      }
    }, 0);
  }, []);

  // Handle ignore whitespace checkbox with focus preservation
  const handleIgnoreWhitespaceChange = useCallback((e) => {
    const checked = e.target.checked;
    setIgnoreWhitespace(checked);
    
    // Preserve focus after state update
    setTimeout(() => {
      if (ignoreWhitespaceRef.current) {
        ignoreWhitespaceRef.current.focus();
      }
    }, 0);
  }, []);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilterMode('all');
    setSearchTerm('');
    setFocusMode(false);
    setGroupSimilar(true);
    setIgnoreWhitespace(false);
  }, []);

  // ALL EXISTING DOWNLOAD OPTIONS AND FUNCTIONS REMAIN EXACTLY THE SAME
  const downloadOptions = [
    {
      id: 'html',
      label: '📄 HTML Report',
      description: 'Professional web page with side-by-side comparison',
      format: 'html'
    },
    {
      id: 'excel',
      label: '📊 Excel Export',
      description: 'Structured data with change analysis',
      format: 'xlsx'
    },
    {
      id: 'csv',
      label: '📋 CSV Data',
      description: 'Raw comparison data for analysis',
      format: 'csv'
    },
    {
      id: 'text',
      label: '📝 Text Report',
      description: 'Detailed text-based comparison report',
      format: 'txt'
    }
  ];

  // ALL EXISTING DOWNLOAD FUNCTIONS REMAIN EXACTLY THE SAME
  const generateHTMLReport = () => {
    const timestamp = new Date().toLocaleString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Comparison Report - ${file1Name} vs ${file2Name}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc; 
            line-height: 1.6;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #e5e7eb; 
        }
        .title { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 10px; 
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { 
            color: #6b7280; 
            font-size: 1.1rem; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .summary-card { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #e5e7eb; 
            text-align: center;
        }
        .summary-card h3 { 
            margin: 0 0 15px 0; 
            color: #1f2937; 
            font-size: 1.1rem; 
        }
        .summary-card .metric { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 5px; 
        }
        .similarity-high { color: #22c55e; }
        .similarity-medium { color: #f59e0b; }
        .similarity-low { color: #ef4444; }
        .side-by-side { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 30px 0; 
        }
        .document-panel { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            overflow: hidden; 
        }
        .document-header { 
            background: #f8fafc; 
            padding: 15px; 
            font-weight: 600; 
            border-bottom: 1px solid #e5e7eb; 
        }
        .document-content { 
            padding: 20px; 
            max-height: 600px; 
            overflow-y: auto; 
        }
        .page { 
            margin-bottom: 30px; 
        }
        .page-header { 
            background: #f3f4f6; 
            padding: 8px 12px; 
            border-radius: 4px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            font-size: 0.9rem; 
        }
        .paragraph { 
            margin-bottom: 12px; 
            padding: 8px 0; 
            line-height: 1.6; 
        }
        .added { 
            background: #dcfce7; 
            border: 1px solid #166534; 
            color: #166534; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .removed { 
            background: #fee2e2; 
            border: 1px solid #dc2626; 
            color: #dc2626; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .modified { 
            background: #fef3c7; 
            border: 1px solid #d97706; 
            color: #92400e; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .legend { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 20px 0; 
            font-size: 0.9rem; 
        }
        .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        .legend-box { 
            width: 16px; 
            height: 16px; 
            border-radius: 3px; 
        }
        .nav-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
        }
        .nav-button {
            padding: 8px 16px;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1d4ed8;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
        }
        .nav-button:hover {
            background: linear-gradient(135deg, #bfdbfe, #93c5fd);
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 0.9rem; 
        }
        .powered-by {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-weight: 600;
            color: #374151;
        }
        @media (max-width: 768px) {
            .side-by-side { grid-template-columns: 1fr; }
            .summary-grid { grid-template-columns: 1fr; }
            .container { padding: 20px; }
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .nav-buttons { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📑 PDF Comparison Report</h1>
            <p class="subtitle">Generated on ${timestamp}</p>
            <p><strong>${file1Name || 'Document 1'}</strong> vs <strong>${file2Name || 'Document 2'}</strong></p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>📊 Overall Similarity</h3>
                <div class="metric ${results.similarity_score >= 90 ? 'similarity-high' : results.similarity_score >= 70 ? 'similarity-medium' : 'similarity-low'}">
                    ${results.similarity_score || 0}%
                </div>
                <p>Document similarity score</p>
            </div>
            <div class="summary-card">
                <h3>📄 Pages Compared</h3>
                <div class="metric" style="color: #2563eb;">${results.total_pages || 0}</div>
                <p>${results.page_differences?.length || 0} pages with changes</p>
            </div>
            <div class="summary-card">
                <h3>🔍 Changes Found</h3>
                <div class="metric" style="color: #7c3aed;">${results.differences_found || 0}</div>
                <p>Total differences detected</p>
            </div>
            <div class="summary-card">
                <h3>📝 Word Analysis</h3>
                <div class="metric" style="color: #059669;">
                    ${results.word_changes?.file1_words || 0} → ${results.word_changes?.file2_words || 0}
                </div>
                <p>${results.word_changes?.word_change_percentage || 0}% word change</p>
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-box" style="background: #dcfce7; border: 1px solid #166534;"></div>
                <span>Added Content</span>
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background: #fee2e2; border: 1px solid #dc2626;"></div>
                <span>Removed Content</span>
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background: #fef3c7; border: 1px solid #d97706;"></div>
                <span>Modified Content</span>
            </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
            <button class="nav-button" onclick="scrollToTop()">⬆️ Top</button>
            <button class="nav-button" onclick="scrollDown()">🔍 Next Section</button>
            <button class="nav-button" onclick="scrollToBottom()">⬇️ Bottom</button>
        </div>

        <div class="side-by-side">
            <div class="document-panel">
                <div class="document-header">📄 ${file1Name || 'Document 1'}</div>
                <div class="document-content" id="leftPanel">
                    ${(results.file1_pages || []).map(page => `
                        <div class="page">
                            <div class="page-header">Page ${page.page_number}</div>
                            ${(page.paragraphs || []).map((para, index) => {
                                const change = (results.text_changes || []).find(c => 
                                    c.page === page.page_number && c.paragraph === index
                                );
                                const changeClass = change ? change.type : '';
                                return `<div class="paragraph ${changeClass}">${para.text}</div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="document-panel">
                <div class="document-header">📄 ${file2Name || 'Document 2'}</div>
                <div class="document-content" id="rightPanel">
                    ${(results.file2_pages || []).map(page => `
                        <div class="page">
                            <div class="page-header">Page ${page.page_number}</div>
                            ${(page.paragraphs || []).map((para, index) => {
                                const change = (results.text_changes || []).find(c => 
                                    c.page === page.page_number && c.paragraph === index
                                );
                                const changeClass = change ? change.type : '';
                                return `<div class="paragraph ${changeClass}">${para.text}</div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by VeriDiff - Professional File Comparison Tool</p>
            <p>Processing time: ${results.processing_time?.total_time_ms || 'N/A'}ms | 
               Quality: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%</p>
            <div class="powered-by">
                🚀 Powered by VeriDiff
            </div>
        </div>
    </div>

    <script>
        // Synchronized scrolling for downloaded HTML report
        let isScrolling = false;
        
        document.addEventListener('DOMContentLoaded', function() {
            const leftPanel = document.getElementById('leftPanel');
            const rightPanel = document.getElementById('rightPanel');
            
            if (leftPanel && rightPanel) {
                leftPanel.addEventListener('scroll', function() {
                    if (isScrolling) return;
                    isScrolling = true;
                    rightPanel.scrollTop = leftPanel.scrollTop;
                    setTimeout(() => { isScrolling = false; }, 10);
                });
                
                rightPanel.addEventListener('scroll', function() {
                    if (isScrolling) return;
                    isScrolling = true;
                    leftPanel.scrollTop = rightPanel.scrollTop;
                    setTimeout(() => { isScrolling = false; }, 10);
                });
            }
        });
        
        // Navigation functions
        function scrollToTop() {
            const leftPanel = document.getElementById('leftPanel');
            const rightPanel = document.getElementById('rightPanel');
            if (leftPanel) leftPanel.scrollTop = 0;
            if (rightPanel) rightPanel.scrollTop = 0;
        }
        
        function scrollDown() {
            const leftPanel = document.getElementById('leftPanel');
            const rightPanel = document.getElementById('rightPanel');
            if (leftPanel && rightPanel) {
                const currentScroll = leftPanel.scrollTop;
                leftPanel.scrollTop = currentScroll + 200;
                rightPanel.scrollTop = currentScroll + 200;
            }
        }
        
        function scrollToBottom() {
            const leftPanel = document.getElementById('leftPanel');
            const rightPanel = document.getElementById('rightPanel');
            if (leftPanel && rightPanel) {
                const maxScroll = leftPanel.scrollHeight - leftPanel.clientHeight;
                leftPanel.scrollTop = maxScroll;
                rightPanel.scrollTop = maxScroll;
            }
        }
    </script>
</body>
</html>`;
  };

  const generateCSVData = () => {
    const headers = ['Page', 'Paragraph', 'Change_Type', 'Original_Text', 'New_Text', 'Character_Count', 'File_Source'];
    const rows = [headers];

    (results.text_changes || []).forEach(change => {
      rows.push([
        change.page,
        change.paragraph,
        change.type,
        change.type === 'modified' ? change.old_text : change.text,
        change.type === 'modified' ? change.new_text : '',
        change.char_count || change.char_count_old || 0,
        change.file
      ]);
    });

    rows.push(['']);
    rows.push(['# Generated by VeriDiff - Professional File Comparison Tool']);
    rows.push([`# Report generated on ${new Date().toLocaleString()}`]);

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  const generateDetailedReport = () => {
    const timestamp = new Date().toLocaleString();
    const line = '='.repeat(80);
    
    return `${line}
PDF DOCUMENT COMPARISON REPORT
Generated: ${timestamp}
${line}

FILE INFORMATION:
• File 1: ${file1Name || 'Document 1'}
• File 2: ${file2Name || 'Document 2'}

DOCUMENT STATISTICS:
• File 1: ${results.file1_metadata?.totalPages || 0} pages, ${results.file1_metadata?.totalWords || 0} words
• File 2: ${results.file2_metadata?.totalPages || 0} pages, ${results.file2_metadata?.totalWords || 0} words
• Total Pages Compared: ${results.total_pages || 0}

COMPARISON SUMMARY:
• Overall Similarity: ${results.similarity_score || 0}%
• Total Differences Found: ${results.differences_found || 0}
• Total Matches Found: ${results.matches_found || 0}
• Pages with Changes: ${results.page_differences?.length || 0}

CHANGE BREAKDOWN:
• Added Content: ${results.added_count || 0} items
• Removed Content: ${results.removed_count || 0} items
• Modified Content: ${results.modified_count || 0} items

WORD COUNT ANALYSIS:
• File 1 Total Words: ${results.word_changes?.file1_words || 0}
• File 2 Total Words: ${results.word_changes?.file2_words || 0}
• Word Difference: ${results.word_changes?.word_difference || 0}
• Word Change Percentage: ${results.word_changes?.word_change_percentage || 0}%

${line}
DETAILED CHANGES BY PAGE:
${line}

${results.page_differences?.map(page => `
PAGE ${page.page_number} - ${page.changes_count} Change${page.changes_count > 1 ? 's' : ''}:
${'-'.repeat(40)}
${results.text_changes
  ?.filter(change => change.page === page.page_number)
  ?.map((change, index) => {
    let changeText = `${index + 1}. [${change.type.toUpperCase()}] `;
    if (change.type === 'modified') {
      changeText += `Paragraph ${change.paragraph}:\n   OLD: "${change.old_text}"\n   NEW: "${change.new_text}"`;
    } else {
      changeText += `Paragraph ${change.paragraph}: "${change.text}"`;
    }
    return changeText;
  }).join('\n\n') || 'No detailed changes available'}
`).join('\n') || 'No page differences found'}

${line}
PROCESSING INFORMATION:
• Comparison Type: ${results.comparison_type || 'PDF Document'}
• Processing Method: ${results.processing_note || 'Standard PDF comparison'}
• Processing Time: ${results.processing_time?.total_time_ms || 'N/A'}ms
• Quality Rate: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%

${line}
TECHNICAL DETAILS:
• File 1 Success Rate: ${Math.round((results.quality_metrics?.file1_success_rate || 1) * 100)}%
• File 2 Success Rate: ${Math.round((results.quality_metrics?.file2_success_rate || 1) * 100)}%
• Comparison Options: ${JSON.stringify(options, null, 2)}

${line}
🚀 POWERED BY VERIDIFF
Professional File Comparison Tool
${line}
END OF REPORT
${line}`;
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadComparisonData = async (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    try {
      setIsGeneratingDownload(true);
      setDownloadDropdownOpen(false);
      
      switch (format) {
        case 'html':
          const htmlContent = generateHTMLReport();
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          downloadBlob(htmlBlob, `PDF_Comparison_Report_${timestamp}.html`);
          break;

        case 'excel':
          const csvContent = generateCSVData();
          const csvBlob = new Blob([csvContent], { type: 'text/csv' });
          downloadBlob(csvBlob, `PDF_Comparison_Data_${timestamp}.csv`);
          break;

        case 'csv':
          const csvData = generateCSVData();
          const csvDataBlob = new Blob([csvData], { type: 'text/csv' });
          downloadBlob(csvDataBlob, `PDF_Changes_${timestamp}.csv`);
          break;

        case 'text':
        default:
          const textContent = generateDetailedReport();
          const textBlob = new Blob([textContent], { type: 'text/plain' });
          downloadBlob(textBlob, `PDF_Comparison_Report_${timestamp}.txt`);
          break;
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to generate ${format.toUpperCase()} export: ${error.message}`);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  // ALL OTHER EXISTING FUNCTIONS REMAIN EXACTLY THE SAME
  const togglePageExpansion = (pageNumber) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageNumber)) {
      newExpanded.delete(pageNumber);
    } else {
      newExpanded.add(pageNumber);
    }
    setExpandedPages(newExpanded);
  };

  const toggleAllPages = () => {
    if (expandedPages.size === results.page_differences?.length) {
      setExpandedPages(new Set());
    } else {
      const allPages = new Set(results.page_differences?.map(p => p.page_number) || []);
      setExpandedPages(allPages);
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return '#22c55e';
      case 'removed': return '#ef4444';
      case 'modified': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getChangeBackground = (type) => {
    switch (type) {
      case 'added': return '#dcfce7';
      case 'removed': return '#fee2e2';
      case 'modified': return '#fef3c7';
      default: return '#f3f4f6';
    }
  };

  // ENHANCED: Excel-Style Dashboard Component
  const ExcelStyleDashboard = () => {
    // Calculate metrics
    const totalChanges = results.differences_found || 0;
    const differencesFound = results.differences_found || 0;
    const perfectMatches = results.matches_found || 0;
    const similarityScore = results.similarity_score || 0;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        border: '2px solid #22c55e',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        {/* Excel-Style Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '2.5rem' }}>📄</div>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Comparison Complete!
            </h2>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '12px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#059669',
            border: '1px solid #d1fae5'
          }}>
            <span style={{ fontWeight: '600' }}>{file1Name || 'Document 1'}</span>
            <span style={{ color: '#6b7280' }}>vs</span>
            <span style={{ fontWeight: '600' }}>{file2Name || 'Document 2'}</span>
            <span style={{
              background: '#3b82f6',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginLeft: '8px'
            }}>
              Preview Mode
            </span>
          </div>
        </div>

        {/* Excel-Style Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          {/* Total Changes Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            border: '2px solid #bfdbfe',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📊</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2563eb',
              marginBottom: '5px'
            }}>
              {totalChanges}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#2563eb',
              fontWeight: '600'
            }}>
              Total Changes
            </div>
          </div>

          {/* Differences Found Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            border: '2px solid #fed7aa',
            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.15)'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⚠️</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#ea580c',
              marginBottom: '5px'
            }}>
              {differencesFound}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#ea580c',
              fontWeight: '600'
            }}>
              Differences Found
            </div>
          </div>

          {/* Perfect Matches Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            border: '2px solid #bbf7d0',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>✨</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '5px'
            }}>
              {perfectMatches}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#059669',
              fontWeight: '600'
            }}>
              Perfect Matches
            </div>
          </div>

          {/* Similarity Score Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
            border: '2px solid #fde68a',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎯</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#d97706',
              marginBottom: '5px'
            }}>
              {similarityScore}%
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#d97706',
              fontWeight: '600'
            }}>
              Match Rate
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '8px',
          padding: '15px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '0.9rem',
          color: '#059669'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: '600' }}>📄</span>
            <span>{results.total_pages || 0} Pages</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: '600' }}>⏱️</span>
            <span>{results.processing_time?.total_time_ms || 'N/A'}ms</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: '600' }}>✅</span>
            <span>{Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}% Quality</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: '600' }}>📝</span>
            <span>{(results.word_changes?.word_change_percentage || 0)}% Word Change</span>
          </div>
        </div>
      </div>
    );
  };

  // ENHANCED: Advanced Options Component (extracted to be always visible)
  const AdvancedOptionsSection = () => {
    const allChanges = results.text_changes || [];
    
    // Apply filtering logic
    let filteredChanges = allChanges;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filteredChanges = filteredChanges.filter(change => {
        const searchLower = searchTerm.toLowerCase();
        return (
          change.text?.toLowerCase().includes(searchLower) ||
          change.old_text?.toLowerCase().includes(searchLower) ||
          change.new_text?.toLowerCase().includes(searchLower) ||
          change.type?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply filter mode
    if (filterMode === 'changes') {
      filteredChanges = filteredChanges.filter(change => change.type !== 'unchanged');
    } else if (filterMode === 'matches') {
      filteredChanges = filteredChanges.filter(change => change.type === 'unchanged');
    }

    return (
      <div 
        ref={advancedOptionsRef}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              margin: 0,
              color: '#1f2937'
            }}>
              Advanced Options
            </h3>
          </div>
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                background: viewMode === 'summary' ? '#f3f4f6' : 'transparent',
                color: viewMode === 'summary' ? '#374151' : '#6b7280',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                border: viewMode === 'summary' ? '1px solid #d1d5db' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ☰ Summary
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              style={{
                background: viewMode === 'sideBySide' ? '#2563eb' : 'transparent',
                color: viewMode === 'sideBySide' ? 'white' : '#6b7280',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                border: viewMode === 'sideBySide' ? 'none' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📄 Side-by-Side
            </button>
          </div>
        </div>

        {/* Controls Row 1 - Filter and Search */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {/* Filter Results Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              whiteSpace: 'nowrap'
            }}>
              🗂️ Filter Results:
            </label>
            <select
              ref={filterSelectRef}
              value={filterMode}
              onChange={handleFilterChange}
              style={{
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.9rem',
                minWidth: '180px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Show All Records</option>
              <option value="changes">Only Changes</option>
              <option value="matches">Only Matches</option>
            </select>
          </div>
          
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '400px' }}>
            <label style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151',
              whiteSpace: 'nowrap'
            }}>
              🔍 Search Records:
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search changes, content..."
              style={{
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.9rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Results Counter */}
          <div style={{
            background: '#f8fafc',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#374151',
            border: '1px solid #e5e7eb',
            whiteSpace: 'nowrap'
          }}>
            <strong>{filteredChanges.length}</strong> of <strong>{allChanges.length}</strong> changes
          </div>
        </div>
        
        {/* Controls Row 2 - Checkboxes */}
        <div style={{
          display: 'flex',
          gap: '25px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input 
              ref={focusModeRef}
              type="checkbox" 
              checked={focusMode}
              onChange={handleFocusModeChange}
              style={{ transform: 'scale(1.1)', outline: 'none' }} 
            />
            Focus Mode (highlight changes only)
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input 
              ref={groupSimilarRef}
              type="checkbox" 
              checked={groupSimilar}
              onChange={handleGroupSimilarChange}
              style={{ transform: 'scale(1.1)', outline: 'none' }} 
            />
            Group Similar Fields
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}>
            <input 
              ref={ignoreWhitespaceRef}
              type="checkbox" 
              checked={ignoreWhitespace}
              onChange={handleIgnoreWhitespaceChange}
              style={{ transform: 'scale(1.1)', outline: 'none' }} 
            />
            Ignore Whitespace
          </label>
        </div>

        {/* Active Filters Display */}
        {(filterMode !== 'all' || searchTerm || focusMode || !groupSimilar || ignoreWhitespace) && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0369a1' }}>
                🎯 Active Filters:
              </span>
              <button
                onClick={handleClearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0369a1',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  outline: 'none'
                }}
              >
                Clear All
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filterMode !== 'all' && (
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  Filter: {filterMode === 'changes' ? 'Only Changes' : 'Only Matches'}
                </span>
              )}
              {searchTerm && (
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  Search: "{searchTerm}"
                </span>
              )}
              {focusMode && (
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  Focus Mode
                </span>
              )}
              {!groupSimilar && (
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  No Grouping
                </span>
              )}
              {ignoreWhitespace && (
                <span style={{
                  background: '#0369a1',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  Ignore Whitespace
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ENHANCED: Progressive Display Component for Summary View Only
  const SummaryChangesView = () => {
    const allChanges = results.text_changes || [];
    
    // Apply filtering logic (same as AdvancedOptionsSection)
    let filteredChanges = allChanges;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filteredChanges = filteredChanges.filter(change => {
        const searchLower = searchTerm.toLowerCase();
        return (
          change.text?.toLowerCase().includes(searchLower) ||
          change.old_text?.toLowerCase().includes(searchLower) ||
          change.new_text?.toLowerCase().includes(searchLower) ||
          change.type?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply filter mode
    if (filterMode === 'changes') {
      filteredChanges = filteredChanges.filter(change => change.type !== 'unchanged');
    } else if (filterMode === 'matches') {
      filteredChanges = filteredChanges.filter(change => change.type === 'unchanged');
    }
    
    const previewChanges = session ? filteredChanges : filteredChanges.slice(0, 3);
    const remainingCount = session ? 0 : Math.max(0, allChanges.length - 3);

    if (allChanges.length === 0) {
      return (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#166534',
            margin: '0 0 10px 0'
          }}>
            Perfect Match!
          </h3>
          <p style={{
            margin: 0,
            color: '#166534',
            fontSize: '1rem'
          }}>
            No differences were found between the PDF documents. The content appears to be identical.
          </p>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '25px' }}>
        {/* Changes Display */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            margin: '0 0 20px 0',
            color: '#1f2937'
          }}>
            📋 Changes {session ? `(${filteredChanges.length} total)` : `Preview (${allChanges.length} total)`}
          </h3>

          {/* Show filtered changes */}
          <div style={{ marginBottom: '20px' }}>
            {previewChanges.length > 0 ? previewChanges.map((change, index) => (
              <div
                key={index}
                style={{
                  background: getChangeBackground(change.type),
                  border: `1px solid ${getChangeColor(change.type)}`,
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    background: getChangeColor(change.type),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {change.type}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    Page {change.page} • Paragraph {change.paragraph}
                  </span>
                </div>

                {change.type === 'modified' ? (
                  <div style={{ fontSize: '0.9rem' }}>
                    <div style={{
                      background: '#fee2e2',
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      border: '1px solid #fca5a5',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: '#dc2626' }}>Before:</strong> "{change.old_text?.substring(0, 120)}{change.old_text?.length > 120 ? '...' : ''}"
                    </div>
                    <div style={{
                      background: '#dcfce7',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #a7f3d0',
                      fontSize: '0.85rem'
                    }}>
                      <strong style={{ color: '#166534' }}>After:</strong> "{change.new_text?.substring(0, 120)}{change.new_text?.length > 120 ? '...' : ''}"
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    color: '#374151'
                  }}>
                    "{change.text?.substring(0, 150)}{change.text?.length > 150 ? '...' : ''}"
                  </div>
                )}
              </div>
            )) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
                <h4 style={{ margin: '0 0 5px 0', color: '#374151' }}>No Results Found</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>

          {/* Paywall for remaining changes */}
          {remainingCount > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🔓</div>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                {remainingCount} More Changes Available
              </h4>
              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                marginBottom: '15px',
                lineHeight: '1.4'
              }}>
                Sign in to see all {allChanges.length} changes with full side-by-side comparison.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.location.href = '/auth/signup'}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📝 Sign Up Free
                </button>
                <button
                  onClick={() => window.location.href = '/auth/signin'}
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔑 Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // COMPACT: Subtle Login CTA Component
  const CompactLoginCTA = () => (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '15px',
      textAlign: 'center',
      margin: '20px 0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '1.2rem' }}>🔒</div>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          Sign in to Download Professional Reports
        </h4>
      </div>
      
      <p style={{
        color: '#6b7280',
        fontSize: '0.85rem',
        marginBottom: '15px',
        lineHeight: '1.4'
      }}>
        Get beautifully formatted HTML reports with full side-by-side comparison view
      </p>

      {/* Compact Preview */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '6px',
        padding: '8px',
        margin: '10px 0',
        maxWidth: '300px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: '600',
          color: '#2563eb',
          marginBottom: '6px'
        }}>
          📑 HTML Report Preview
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          marginBottom: '6px'
        }}>
          <div style={{
            background: 'white',
            padding: '3px',
            borderRadius: '3px',
            fontSize: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#f59e0b' }}>86%</div>
            <div style={{ color: '#6b7280', fontSize: '0.5rem' }}>Similarity</div>
          </div>
          <div style={{
            background: 'white',
            padding: '3px',
            borderRadius: '3px',
            fontSize: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#2563eb' }}>2</div>
            <div style={{ color: '#6b7280', fontSize: '0.5rem' }}>Pages</div>
          </div>
          <div style={{
            background: 'white',
            padding: '3px',
            borderRadius: '3px',
            fontSize: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#7c3aed' }}>11</div>
            <div style={{ color: '#6b7280', fontSize: '0.5rem' }}>Changes</div>
          </div>
          <div style={{
            background: 'white',
            padding: '3px',
            borderRadius: '3px',
            fontSize: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#059669' }}>0%</div>
            <div style={{ color: '#6b7280', fontSize: '0.5rem' }}>Word Δ</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3px',
          fontSize: '0.5rem'
        }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '2px',
            padding: '4px',
            background: 'white'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '1px 3px',
              borderRadius: '2px',
              marginBottom: '2px',
              fontWeight: '600',
              fontSize: '0.45rem'
            }}>
              📄 Doc 1
            </div>
            <div style={{ lineHeight: '1.2', color: '#374151' }}>
              Invoice #INV-001<br/>
              <span style={{
                background: '#fef3c7',
                padding: '0px 2px',
                borderRadius: '1px',
                fontSize: '0.4rem'
              }}>
                Date: 12/15/2024
              </span>
            </div>
          </div>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '2px',
            padding: '4px',
            background: 'white'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '1px 3px',
              borderRadius: '2px',
              marginBottom: '2px',
              fontWeight: '600',
              fontSize: '0.45rem'
            }}>
              📄 Doc 2
            </div>
            <div style={{ lineHeight: '1.2', color: '#374151' }}>
              Invoice #INV-002<br/>
              <span style={{
                background: '#fef3c7',
                padding: '0px 2px',
                borderRadius: '1px',
                fontSize: '0.4rem'
              }}>
                Date: 12/20/2024
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/auth/signup'}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📝 Sign Up Free
        </button>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          style={{
            background: 'white',
            color: '#2563eb',
            border: '1px solid #2563eb',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔑 Sign In
        </button>
      </div>
    </div>
  );

  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        No PDF comparison results to display.
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginTop: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header Section with View Toggle and Downloads */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📑 PDF Comparison Results
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle Buttons */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                background: viewMode === 'summary' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'summary' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'summary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📊 Summary View
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              style={{
                background: viewMode === 'sideBySide' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'sideBySide' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'sideBySide' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📄 Side-by-Side View
            </button>
          </div>

          {/* CONDITIONAL DOWNLOAD SECTION */}
          {session ? (
            /* AUTHENTICATED: Show Download Dropdown */
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                disabled={isGeneratingDownload}
                style={{
                  background: isGeneratingDownload ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isGeneratingDownload ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isGeneratingDownload ? '⏳' : '📥'} 
                {isGeneratingDownload ? 'Generating...' : 'Download Report'} ⌄
              </button>

              {downloadDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '300px',
                  marginTop: '4px'
                }}>
                  {downloadOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => downloadComparisonData(option.format)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '12px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* NOT AUTHENTICATED: Show Login Button */
            <button
              onClick={() => window.location.href = '/auth/signin'}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔒 Sign In to Download
            </button>
          )}
        </div>
      </div>

      {/* ENHANCED CONTENT WITH EXCEL-STYLE DASHBOARD */}
      
      {/* Excel-Style Dashboard - ALWAYS VISIBLE */}
      <ExcelStyleDashboard />

      {/* Advanced Options - ALWAYS VISIBLE */}
      <AdvancedOptionsSection />

      {/* VIEW-SPECIFIC CONTENT */}
      {viewMode === 'summary' ? (
        /* SUMMARY VIEW: Show filtered changes */
        <>
          {session ? (
            /* AUTHENTICATED: Show full expandable pages or summary changes */
            results.page_differences && results.page_differences.length > 0 ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: 0,
                    color: '#1f2937'
                  }}>
                    📋 Page-by-Page Changes ({results.page_differences.length} pages affected)
                  </h3>
                  
                  <button
                    onClick={toggleAllPages}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                  >
                    {expandedPages.size === results.page_differences.length ? '📕 Collapse All' : '📖 Expand All'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {results.page_differences.map((page, index) => (
                    <div
                      key={page.page_number}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Page Header */}
                      <div
                        onClick={() => togglePageExpansion(page.page_number)}
                        style={{
                          background: '#f8fafc',
                          padding: '15px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: expandedPages.has(page.page_number) ? '1px solid #e5e7eb' : 'none'
                        }}
                      >
                        <div>
                          <h4 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            📄 Page {page.page_number}
                          </h4>
                          <p style={{
                            margin: '5px 0 0 0',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            {page.summary} • {page.page1_paragraphs || 0} → {page.page2_paragraphs || 0} paragraphs
                          </p>
                        </div>
                        
                        <div style={{
                          fontSize: '1.2rem',
                          transform: expandedPages.has(page.page_number) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}>
                          ⌄
                        </div>
                      </div>

                      {/* Page Details */}
                      {expandedPages.has(page.page_number) && (
                        <div style={{ padding: '20px' }}>
                          {results.text_changes
                            ?.filter(change => change.page === page.page_number)
                            ?.map((change, changeIndex) => (
                              <div
                                key={changeIndex}
                                style={{
                                  background: getChangeBackground(change.type),
                                  border: `1px solid ${getChangeColor(change.type)}`,
                                  borderRadius: '6px',
                                  padding: '15px',
                                  marginBottom: changeIndex < results.text_changes.filter(c => c.page === page.page_number).length - 1 ? '12px' : '0'
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '10px'
                                }}>
                                  <span style={{
                                    background: getChangeColor(change.type),
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                  }}>
                                    {change.type}
                                  </span>
                                  <span style={{
                                    fontSize: '0.9rem',
                                    color: '#6b7280'
                                  }}>
                                    Paragraph {change.paragraph}
                                  </span>
                                </div>

                                {change.type === 'modified' ? (
                                  <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{
                                      background: '#fee2e2',
                                      padding: '10px',
                                      borderRadius: '4px',
                                      marginBottom: '8px',
                                      border: '1px solid #fca5a5'
                                    }}>
                                      <strong style={{ color: '#dc2626' }}>❌ Original:</strong>
                                      <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                        "{change.old_text}"
                                      </div>
                                    </div>
                                    <div style={{
                                      background: '#dcfce7',
                                      padding: '10px',
                                      borderRadius: '4px',
                                      border: '1px solid #a7f3d0'
                                    }}>
                                      <strong style={{ color: '#166534' }}>✅ New:</strong>
                                      <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                        "{change.new_text}"
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{
                                    fontSize: '0.9rem',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.4',
                                    color: '#374151'
                                  }}>
                                    "{change.text}"
                                  </div>
                                )}
                              </div>
                            )) || (
                              <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}>
                                No detailed changes available for this page
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#166534',
                  margin: '0 0 10px 0'
                }}>
                  Perfect Match!
                </h3>
                <p style={{
                  margin: 0,
                  color: '#166534',
                  fontSize: '1rem'
                }}>
                  No differences were found between the PDF documents. The content appears to be identical.
                </p>
              </div>
            )
          ) : (
            /* NOT AUTHENTICATED: Show progressive preview */
            <ProgressiveChangesPreview />
          )}

          {/* Processing Information - UNCHANGED for authenticated users */}
          {session && (
            <>
              {/* Word Count Analysis */}
              {results.word_changes && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginTop: '25px'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 15px 0',
                    color: '#1f2937'
                  }}>
                    📊 Word Count Analysis
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <div>
                      <strong>File 1:</strong> {results.word_changes.file1_words} words
                    </div>
                    <div>
                      <strong>File 2:</strong> {results.word_changes.file2_words} words
                    </div>
                    <div>
                      <strong>Difference:</strong> {results.word_changes.word_difference} words
                    </div>
                    <div>
                      <strong>Change:</strong> {results.word_changes.word_change_percentage}%
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Information */}
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px',
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>
                <strong>Processing Info:</strong> {results.processing_note || 'PDF comparison completed'} •
                Quality: {Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}% •
                Time: {results.processing_time?.total_time_ms || 'N/A'}ms •
                Type: {results.comparison_type || 'PDF Document'} •
                🚀 <strong>Powered by VeriDiff</strong>
              </div>
            </>
          )}
        </>
      ) : (
        /* SIDE-BY-SIDE VIEW: Just the side-by-side component (dashboard already shown above) */
        <div style={{ marginTop: '20px' }}>
          <PDFSideBySideView 
            results={results} 
            file1Name={file1Name} 
            file2Name={file2Name} 
          />
        </div>
      )}
    </div>
  );
};

export default PdfResults;
