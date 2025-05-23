// File: utils/compareExcelCSVFiles.js

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { extractHeaders } from './extractHeaders';
import { mapHeaders } from './mapHeaders';

/**
 * Parses Excel file into JSON
 */
const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses CSV file into JSON
 */
const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true
        });
        resolve(parsed.data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Applies header mapping to dataset (maps target fields to standard fields)
 */
const applyHeaderMapping = (data, mapping, source = 'file2') => {
  return data.map(row => {
    const transformed = {};
    mapping.forEach(({ file1Header, file2Header }) => {
      transformed[file1Header] = source === 'file1'
        ? row[file1Header]
        : row[file2Header] ?? '';
    });
    return transformed;
  });
};

/**
 * Main comparison logic
 */
export const compareExcelCSVFiles = async (file1, file2) => {
  try {
    const [excelData, csvData] = await Promise.all([
      parseExcel(file1),
      parseCSV(file2)
    ]);

    const headers1 = extractHeaders(data1);
const headers2 = extractHeaders(data2);

if (!Array.isArray(headers1) || !Array.isArray(headers2)) {
  throw new Error('Header extraction failed: One or both files did not return a valid header array.');
}

const headerMappings = mapHeaders(headers1, headers2);

    
    const transformedFile1 = applyHeaderMapping(excelData, headerMapping, 'file1');
    const transformedFile2 = applyHeaderMapping(csvData, headerMapping, 'file2');

    const results = [];
    let matchesFound = 0;
    let differencesFound = 0;

    const maxLength = Math.max(transformedFile1.length, transformedFile2.length);

    for (let i = 0; i < maxLength; i++) {
      const row1 = transformedFile1[i] || {};
      const row2 = transformedFile2[i] || {};

      headerMapping.forEach(({ file1Header }) => {
        const val1 = row1[file1Header] ?? '';
        const val2 = row2[file1Header] ?? '';
        const status = val1 === val2 ? 'match' : 'difference';

        results.push({
          ID: i + 1,
          COLUMN: file1Header,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: status
        });

        if (status === 'match') {
          matchesFound++;
        } else {
          differencesFound++;
        }
      });
    }

    return {
      total_records: maxLength,
      differences_found: differencesFound,
      matches_found: matchesFound,
      results
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
};
