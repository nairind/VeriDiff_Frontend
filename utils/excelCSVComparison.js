// File: utils/excelCSVComparison.js

import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function withinTolerance(v1, v2, type, value) {
  const num1 = parseFloat(v1);
  const num2 = parseFloat(v2);
  if (!isNumeric(num1) || !isNumeric(num2)) return false;
  if (type === 'Flat') return Math.abs(num1 - num2) <= parseFloat(value);
  if (type === '%') return Math.abs(num1 - num2) <= (parseFloat(value) / 100) * Math.abs(num1);
  return false;
}

export async function compareExcelCSVFiles(file1, file2, finalMappings = []) {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(file1),
    parseCSVFile(file2)
  ]);

  const remappedCSVData = csvData.map(row => {
    const mappedRow = {};
    finalMappings.forEach(mapping => {
      if (mapping.file1Header && mapping.file2Header) {
        mappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
      }
    });
    return mappedRow;
  });

  const toleranceMap = {};
  finalMappings.forEach(({ file1Header, isAmountField, toleranceType, toleranceValue }) => {
    if (isAmountField && toleranceType && toleranceValue !== '') {
      toleranceMap[file1Header] = {
        type: toleranceType,
        value: parseFloat(toleranceValue)
      };
    }
  });

  const results = [];
  let matches = 0, differences = 0;
  const maxRows = Math.max(excelData.length, remappedCSVData.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = excelData[i] || {};
    const row2 = remappedCSVData[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';

      let status = 'match';

      if (val1 !== val2) {
        if (
          toleranceMap[key] &&
          isNumeric(val1) && isNumeric(val2) &&
          withinTolerance(val1, val2, toleranceMap[key].type, toleranceMap[key].value)
        ) {
          status = 'acceptable difference';
        } else {
          status = 'difference';
        }
      }

      results.push({
        ID: row1['ID'] || `${i + 1}`,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: status
      });

      if (status === 'match') matches++;
      else if (status === 'difference') differences++;
    }
  }

  return {
    total_records: results.length,
    differences_found: differences,
    matches_found: matches,
    results
  };
}
