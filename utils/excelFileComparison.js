import XLSX from 'xlsx';

/**
 * Excel file comparison utility
 * Provides browser-compatible Excel file comparison functionality with support for hidden sheets
 */

/**
 * Reads an Excel file and returns its contents as a workbook
 * @param {File} file - The Excel file to read
 * @returns {Promise<Object>} - A promise that resolves to the workbook object
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        console.log('FileReader onload triggered');
        
        // Use ArrayBuffer for better browser compatibility
        const data = new Uint8Array(event.target.result);
        console.log('Uint8Array created, length:', data.length);
        
        // Use type 'array' which is recommended for browser compatibility
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook successfully read, sheets:', workbook.SheetNames);
        
        resolve(workbook);
      } catch (error) {
        console.error('Excel read error:', error);
        reject(new Error('Failed to read Excel file: ' + error.message));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    // Use readAsArrayBuffer instead of readAsBinaryString for better browser compatibility
    console.log('Reading file as ArrayBuffer...');
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Converts a workbook to a structured object for comparison
 * @param {Object} workbook - The XLSX workbook object
 * @returns {Object} - A structured representation of the workbook
 */
export const workbookToStructured = (workbook) => {
  const result = {};
  
  // Process each worksheet
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    
    // Check if sheet is hidden
    const sheetVisible = worksheet['!hidden'] ? false : true;
    const sheetState = sheetVisible ? 'visible' : 'hidden';
    
    // Convert to JSON with header:1 to get array of arrays format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip empty worksheets
    if (jsonData.length === 0) return;
    
    result[sheetName] = {
      rows: jsonData,
      state: sheetState
    };
  });
  
  return result;
};

/**
 * Compares two Excel workbooks
 * @param {Object} workbook1 - The first workbook
 * @param {Object} workbook2 - The second workbook
 * @returns {Object} - The comparison results
 */
export const compareWorkbooks = (workbook1, workbook2) => {
  const structured1 = workbookToStructured(workbook1);
  const structured2 = workbookToStructured(workbook2);
  
  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
  let recordId = 0;
  
  // Get all sheet names from both workbooks
  const allSheetNames = new Set([
    ...Object.keys(structured1),
    ...Object.keys(structured2)
  ]);
  
  // Compare sheets
  allSheetNames.forEach(sheetName => {
    // Check if sheet exists in both workbooks
    const sheet1Exists = structured1.hasOwnProperty(sheetName);
    const sheet2Exists = structured2.hasOwnProperty(sheetName);
    
    if (!sheet1Exists) {
      // Sheet only exists in workbook 2
      recordId++;
      results.push({
        ID: recordId.toString(),
        COLUMN: `Sheet: ${sheetName}`,
        SOURCE_1_VALUE: '',
        SOURCE_2_VALUE: `Sheet exists (${structured2[sheetName].state})`,
        STATUS: 'difference'
      });
      differencesFound++;
      return;
    }
    
    if (!sheet2Exists) {
      // Sheet only exists in workbook 1
      recordId++;
      results.push({
        ID: recordId.toString(),
        COLUMN: `Sheet: ${sheetName}`,
        SOURCE_1_VALUE: `Sheet exists (${structured1[sheetName].state})`,
        SOURCE_2_VALUE: '',
        STATUS: 'difference'
      });
      differencesFound++;
      return;
    }
    
    // Both workbooks have this sheet, check visibility state
    const sheet1 = structured1[sheetName];
    const sheet2 = structured2[sheetName];
    
    if (sheet1.state !== sheet2.state) {
      // Sheet visibility differs
      recordId++;
      results.push({
        ID: recordId.toString(),
        COLUMN: `Sheet: ${sheetName} (Visibility)`,
        SOURCE_1_VALUE: sheet1.state,
        SOURCE_2_VALUE: sheet2.state,
        STATUS: 'difference'
      });
      differencesFound++;
    }
    
    // Compare sheet content
    const rows1 = sheet1.rows;
    const rows2 = sheet2.rows;
    
    // Get max rows from both sheets
    const maxRows = Math.max(rows1.length, rows2.length);
    
    // Compare each row
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
      const row1Exists = rowIdx < rows1.length;
      const row2Exists = rowIdx < rows2.length;
      
      if (!row1Exists) {
        // Row only exists in sheet 2
        recordId++;
        results.push({
          ID: recordId.toString(),
          COLUMN: `${sheetName}!Row:${rowIdx + 1}`,
          SOURCE_1_VALUE: '',
          SOURCE_2_VALUE: 'Row exists',
          STATUS: 'difference'
        });
        differencesFound++;
        continue;
      }
      
      if (!row2Exists) {
        // Row only exists in sheet 1
        recordId++;
        results.push({
          ID: recordId.toString(),
          COLUMN: `${sheetName}!Row:${rowIdx + 1}`,
          SOURCE_1_VALUE: 'Row exists',
          SOURCE_2_VALUE: '',
          STATUS: 'difference'
        });
        differencesFound++;
        continue;
      }
      
      // Both sheets have this row, compare cells
      const row1 = rows1[rowIdx];
      const row2 = rows2[rowIdx];
      
      // Ensure rows are arrays before proceeding
      if (!Array.isArray(row1) || !Array.isArray(row2)) {
        continue;
      }
      
      // Get max columns from both rows
      const maxCols = Math.max(row1.length, row2.length);
      
      // Compare each cell
      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        // Use column letter for better readability (A, B, C, etc.)
        const colLetter = String.fromCharCode(65 + colIdx); // A=65, B=66, etc.
        const cellAddress = `${colLetter}${rowIdx + 1}`;
        
        const cell1Exists = colIdx < row1.length;
        const cell2Exists = colIdx < row2.length;
        
        if (!cell1Exists) {
          // Cell only exists in sheet 2
          recordId++;
          results.push({
            ID: recordId.toString(),
            COLUMN: `${sheetName}!${cellAddress}`,
            SOURCE_1_VALUE: '',
            SOURCE_2_VALUE: String(row2[colIdx] || ''),
            STATUS: 'difference'
          });
          differencesFound++;
          continue;
        }
        
        if (!cell2Exists) {
          // Cell only exists in sheet 1
          recordId++;
          results.push({
            ID: recordId.toString(),
            COLUMN: `${sheetName}!${cellAddress}`,
            SOURCE_1_VALUE: String(row1[colIdx] || ''),
            SOURCE_2_VALUE: '',
            STATUS: 'difference'
          });
          differencesFound++;
          continue;
        }
        
        // Both rows have this cell, compare values
        const cell1 = row1[colIdx];
        const cell2 = row2[colIdx];
        
        // Handle undefined/null values
        const value1 = cell1 === undefined || cell1 === null ? '' : cell1;
        const value2 = cell2 === undefined || cell2 === null ? '' : cell2;
        
        if (String(value1) !== String(value2)) {
          // Cell values are different
          recordId++;
          results.push({
            ID: recordId.toString(),
            COLUMN: `${sheetName}!${cellAddress}`,
            SOURCE_1_VALUE: String(value1),
            SOURCE_2_VALUE: String(value2),
            STATUS: 'difference'
          });
          differencesFound++;
        } else {
          // Cell values match
          recordId++;
          results.push({
            ID: recordId.toString(),
            COLUMN: `${sheetName}!${cellAddress}`,
            SOURCE_1_VALUE: String(value1),
            SOURCE_2_VALUE: String(value2),
            STATUS: 'match'
          });
          matchesFound++;
        }
      }
    }
  });
  
  return {
    total_records: results.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results: results
  };
};

/**
 * Main function to compare two Excel files
 * @param {File} file1 - The first Excel file
 * @param {File} file2 - The second Excel file
 * @returns {Promise<Object>} - A promise that resolves to the comparison results
 */
export const compareExcelFiles_main = async (file1, file2) => {
  try {
    console.log('Starting Excel comparison with SheetJS...');
    console.log('File 1:', file1.name, 'Size:', file1.size);
    console.log('File 2:', file2.name, 'Size:', file2.size);
    
    // Validate file types
    const validExcelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    const file1Ext = file1.name.substring(file1.name.lastIndexOf('.')).toLowerCase();
    const file2Ext = file2.name.substring(file2.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExcelExtensions.includes(file1Ext) || !validExcelExtensions.includes(file2Ext)) {
      throw new Error('Both files must be Excel files (.xlsx, .xls, .xlsm, or .xlsb)');
    }
    
    console.log('Reading first Excel file...');
    // Read Excel files
    const workbook1 = await readExcelFile(file1);
    console.log('First Excel file read successfully');
    
    console.log('Reading second Excel file...');
    const workbook2 = await readExcelFile(file2);
    console.log('Second Excel file read successfully');
    
    console.log('Comparing workbooks...');
    // Compare workbooks
    const results = compareWorkbooks(workbook1, workbook2);
    console.log('Comparison complete');
    
    return results;
  } catch (error) {
    console.error('Excel comparison error:', error);
    throw new Error(`Excel comparison failed: ${error.message}`);
  }
};
