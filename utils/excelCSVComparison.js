import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';
import { mapHeaders } from './mapHeaders';

/**
 * Compares an Excel file against a CSV file with header alignment.
 * @param {File} file1 - Excel file (.xlsx)
 * @param {File} file2 - CSV file (.csv)
 * @returns {Promise<Object>} - Comparison result object
 */
export async function compareExcelCSVFiles(file1, file2) {
  try {
    // Parse both files into JSON arrays
    const [excelData, csvData] = await Promise.all([
      parseExcelFile(file1),
      parseCSVFile(file2)
    ]);

    if (!Array.isArray(excelData) || !Array.isArray(csvData)) {
      throw new Error('Parsed data missing or invalid');
    }

    // Extract headers directly from parsed objects
    const headers1 = Object.keys(excelData[0] || {});
    const headers2 = Object.keys(csvData[0] || {});

    if (!Array.isArray(headers1) || !Array.isArray(headers2)) {
      throw new Error('Hea
