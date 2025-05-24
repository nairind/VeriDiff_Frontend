import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

/**
 * Compares an Excel file to a CSV file with header mapping, row comparison, and tolerance handling
 */
export async function compareExcelCSVFiles(file1, file2, headerMappings = []) {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(file1),
    parseCSVFile(file2)
  ]);

  if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
    throw new Error('Parsed data missing or invalid');
  }

  // Remap CSV data based on header mappings
  const remappedCSVData = csvData.map(row => {
    const remapped = {};
    headerMappings.forEach(m => {
      if (m.file1Header && m.file2Header) {
        remapped[m.file1Header] = row[m.file2Header] ?? '';
      }
    });
    return remapped;
  });

  const results = [];
  let matches = 0, differences = 0;
  const maxRows = Math.max(excelData.length, remappedCSVData.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = excelData[i] || {};
    const row2 = remappedCSVData[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1Raw = row1[key] ?? '';
      const val2Raw = row2[key] ?? '';

      const mapping = headerMappings.find(m => m.file1Header === key);
      let status = 'match';

      if (mapping?.isAmount && mapping.toleranceValue !== undefined && mapping.toleranceType) {
        const val1Num = parseFloat(val1Raw);
        const val2Num = parseFloat(val2Raw);
        const isNumeric = !isNaN(val1Num) && !isNaN(val2Num);

        if (isNumeric) {
          let threshold = 0;
          if (mapping.toleranceType === 'flat') {
            threshold = parseFloat(mapping.toleranceValue);
          } else if (mapping.toleranceType === '%') {
            threshold = (parseFloat(mapping.toleranceValue) / 100) * Math.abs(val1Num);
          }
          const difference = Math.abs(val1Num - val2Num);
          if (difference > threshold) {
            status = 'difference';
            differences++;
          } else {
            status = 'acceptable difference';
            matches++;
          }
        } else {
          // If not numeric but marked as amount, just compare raw strings
          status = val1Raw === val2Raw ? 'match' : 'difference';
          status === 'match' ? matches++ : differences++;
        }
      } else {
        status = val1Raw === val2Raw ? 'match' : 'difference';
        status === 'match' ? matches++ : differences++;
      }

      results.push({
        ID: row1['ID'] || `${i + 1}-${key}`,
        COLUMN: key,
        SOURCE_1_VALUE: val1Raw,
        SOURCE_2_VALUE: val2Raw,
        STATUS: status
      });
    }
  }

  return {
    total_records: results.length,
    differences_found: results.filter(r => r.STATUS === 'difference').length,
    matches_found: results.filter(r => r.STATUS === 'match').length,
    acceptable_differences: results.filter(r => r.STATUS === 'acceptable difference').length,
    results
  };
}
