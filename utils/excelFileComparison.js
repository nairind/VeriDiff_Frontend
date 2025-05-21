import * as XLSX from 'xlsx';

/**
 * Reads and parses an Excel file into a structured format.
 * @param {File} file - The uploaded Excel file.
 * @returns {Promise<Array<Object>>} Parsed data from the first sheet.
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(jsonData);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Compares two Excel datasets (arrays of objects) and returns differences.
 * @param {Array<Object>} data1 - Parsed rows from File 1.
 * @param {Array<Object>} data2 - Parsed rows from File 2.
 * @returns {Array<Object>} List of differences.
 */
export const compareExcelData = (data1, data2) => {
  const diffs = [];
  const maxLength = Math.max(data1.length, data2.length);

  for (let i = 0; i < maxLength; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};

    const allKeys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    allKeys.forEach((key) => {
      if (row1[key] !== row2[key]) {
        diffs.push({
          row: i + 1,
          column: key,
          value1: row1[key] || '',
          value2: row2[key] || '',
          status: 'mismatch'
        });
      }
    });
  }

  return diffs;
};

/**
 * Main function to compare two Excel files.
 * @param {File} file1 - First Excel file.
 * @param {File} file2 - Second Excel file.
 * @returns {Promise<Array<Object>>} List of differences between the files.
 */
export const main = async (file1, file2) => {
  try {
    // Parse both Excel files
    const data1 = await parseExcelFile(file1);
    const data2 = await parseExcelFile(file2);

    // Compare the parsed data
    const differences = compareExcelData(data1, data2);

    return differences;
  } catch (error) {
    throw new Error('Failed to compare Excel files: ' + error.message);
  }
};
