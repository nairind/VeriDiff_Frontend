// utils/xlsxFileComparison.js
import * as XLSX from 'xlsx';

/**
 * Reads an Excel file in the browser using xlsx
 * @param {File} file - The Excel file to read
 * @returns {Promise<Object>} - Parsed workbook object
 */
export const readXlsxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extracts structured rows from a workbook
 * @param {XLSX.WorkBook} workbook
 * @returns {Object} { sheetName: string[][] }
 */
export const extractSheets = (workbook) => {
  const result = {};
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }); // 2D array
    result[sheetName] = rows;
  });
  return result;
};

/**
 * Compares two Excel sheets row by row
 * @param {string[][]} sheet1 - 2D array from workbook 1
 * @param {string[][]} sheet2 - 2D array from workbook 2
 * @returns {Object[]} - Array of difference objects
 */
export const compareSheets = (sheet1, sheet2, sheetName) => {
  const maxRows = Math.max(sheet1.length, sheet2.length);
  const differences = [];

  for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
    const row1 = sheet1[rowIdx] || [];
    const row2 = sheet2[rowIdx] || [];
    const maxCols = Math.max(row1.length, row2.length);

    for (let colIdx = 0; colIdx < maxCols; colIdx++) {
      const val1 = row1[colIdx] || '';
      const val2 = row2[colIdx] || '';

      if (String(val1) !== String(val2)) {
        differences.push({
          location: `${sheetName}!${String.fromCharCode(65 + colIdx)}${rowIdx + 1}`,
          file1: val1,
          file2: val2,
        });
      }
    }
  }

  return differences;
};

/**
 * Main function to compare two Excel files
 */
export const compareExcelFiles_main = async (file1, file2) => {
  const wb1 = await readXlsxFile(file1);
  const wb2 = await readXlsxFile(file2);

  const sheets1 = extractSheets(wb1);
  const sheets2 = extractSheets(wb2);

  const allSheetNames = new Set([
    ...Object.keys(sheets1),
    ...Object.keys(sheets2),
  ]);

  let results = [];
  for (let sheetName of allSheetNames) {
    const sheet1 = sheets1[sheetName] || [];
    const sheet2 = sheets2[sheetName] || [];
    const diffs = compareSheets(sheet1, sheet2, sheetName);
    results = results.concat(diffs);
  }

  return {
    totalDifferences: results.length,
    differences: results
  };
};
