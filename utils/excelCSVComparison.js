import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';
import { mapHeaders } from './mapHeaders';

/**
 * Compares an Excel file to a CSV file with header mapping and row comparison
 */
export async function compareExcelCSVFiles(file1, file2) {
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

    if (!headers1.length || !headers2.length) {
      throw new Error('Header extraction failed');
    }

    const headerMappings = mapHeaders(headers1, headers2);

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
        results.push({
          ID: row1['ID'] || i + 1,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: val1 === val2 ? 'match' : 'difference'
        });
        val1 === val2 ? matches++ : differences++;
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
