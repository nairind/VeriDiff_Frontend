// components/PdfResults.js - Simplified Enhanced Version
import { useState } from 'react';
import PDFSideBySideView from '../components/PDFSideBySideView';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'sideBySide'
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  // Simplified download options - removed interactive HTML
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

  // ENHANCED: HTML report with synchronized scrolling
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

  // Generate CSV export with VeriDiff branding
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

    // Add VeriDiff branding as comment at the end
    rows.push(['']);
    rows.push(['# Generated by VeriDiff - Professional File Comparison Tool']);
    rows.push([`# Report generated on ${new Date().toLocaleString()}`]);

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  // Generate comprehensive text report with VeriDiff branding
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

  // Helper function to trigger download
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

  // Simplified download function with 4 stable options
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
          // Enhanced CSV format for Excel compatibility
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

  // Toggle page expansion
  const togglePageExpansion = (pageNumber) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageNumber)) {
      newExpanded.delete(pageNumber);
    } else {
      newExpanded.add(pageNumber);
    }
    setExpandedPages(newExpanded);
  };

  // Expand/collapse all pages
  const toggleAllPages = () => {
    if (expandedPages.size === results.page_differences?.length) {
      setExpandedPages(new Set());
    } else {
      const allPages = new Set(results.page_differences?.map(p => p.page_number) || []);
      setExpandedPages(allPages);
    }
  };

  // Get status color for different change types
  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return '#22c55e';
      case 'removed': return '#ef4444';
      case 'modified': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Get status background color
  const getChangeBackground = (type) => {
    switch (type) {
      case 'added': return '#dcfce7';
      case 'removed': return '#fee2e2';
      case 'modified': return '#fef3c7';
      default: return '#f3f4f6';
    }
  };

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

          {/* Simplified Download Dropdown */}
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
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'summary' ? (
        /* SUMMARY VIEW - All existing functionality preserved */
        <>
          {/* File Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
                📄 File 1: {file1Name || 'Document 1'}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                <div>📊 {results.file1_metadata?.totalPages || 0} pages</div>
                <div>📝 {results.file1_metadata?.totalWords || 0} words</div>
                <div>💾 {results.file1_metadata?.fileSize ? `${(results.file1_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
                📄 File 2: {file2Name || 'Document 2'}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                <div>📊 {results.file2_metadata?.totalPages || 0} pages</div>
                <div>📝 {results.file2_metadata?.totalWords || 0} words</div>
                <div>💾 {results.file2_metadata?.fileSize ? `${(results.file2_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          <div style={{
            background: results.similarity_score >= 90 ? '#f0fdf4' : 
                       results.similarity_score >= 70 ? '#fefce8' : '#fef2f2',
            border: `2px solid ${results.similarity_score >= 90 ? '#22c55e' : 
                                 results.similarity_score >= 70 ? '#eab308' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: results.similarity_score >= 90 ? '#166534' : 
                         results.similarity_score >= 70 ? '#a16207' : '#dc2626'
                }}>
                  {results.similarity_score || 0}%
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: results.similarity_score >= 90 ? '#166534' : 
                         results.similarity_score >= 70 ? '#a16207' : '#dc2626',
                  fontWeight: '600'
                }}>
                  Similarity Score
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                  <strong>📊 Comparison Summary:</strong>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  • <strong>{results.differences_found || 0}</strong> differences found<br/>
                  • <strong>{results.matches_found || 0}</strong> matching elements<br/>
                  • <strong>{results.page_differences?.length || 0}</strong> pages with changes<br/>
                  • <strong>{results.total_pages || 0}</strong> total pages compared
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                  <strong>🔄 Change Breakdown:</strong>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  • <span style={{ color: '#22c55e' }}>➕ {results.added_count || 0} added</span><br/>
                  • <span style={{ color: '#ef4444' }}>➖ {results.removed_count || 0} removed</span><br/>
                  • <span style={{ color: '#f59e0b' }}>✏️ {results.modified_count || 0} modified</span><br/>
                  • ⚡ Processed in {results.processing_time?.total_time_ms || 'N/A'}ms
                </div>
              </div>
            </div>
          </div>

          {/* Page Differences Section */}
          {results.page_differences && results.page_differences.length > 0 ? (
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
          )}

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
      ) : (
        /* SIDE-BY-SIDE VIEW - Uses the existing PDFSideBySideView component */
        <PDFSideBySideView 
          results={results} 
          file1Name={file1Name} 
          file2Name={file2Name} 
        />
      )}
    </div>
  );
};

export default PdfResults;
