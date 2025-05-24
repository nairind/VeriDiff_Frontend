// File: utils/excelCSVComparison.js

import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

/**
 * Checks if a given value is numeric.
 */
const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

/**
 * Determines if the two values match considering tolerance rules
 */
const valuesMatch = (val1, val2, mapping) => {
  if (val1 === val2) return true;

  if (!mapping?.isAmountField) return false;

  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);
  if (!isNumeric(num1) || !isNumeric(num2)) return false;

  const diff = Math.abs(num1 - num2);
  const tolerance = parseFloat(mapping.toleranceValue || 0);
  if (isNaN(tolerance)) return false;

  if (mapping.toleranceType === '%') {
    const percentDiff = (diff / Math.max(Math.abs(num1), Math.abs(num2))) * 100;
    return percentDiff <= tolerance;
  } else {
    return diff <= tolerance;
  }
};

/**
 * Main comparison function for Excel vs CSV
 */
export const compareExcelCSVFiles = async (file1, file2, headerMappings) => {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(file1),
    parseCSVFile(file2)
  ]);

  const remappedCSV = csvData.map(row => {
    const remapped = {};
    headerMappings.forEach(mapping => {
      if (mapping.file1Header && mapping.file2Header) {
        remapped[mapping.file1Header] = row[mapping.file2Header] ?? '';
      }
    });
    return remapped;
  });

  const results = [];
  let matches = 0;
  let differences = 0;
  const maxRows = Math.max(excelData.length, remappedCSV.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = excelData[i] || {};
    const row2 = remappedCSV[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';

      const mapping = headerMappings.find(m => m.file1Header === key);
      const isMatch = valuesMatch(val1, val2, mapping);

      results.push({
        ID: row1['ID'] || i + 1,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: isMatch ? 'match' : 'difference'
      });

      isMatch ? matches++ : differences++;
    }
  }

  return {
    total_records: results.length,
    differences_found: differences,
    matches_found: matches,
    results
  };
};
