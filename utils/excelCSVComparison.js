// File: utils/excelCSVComparison.js

import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function compareWithTolerance(val1, val2, tolerance, type) {
  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);
  if (!isNumeric(num1) || !isNumeric(num2)) return false;

  if (type === 'flat') {
    return Math.abs(num1 - num2) <= parseFloat(tolerance);
  } else if (type === '%') {
    const maxVal = Math.max(Math.abs(num1), Math.abs(num2), 1);
    return Math.abs(num1 - num2) / maxVal <= parseFloat(tolerance) / 100;
  }
  return false;
}

export async function compareExcelCSVFiles(file1, file2, finalMappings = []) {
  try {
    const [excelData, csvData] = await Promise.all([
      parseExcelFile(file1),
      parseCSVFile(file2)
    ]);

    if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
      throw new Error('Parsed data missing or invalid');
    }

    const remappedCSVData = csvData.map(row => {
      const remappedRow = {};
      finalMappings.forEach(mapping => {
        if (mapping.file1Header && mapping.file2Header) {
          remappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
        }
      });
      return remappedRow;
    });

    const results = [];
    let matches = 0;
    let differences = 0;
    const maxRows = Math.max(excelData.length, remappedCSVData.length);

    for (let i = 0; i < maxRows; i++) {
      const row1 = excelData[i] || {};
      const row2 = remappedCSVData[i] || {};
      const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

      for (const key of keys) {
        const val1 = row1[key] ?? '';
        const val2 = row2[key] ?? '';

        const mapping = finalMappings.find(m => m.file1Header === key);
        let status = 'difference';

        if (val1 === val2) {
          status = 'match';
        } else if (
          mapping?.isAmountField &&
          mapping?.toleranceType &&
          mapping?.toleranceValue !== '' &&
          compareWithTolerance(val1, val2, mapping.toleranceValue, mapping.toleranceType)
        ) {
          status = 'acceptable';
        }

        results.push({
          ID: row1['ID'] || i + 1,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: status
        });

        if (status === 'match' || status === 'acceptable') {
          matches++;
        } else {
          differences++;
        }
      }
    }

    return {
      total_records: maxRows,
      differences_found: differences,
      matches_found: matches,
      results
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
}
