// components/PdfResults.js - Enhanced with View-Specific Downloads
import { useState } from 'react';
import PDFSideBySideView from '../components/PDFSideBySideView';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'sideBySide'
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  // Enhanced download options - now view-aware
  const getDownloadOptions = () => {
    const baseOptions = [
      {
        id: 'html-current',
        label: `📄 ${viewMode === 'summary' ? 'Summary' : 'Side-by-Side'} HTML Report`,
        description: `Professional web page with ${viewMode === 'summary' ? 'detailed summary view' : 'side-by-side comparison'}`,
        format: 'html',
        viewType: viewMode
      },
      {
        id: 'csv-current',
        label: `📊 ${viewMode === 'summary' ? 'Summary' : 'Side-by-Side'} CSV Export`,
        description: `Structured data optimized for ${viewMode === 'summary' ? 'summary analysis' : 'side-by-side comparison'}`,
        format: 'csv',
        viewType: viewMode
      }
    ];

    // Add "other view" options
    const otherView = viewMode === 'summary' ? 'sideBySide' : 'summary';
    const otherViewLabel = viewMode === 'summary' ? 'Side-by-Side' : 'Summary';
    
    baseOptions.push(
      {
        id: 'html-other',
        label: `📄 ${otherViewLabel} HTML Report`,
        description: `Alternative view: ${viewMode === 'summary' ? 'side-by-side comparison' : 'detailed summary view'}`,
        format: 'html',
        viewType: otherView
      },
      {
        id: 'text-report',
        label: '📝 Complete Text Report',
        description: 'Comprehensive text-based report with all details',
        format: 'text',
        viewType: 'complete'
      }
    );

    return baseOptions;
  };

  // Enhanced HTML report - now view-aware
  const generateHTMLReport = (viewType = 'summary') => {
    const timestamp = new Date().toLocaleString();
    
    // Generate view-specific content
    const generateViewContent = () => {
      if (viewType === 'sideBySide') {
        return `
        <div class="side-by-side-container">
          <h2 style="text-align: center; margin-bottom: 30px; color: #1f2937;">
            📄 Side-by-Side Document Comparison
          </h2>
          
          <div class="legend" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; font-size: 0.9rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #dcfce7; border: 1px solid #166534; border-radius: 3px;"></div>
              <span>Added Content</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #fee2e2; border: 1px solid #dc2626; border-radius: 3px;"></div>
              <span>Removed Content</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; background: #fef3c7; border: 1px solid #d97706; border-radius: 3px;"></div>
              <span>Modified Content</span>
            </div>
          </div>

          <div class="side-by-side">
            <div class="document-panel">
              <div class="document-header">📄 ${file1Name || 'Document 1'}</div>
              <div class="document-content">
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
              <div class="document-content">
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
        </div>`;
      } else {
        // Summary view content
        return `
        <div class="summary-view-container">
          <h2 style="text-align: center; margin-bottom: 30px; color: #1f2937;">
            📊 Summary View Analysis
          </h2>
          
          <div class="changes-summary" style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin-bottom: 20px;">📋 Detailed Changes List</h3>
            ${(results.text_changes || []).map((change, index) => `
              <div class="change-item" style="background: ${change.type === 'added' ? '#dcfce7' : change.type === 'removed' ? '#fee2e2' : change.type === 'modified' ? '#fef3c7' : '#f3f4f6'}; 
                                                 border: 1px solid ${change.type === 'added' ? '#166534' : change.type === 'removed' ? '#dc2626' : change.type === 'modified' ? '#d97706' : '#d1d5db'}; 
                                                 margin-bottom: 15px; padding: 15px; border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">
                  ${change.type === 'added' ? '➕' : change.type === 'removed' ? '➖' : change.type === 'modified' ? '✏️' : '📝'} 
                  Page ${change.page}, Paragraph ${change.paragraph} - ${change.type.toUpperCase()}
                </div>
                ${change.type === 'modified' ? `
                  <div style="margin-bottom: 8px;">
                    <strong style="color: #dc2626;">Original:</strong> "${change.old_text}"
                  </div>
                  <div>
                    <strong style="color: #166534;">New:</strong> "${change.new_text}"
                  </div>
                ` : `
                  <div style="font-family: monospace;">"${change.text || change.old_text || change.new_text}"</div>
                `}
              </div>
            `).join('')}
          </div>
        </div>`;
      }
    };
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Comparison Report (${viewType === 'sideBySide' ? 'Side-by-Side' : 'Summary'}) - ${file1Name} vs ${file2Name}</title>
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📑 PDF Comparison Report (${viewType === 'sideBySide' ? 'Side-by-Side View' : 'Summary View'})</h1>
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

        ${generateViewContent()}

        <div class="footer">
            <p>Generated by VeriDiff - Professional File Comparison Tool</p>
            <p>View Type: ${viewType === 'sideBySide' ? 'Side-by-Side Comparison' : 'Summary Analysis'} | 
               Processing time: ${results.processing_time?.total_time_ms || 'N/A'}ms | 
               Quality: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%</p>
            <div class="powered-by">
                🚀 Powered by VeriDiff
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  // Enhanced CSV export - now view-aware
  const generateCSVData = (viewType = 'summary') => {
    if (viewType === 'sideBySide') {
      // Side-by-side specific CSV format
      const headers = ['Page', 'Paragraph', 'Document_1_Content', 'Document_2_Content', 'Change_Type', 'Change_Details'];
      const rows = [headers];

      // Get all pages and paragraphs for side-by-side comparison
      const maxPages = Math.max(
        (results.file1_pages || []).length,
        (results.file2_pages || []).length
      );

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page1 = (results.file1_pages || []).find(p => p.page_number === pageNum);
        const page2 = (results.file2_pages || []).find(p => p.page_number === pageNum);
        
        const maxParas = Math.max(
          (page1?.paragraphs || []).length,
          (page2?.paragraphs || []).length
        );

        for (let paraIndex = 0; paraIndex < maxParas; paraIndex++) {
          const para1 = page1?.paragraphs?.[paraIndex]?.text || '';
          const para2 = page2?.paragraphs?.[paraIndex]?.text || '';
          
          const change = (results.text_changes || []).find(c => 
            c.page === pageNum && c.paragraph === paraIndex
          );
          
          const changeType = change?.type || 'unchanged';
          const changeDetails = change ? 
            (change.type === 'modified' ? `Old: "${change.old_text}" | New: "${change.new_text}"` : 
             `"${change.text || change.old_text || change.new_text}"`) : '';

          rows.push([
            pageNum,
            paraIndex + 1,
            para1,
            para2,
            changeType,
            changeDetails
          ]);
        }
      }

      // Add metadata
      rows.push(['']);
      rows.push(['# Side-by-Side Comparison Export']);
      rows.push([`# Generated by VeriDiff on ${new Date().toLocaleString()}`]);
      rows.push([`# Files: ${file1Name || 'Document 1'} vs ${file2Name || 'Document 2'}`]);

      return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    } else {
      // Summary view CSV format (existing format)
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

      // Add metadata
      rows.push(['']);
      rows.push(['# Summary View Export']);
      rows.push([`# Generated by VeriDiff on ${new Date().toLocaleString()}`]);
      rows.push([`# Files: ${file1Name || 'Document 1'} vs ${file2Name || 'Document 2'}`]);

      return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    }
  };

  // Enhanced comprehensive text report (unchanged)
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

  // Helper function to trigger download (unchanged)
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

  // Enhanced download function - now view-aware
  const downloadComparisonData = async (format, viewType = viewMode) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const viewLabel = viewType === 'sideBySide' ? 'SideBySide' : viewType === 'summary' ? 'Summary' : 'Complete';
    
    try {
      setIsGeneratingDownload(true);
      setDownloadDropdownOpen(false);
      
      switch (format) {
        case 'html':
          const htmlContent = generateHTMLReport(viewType);
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          downloadBlob(htmlBlob, `PDF_Comparison_${viewLabel}_${timestamp}.html`);
          break;

        case 'csv':
          const csvData = generateCSVData(viewType);
          const csvDataBlob = new Blob([csvData], { type: 'text/csv' });
          downloadBlob(csvDataBlob, `PDF_Comparison_${viewLabel}_${timestamp}.csv`);
          break;

        case 'text':
        default:
          const textContent = generateDetailedReport();
          const textBlob = new Blob([textContent], { type: 'text/plain' });
          downloadBlob(textBlob, `PDF_Comparison_Complete_Report_${timestamp}.txt`);
          break;
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to generate ${format.toUpperCase()} export: ${error.message}`);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  // All other existing functions remain unchanged...
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

          {/* Enhanced Download Dropdown */}
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
              {isGeneratingDownload ? 'Generating...' : `Download ${viewMode === 'summary' ? 'Summary' : 'Side-by-Side'}`} ⌄
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
                minWidth: '320px',
                marginTop: '4px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#374151',
                  background: '#f8fafc'
                }}>
                  Current View: {viewMode === 'summary' ? '📊 Summary' : '📄 Side-by-Side'}
                </div>
                
                {getDownloadOptions().map(option => (
                  <button
                    key={option.id}
                    onClick={() => downloadComparisonData(option.format, option.viewType)}
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

      {/* Conditional View Rendering - UNCHANGED FROM ORIGINAL */}
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
