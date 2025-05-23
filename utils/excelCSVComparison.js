import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Parse Excel to JSON
 */
const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
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
 * Parse CSV to JSON
 */
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
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

/**
 * Compare Excel and CSV data
 */
export const compareExcelCSVFiles = async (file1, file2) => {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(file1),
    parseCSVFile(file2)
  ]);

  const idColumn = Object.keys(excelData[0])[0]; // Use first column as ID
  const csvMap = new Map(csvData.map(row => [row[idColumn], row]));

  let differencesFound = 0;
  let matchesFound = 0;
  const results = [];

  for (const excelRow of excelData) {
    const id = excelRow[idColumn];
    const csvRow = csvMap.get(id) || {};

    const allKeys = new Set([...Object.keys(excelRow), ...Object.keys(csvRow)]);
    for (const key of allKeys) {
      const val1 = (excelRow[key] || '').trim();
      const val2 = (csvRow[key] || '').trim();

      if (val1 !== val2) {
        results.push({
          ID: id,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: 'difference'
        });
        differencesFound++;
      } else if (val1 !== '') {
        matchesFound++;
        results.push({
          ID: id,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: 'match'
        });
      }
    }
  }

  return {
    total_records: excelData.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results
  };
};
