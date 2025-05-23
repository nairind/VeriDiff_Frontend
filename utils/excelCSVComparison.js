// utils/excelCSVComparison.js

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
        });
        resolve(result.data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const compareData = (data1, data2) => {
  const results = [];
  const allKeys = new Set([
    ...data1.flatMap((row) => Object.keys(row)),
    ...data2.flatMap((row) => Object.keys(row)),
  ]);
  const maxLen = Math.max(data1.length, data2.length);

  for (let i = 0; i < maxLen; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    for (const key of allKeys) {
      if ((row1[key] || '') !== (row2[key] || '')) {
        results.push({
          row: i + 1,
          column: key,
          value1: row1[key] || '',
          value2: row2[key] || '',
          status: 'mismatch',
        });
      }
    }
  }
  return results;
};

export const compareExcelCSVFiles = async (excelFile, csvFile) => {
  const [excelData, csvData] = await Promise.all([
    parseExcel(excelFile),
    parseCSV(csvFile),
  ]);

  const differences = compareData(excelData, csvData);

  return {
    total_records: Math.max(excelData.length, csvData.length),
    differences_found: differences.length,
    matches_found: Math.max(excelData.length, csvData.length) - differences.length,
    results: differences,
  };
};
