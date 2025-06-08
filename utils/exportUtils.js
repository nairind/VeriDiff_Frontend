// /utils/exportUtils.js
import * as XLSX from 'xlsx';

export const handleDownloadExcel = async (results, file1, file2, fileType, viewMode, trackAnalytics) => {
  try {
    const timestamp = new Date().toISOString().slice(0,10);
    const filename = `veridiff_comparison_${timestamp}.xlsx`;
    
    if (!results?.results) {
      throw new Error('No comparison results to export');
    }

    const wb = XLSX.utils.book_new();
    
    const mismatchRows = [];
    results.results.forEach((row, index) => {
      const hasDifferences = Object.values(row.fields).some(field => field.status === 'difference');
      if (hasDifferences) {
        mismatchRows.push(index + 2);
      }
    });

    const summaryData = [
      ['VeriDiff Comparison Report'],
      [''],
      ['📋 Report Metadata'],
      ['Generated On', new Date().toLocaleString()],
      ['File 1 Name', file1?.name || 'Unknown'],
      ['File 2 Name', file2?.name || 'Unknown'],
      ['Comparison Mode', `${viewMode === 'unified' ? 'Unified' : 'Side-by-Side'} view${results.toleranceApplied ? ', ' + results.toleranceApplied : ''}`],
      ['File Type', fileType === 'excel' ? 'Excel ↔ Excel' : fileType === 'excel_csv' ? 'Excel ↔ CSV' : 'CSV ↔ CSV'],
      [''],
      ['📊 Comparison Summary'],
      ['Total Records', results.total_records],
      ['Differences Found', results.differences_found],
      ['Perfect Matches', results.total_records - results.differences_found],
      ['Match Rate', `${(((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1)}%`],
      [''],
      ['⚠️ Mismatch Analysis'],
      ['Rows with Mismatches', mismatchRows.length > 0 ? mismatchRows.join(', ') : 'None'],
      [''],
      ['🤖 Auto-Detected Fields', results.autoDetectedFields ? results.autoDetectedFields.join(', ') : 'None']
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    
    if (mismatchRows.length > 0) {
      const hyperlinkCell = summaryWs['B17'];
      if (hyperlinkCell) {
        hyperlinkCell.l = { Target: `#'Detailed Results'!A2`, Tooltip: 'Click to navigate to detailed results' };
      }
    }

    summaryWs['!cols'] = [{ width: 30 }, { width: 50 }];
    summaryWs['!protect'] = { 
      password: '', 
      objects: true, 
      scenarios: true,
      selectLockedCells: true,
      selectUnlockedCells: true
    };
    
    const fieldNames = Object.keys(results.results[0]?.fields || {});
    const detailedHeaders = ['Record ID'];
    
    fieldNames.forEach(field => {
      detailedHeaders.push(`${field} (File 1)`, `${field} (File 2)`, `${field} Status`);
    });

    const detailedData = [detailedHeaders];
    
    results.results.forEach((row, rowIndex) => {
      const rowData = [row.ID];
      
      fieldNames.forEach(fieldName => {
        const fieldData = row.fields[fieldName];
        const status = fieldData.status === 'match' ? '✅' : '❌';
        
        rowData.push(
          fieldData.val1 || '',
          fieldData.val2 || '',
          status
        );
      });
      
      detailedData.push(rowData);
    });

    const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
    
    const range = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: detailedHeaders.length - 1, r: detailedData.length - 1 }
    });
    
    detailedWs['!ref'] = range;
    detailedWs['!autofilter'] = { ref: range };
    
    const colWidths = detailedHeaders.map(() => ({ width: 18 }));
    detailedWs['!cols'] = colWidths;

    const conditionalFormats = [];
    fieldNames.forEach((field, index) => {
      const statusColIndex = 1 + (index + 1) * 3 - 1;
      const statusColLetter = XLSX.utils.encode_col(statusColIndex);
      
      conditionalFormats.push({
        ref: `${statusColLetter}2:${statusColLetter}${detailedData.length}`,
        priority: 1,
        type: 'cellIs',
        operator: 'equal',
        formula: ['"✅"'],
        style: {
          fill: { fgColor: { rgb: 'C6EFCE' } },
          font: { color: { rgb: '006100' } }
        }
      });
      
      conditionalFormats.push({
        ref: `${statusColLetter}2:${statusColLetter}${detailedData.length}`,
        priority: 2,
        type: 'cellIs',
        operator: 'equal',
        formula: ['"❌"'],
        style: {
          fill: { fgColor: { rgb: 'FFC7CE' } },
          font: { color: { rgb: '9C0006' } }
        }
      });
    });

    if (conditionalFormats.length > 0) {
      detailedWs['!conditionalFormatting'] = conditionalFormats;
    }

    detailedWs['!protect'] = { 
      password: '', 
      objects: true, 
      scenarios: true,
      selectLockedCells: true,
      selectUnlockedCells: true,
      autoFilter: false
    };

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.utils.book_append_sheet(wb, detailedWs, 'Detailed Results');

    XLSX.writeFile(wb, filename);
    
    await trackAnalytics('export_completed', {
      export_format: 'excel',
      file_type: fileType
    });
  } catch (error) {
    throw error;
  }
};

export const handleDownloadCSV = async (results, file1, file2, viewMode, downloadResultsAsCSV, trackAnalytics, fileType) => {
  try {
    const timestamp = new Date().toISOString().slice(0,10);
    const filename = `veridiff_comparison_${timestamp}.csv`;
    
    const enhancedResults = {
      ...results,
      file1Name: file1?.name,
      file2Name: file2?.name,
      comparisonMode: `${viewMode === 'unified' ? 'Unified' : 'Side-by-Side'} view${results.toleranceApplied ? ', ' + results.toleranceApplied : ''}`
    };
    
    downloadResultsAsCSV(enhancedResults, filename);
    
    await trackAnalytics('export_completed', {
      export_format: 'csv',
      file_type: fileType
    });
  } catch (error) {
    throw error;
  }
};

export const handleDownloadHTMLDiff = async (results, file1, file2, fileType, viewMode, getFilteredResults, getRecordStatus, getStatusConfig, showCharacterDiff, trackAnalytics) => {
  try {
    if (!results?.results) {
      alert('No comparison results to export');
      return;
    }

    const timestamp = new Date().toISOString().slice(0,10);
    const filename = `veridiff_comparison_${timestamp}.html`;
    
    const filteredResults = getFilteredResults();
    const summary = {
      totalRecords: results.total_records,
      differences: results.differences_found,
      matches: results.total_records - results.differences_found,
      matchRate: (((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1),
      file1Name: file1?.name,
      file2Name: file2?.name,
      comparisonMode: `${viewMode === 'unified' ? 'Unified' : 'Side-by-Side'} view${results.toleranceApplied ? ', ' + results.toleranceApplied : ''}`
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeriDiff Comparison Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .summary-card h3 { font-size: 2rem; margin-bottom: 5px; }
        .comparison-table { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; margin-bottom: 20px; }
        .table-header { background: #f8fafc; padding: 15px; border-bottom: 2px solid #e5e7eb; display: grid; grid-template-columns: 80px 1fr 1fr; gap: 20px; font-weight: 600; }
        .comparison-row { border-bottom: 1px solid #f3f4f6; display: grid; grid-template-columns: 80px 1fr 1fr; gap: 20px; padding: 15px; align-items: center; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
        .file-data { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
        .field-item { background: white; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; }
        .field-label { font-size: 0.75rem; color: #6b7280; margin-bottom: 2px; }
        .field-value { font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9rem; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 VeriDiff Comparison Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>File Comparison: ${fileType === 'excel' ? 'Excel ↔ Excel' : fileType === 'excel_csv' ? 'Excel ↔ CSV' : 'CSV ↔ CSV'}</p>
            <p><strong>File 1:</strong> ${summary.file1Name} | <strong>File 2:</strong> ${summary.file2Name}</p>
            <p><strong>Mode:</strong> ${summary.comparisonMode}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3 style="color: #2563eb;">${summary.totalRecords}</h3>
                <p>Total Records</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #dc2626;">${summary.differences}</h3>
                <p>Differences Found</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #16a34a;">${summary.matches}</h3>
                <p>Perfect Matches</p>
            </div>
            <div class="summary-card">
                <h3 style="color: #d97706;">${summary.matchRate}%</h3>
                <p>Match Rate</p>
            </div>
        </div>

        <div class="comparison-table">
            <div class="table-header">
                <div>Status</div>
                <div style="text-align: center; color: #2563eb;">📄 File 1 (${summary.file1Name || 'Original'})</div>
                <div style="text-align: center; color: #16a34a;">📄 File 2 (${summary.file2Name || 'Comparison'})</div>
            </div>
            
            ${filteredResults.map(row => {
              const status = getRecordStatus(row);
              const config = getStatusConfig(status);
              
              return `
                <div class="comparison-row" style="border-left: 4px solid ${config.border}; background: ${config.bg};">
                    <div style="text-align: center;">
                        <div class="status-badge" style="background: white; color: ${config.color}; border: 1px solid ${config.border};">
                            <span>${config.icon}</span>
                            <span>${config.label}</span>
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => `
                                <div class="field-item">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${fieldData.val1}</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="file-data">
                        <div class="field-grid">
                            ${Object.entries(row.fields).map(([fieldName, fieldData]) => `
                                <div class="field-item">
                                    <div class="field-label">${fieldName}</div>
                                    <div class="field-value">${fieldData.val2}</div>
                                    ${fieldData.difference ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">Δ ${fieldData.difference}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
              `;
            }).join('')}
        </div>

        <div class="footer">
            <p>🔒 Generated by VeriDiff - Professional File Comparison Tool</p>
            <p>All processing performed locally in your browser. No data uploaded to external servers.</p>
            <p>Report contains ${filteredResults.length} records | Generated with character-level diff: ${showCharacterDiff ? 'enabled' : 'disabled'}</p>
        </div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    await trackAnalytics('export_completed', {
      export_format: 'html',
      file_type: fileType
    });
  } catch (error) {
    throw error;
  }
};
