// File: utils/downloadResults.js
// Universal download module for all comparison types

import * as XLSX from 'xlsx';

/**
 * Convert comparison results to Excel format
 * Works with results from any comparison type (PDF, Excel, JSON, XML, CSV)
 */
export const downloadResultsAsExcel = (results, filename = 'comparison_results.xlsx') => {
  try {
    if (!results || !results.results || results.results.length === 0) {
      throw new Error('No results to download');
    }

    // Create summary sheet
    const summaryData = [
      ['Comparison Summary', ''],
      ['Total Records', results.total_records],
      ['Matches Found', results.matches_found],
      ['Differences Found', results.differences_found],
      ['Generated On', new Date().toLocaleString()],
      [''], // Empty row
      ['Legend:', ''],
      ['✅ Match', 'Values are identical'],
      ['⚠️ Acceptable', 'Within tolerance range'],
      ['❌ Difference', 'Values differ beyond tolerance']
    ];

    // Create detailed results sheet
    const firstResult = results.results[0];
    const fieldNames = Object.keys(firstResult.fields);
    
    // Headers for detailed sheet
    const detailHeaders = ['ID', ...fieldNames.flatMap(field => [`${field} (File 1)`, `${field} (File 2)`, `${field} Status`])];
    
    // Data rows for detailed sheet
    const detailData = results.results.map(result => {
      const row = [result.ID];
      fieldNames.forEach(fieldName => {
        const field = result.fields[fieldName];
        row.push(
          field.val1,
          field.val2,
          field.status === 'match' ? '✅ Match' : 
          field.status === 'acceptable' ? '⚠️ Acceptable' : '❌ Difference'
        );
      });
      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Add detailed results sheet
    const detailSheet = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData]);
    
    // Style the headers
    const headerRange = XLSX.utils.decode_range(detailSheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!detailSheet[cellAddress]) continue;
      detailSheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EEEEEE" } }
      };
    }
    
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detailed Results');

    // Download the file
    XLSX.writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download results: ${error.message}`);
  }
};

/**
 * Download as CSV (alternative format)
 */
export const downloadResultsAsCSV = (results, filename = 'comparison_results.csv') => {
  try {
    if (!results || !results.results || results.results.length === 0) {
      throw new Error('No results to download');
    }

    const firstResult = results.results[0];
    const fieldNames = Object.keys(firstResult.fields);
    
    // CSV Headers
    const headers = ['ID', ...fieldNames.flatMap(field => [`${field}_File1`, `${field}_File2`, `${field}_Status`])];
    
    // CSV Data
    const csvData = results.results.map(result => {
      const row = [result.ID];
      fieldNames.forEach(fieldName => {
        const field = result.fields[fieldName];
        row.push(field.val1, field.val2, field.status);
      });
      return row;
    });

    // Convert to CSV string
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    return true;
  } catch (error) {
    console.error('CSV download failed:', error);
    throw new Error(`Failed to download CSV: ${error.message}`);
  }
};
