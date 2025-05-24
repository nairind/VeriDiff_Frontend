import * as XLSX from "xlsx";

/**
 * Parses an Excel file and returns its contents as JSON.
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Compares two arrays of Excel data row-by-row and field-by-field.
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Object} Comparison result
 */
const compareExcelData = (data1, data2) => {
  const diffs = [];
  const maxRows = Math.max(data1.length, data2.length);
  let matches = 0;

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1 = row1[key] ?? "";
      const val2 = row2[key] ?? "";
      if (val1 !== val2) {
        diffs.push({
          ID: row1['ID'] || `${i + 1}-${key}`,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: "difference",
        });
      } else {
        matches++;
        diffs.push({
          ID: row1['ID'] || `${i + 1}-${key}`,
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: "match",
        });
      }
    }
  }

  return {
    total_records: diffs.length,
    differences_found: diffs.filter(d => d.STATUS === "difference").length,
    matches_found: matches,
    results: diffs,
  };
};

/**
 * Main method to compare two Excel files.
 * Supports optional finalMappings to remap file2 headers.
 * @param {File} file1
 * @param {File} file2
 * @param {Array<{file1Header: string, file2Header: string}>} [finalMappings]
 * @returns {Promise<Object>} Formatted comparison result
 */
export const compareExcelFiles = async (file1, file2, finalMappings = null) => {
  const [data1, data2] = await Promise.all([
    parseExcelFile(file1),
    parseExcelFile(file2),
  ]);

  let alignedData2 = data2;

  if (finalMappings) {
    alignedData2 = data2.map(row => {
      const remapped = {};
      finalMappings.forEach(({ file1Header, file2Header }) => {
        remapped[file1Header] = row[file2Header] ?? '';
      });
      return remapped;
    });
  }

  return compareExcelData(data1, alignedData2);
};
