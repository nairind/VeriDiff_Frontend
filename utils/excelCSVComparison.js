// File: utils/excelCSVComparison.js

import * as XLSX from "xlsx";
import Papa from "papaparse";

const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = Papa.parse(reader.result, { header: true, skipEmptyLines: true });
      resolve(parsed.data);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const compareExcelCSVFiles = async (excelFile, csvFile) => {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(excelFile),
    parseCSVFile(csvFile),
  ]);

  const differences = [];
  let matchCount = 0;
  let differenceCount = 0;

  const idKey = "ID";
  const csvMap = new Map(csvData.map(row => [row[idKey], row]));

  excelData.forEach(row1 => {
    const row2 = csvMap.get(row1[idKey]);
    if (!row2) return;

    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    keys.forEach(key => {
      const val1 = row1[key] ?? "";
      const val2 = row2[key] ?? "";
      if (val1 !== val2) {
        differences.push({
          ID: row1[idKey],
          COLUMN: key,
          SOURCE_1_VALUE: val1,
          SOURCE_2_VALUE: val2,
          STATUS: "difference"
        });
        differenceCount++;
      } else {
        matchCount++;
      }
    });
  });

  return {
    total_records: excelData.length,
    differences_found: differenceCount,
    matches_found: matchCount,
    results: differences
  };
};
