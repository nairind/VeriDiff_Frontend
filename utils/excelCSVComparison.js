import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';
import { mapHeaders } from './mapHeaders';

/**
 * Applies tolerance to numeric comparison
 */
function areValuesEqual(val1, val2, tolerance) {
  const n1 = parseFloat(val1);
  const n2 = parseFloat(val2);
  if (isNaN(n1) || isNaN(n2)) return val1 === val2; // fallback to string match

  const diff = Math.abs(n1 - n2);
  if (tolerance.type === 'flat') return diff <= tolerance.value;
  if (tolerance.type === 'percent') return (diff / Math.max(Math.abs(n1), Math.abs(n2))) * 100 <= tolerance.value;

  return n1 === n2;
}

export async function compareExcelCSVFiles(file1, file2, finalMappings = [], toleranceConfig = {}) {
  try {
    const [excelData, csvData] = await Promise.all([
      parseExcelFile(file1),
      parseCSVFile(file2)
    ]);

    if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
      throw new Error('Parsed data missing or invalid');
    }

    const headers1 = Object.keys(excelData[0] || {});
    const headers2 = Object.keys(csvData[0] || {});

    const headerMappings = finalMappings.length > 0 ? finalMappings : mapHeaders(headers1, headers2);

    const remappedCSVData = csvData.map(row => {
      const remappedRow = {};
      headerMappings.forEach(mapping => {
        if (mapping.file1Header && mapping.file2Header) {
          remappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
        }
      });
      return remappedRow;
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

        const isAmountField = (toleranceConfig.fields || []).includes(key);
        const isMatch = isAmountField
          ? areValuesEqual(val1, val2, toleranceConfig)
          : val1 === val2;

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
      total_records: maxRows,
      differences_found: differences,
      matches_found: matches,
      results
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
}
