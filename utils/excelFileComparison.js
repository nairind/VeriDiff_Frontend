// File: utils/excelFileComparison.js

import * as XLSX from "xlsx";

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

export const compareExcelFiles = async (file1, file2, finalMappings = []) => {
  const [data1, data2] = await Promise.all([
    parseExcelFile(file1),
    parseExcelFile(file2),
  ]);

  const remappedData2 = data2.map(row => {
    const newRow = {};
    finalMappings.forEach(mapping => {
      if (mapping.file1Header && mapping.file2Header) {
        newRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
      }
    });
    return newRow;
  });

  const results = [];
  let matches = 0, differences = 0;
  const maxRows = Math.max(data1.length, remappedData2.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = remappedData2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    const fieldResults = {};

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

      fieldResults[key] = {
        val1,
        val2,
        status,
        difference: isNumeric(val1) && isNumeric(val2) ? Math.abs(val1 - val2).toFixed(2) : ''
      };

      if (status === 'match' || status === 'acceptable') matches++;
      else differences++;
    }

    results.push({ ID: row1['ID'] || i + 1, fields: fieldResults });
  }

  return {
    total_records: results.length,
    differences_found: differences,
    matches_found: matches,
    results
  };
};
