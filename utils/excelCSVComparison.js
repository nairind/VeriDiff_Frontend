import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

export async function compareExcelCSVFiles(file1, file2, mappings) {
  try {
    const [excelData, csvData] = await Promise.all([
      parseExcelFile(file1),
      parseCSVFile(file2)
    ]);

    if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
      throw new Error('Parsed data missing or invalid');
    }

    // Remap CSV headers based on mappings
    const remappedCSVData = csvData.map(row => {
      const remapped = {};
      mappings.forEach(({ file1Header, file2Header }) => {
        remapped[file1Header] = row[file2Header] ?? '';
      });
      return remapped;
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
        const mapping = mappings.find(m => m.file1Header === key);
        const val1Raw = row1[key] ?? '';
        const val2Raw = row2[key] ?? '';

        const val1 = typeof val1Raw === 'string' ? val1Raw.trim() : val1Raw;
        const val2 = typeof val2Raw === 'string' ? val2Raw.trim() : val2Raw;

        let status = 'difference';

        if (val1 === val2) {
          status = 'match';
          matches++;
        } else if (mapping?.isAmount && mapping.toleranceType && mapping.toleranceValue) {
          const num1 = parseFloat(val1);
          const num2 = parseFloat(val2);

          if (!isNaN(num1) && !isNaN(num2)) {
            const tolerance = parseFloat(mapping.toleranceValue);
            const diff = Math.abs(num1 - num2);
            const base = Math.max(Math.abs(num1), Math.abs(num2));

            if (
              (mapping.toleranceType === 'flat' && diff <= tolerance) ||
              (mapping.toleranceType === '%' && base > 0 && (diff / base) <= (tolerance / 100))
            ) {
              status = 'acceptable difference';
              matches++;
            } else {
              differences++;
            }
          } else {
            differences++;
          }
        } else {
          differences++;
        }

        results.push({
          ID: row1['ID'] || `${i + 1}-${key}`,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: status
        });
      }
    }

    return {
      total_records: results.length,
      differences_found: differences,
      matches_found: matches,
      results
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
}
