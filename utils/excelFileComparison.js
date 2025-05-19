// utils/excelFileComparison.js (browser-compatible version using xlsx)

import * as XLSX from 'xlsx';

/**
 * Reads an Excel file and returns its contents as a JSON array per sheet
 * @param {File} file - The Excel file to read
 * @returns {Promise<Object>} - Sheet-wise structured data
 */
export const readExcelFile = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const sheetJson = XLSX.utils.sheet_to_json(sheet, { defval: null, header: 1 });
    result[sheetName] = sheetJson;
  });

  return result;
};

/**
 * Compares two Excel sheets structured as 2D arrays
 * @param {Object} workbook1
 * @param {Object} workbook2
 * @returns {Object} Comparison result object
 */
export const compareWorkbooks = (workbook1, workbook2) => {
  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
  let recordId = 0;

  const allSheetNames = new Set([...Object.keys(workbook1), ...Object.keys(workbook2)]);

  allSheetNames.forEach(sheetName => {
    const rows1 = workbook1[sheetName] || [];
    const rows2 = workbook2[sheetName] || [];
    const maxRows = Math.max(rows1.length, rows2.length);

    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
      const row1 = rows1[rowIdx] || [];
      const row2 = rows2[rowIdx] || [];
      const maxCols = Math.max(row1.length, row2.length);

      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const cell1 = row1[colIdx] ?? '';
        const cell2 = row2[colIdx] ?? '';
        const colLetter = String.fromCharCode(65 + colIdx);
        const cellAddress = `${sheetName}!${colLetter}${rowIdx + 1}`;

        if (String(cell1) !== String(cell2)) {
          differencesFound++;
          recordId++;
          results.push({
            ID: recordId.toString(),
            COLUMN: cellAddress,
            SOURCE_1_VALUE: String(cell1),
            SOURCE_2_VALUE: String(cell2),
            STATUS: 'difference'
          });
        } else {
          matchesFound++;
        }
      }
    }
  });

  return {
    total_records: results.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results
  };
};

/**
 * Main function to compare two Excel files
 * @param {File} file1 - The first Excel file
 * @param {File} file2 - The second Excel file
 * @returns {Promise<Object>} - The comparison results
 */
export const compareExcelFiles_main = async (file1, file2) => {
  try {
    const workbook1 = await readExcelFile(file1);
    const workbook2 = await readExcelFile(file2);
    return compareWorkbooks(workbook1, workbook2);
  } catch (error) {
    console.error('Comparison error:', error);
    throw new Error(`Excel comparison failed: ${error.message}`);
  }
};
