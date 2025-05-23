// compareExcelCSVFiles.js (Updated)
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parses an Excel file and extracts rows + headers
 */
const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        resolve({ rows, headers });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses a CSV file and extracts rows + headers
 */
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
        const headers = result.meta.fields;
        resolve({ rows: result.data, headers });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Applies user-confirmed header mapping to the Excel dataset
 */
const transformDataByMapping = (data, mapping) => {
  return data.map(row => {
    const transformed = {};
    mapping.forEach(({ file1Header, file2Header }) => {
      if (file2Header) {
        transformed[file2Header] = row[file1Header] ?? '';
      }
    });
    return transformed;
  });
};

/**
 * Compares two rows and returns differences
 */
const compareRows = (data1, data2) => {
  const results = [];
  const maxLength = Math.max(data1.length, data2.length);
  let matches = 0;
  let differences = 0;

  for (let i = 0; i < maxLength; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const allKeys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    allKeys.forEach(key => {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      const match = val1 === val2;
      results.push({
        ID: i + 1,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: match ? 'match' : 'difference'
      });
      match ? matches++ : differences++;
    });
  }

  return { results, matches, differences, total: maxLength };
};

/**
 * Main function to compare Excel and CSV files
 */
export const compareExcelCSVFiles = async (file1, file2, mapping) => {
  const excel = await parseExcelFile(file1);
  const csv = await parseCSVFile(file2);
  const transformedExcelData = transformDataByMapping(excel.rows, mapping);
  return compareRows(transformedExcelData, csv.rows);
};
