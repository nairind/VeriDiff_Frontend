// File: utils/excelCSVComparison.js
import * as XLSX from "xlsx";

// Helper: Parse Excel to array of objects
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
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Helper: Parse CSV to array of objects
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const workbook = XLSX.read(text, { type: "string" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Helper: Compare two arrays of JSON records
const compareData = (data1, data2) => {
  const diffs = [];
  const max = Math.max(data1.length, data2.length);
  for (let i = 0; i < max; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    for (const key of keys) {
      if ((row1[key] || "") !== (row2[key] || "")) {
        diffs.push({
          row: i + 1,
          column: key,
          value1: row1[key] || "",
          value2: row2[key] || "",
          status: "mismatch",
        });
      }
    }
  }
  return diffs;
};

// Main export
export const compareExcelToCSV = async (excelFile, csvFile) => {
  const [excelData, csvData] = await Promise.all([
    parseExcelFile(excelFile),
    parseCSVFile(csvFile),
  ]);
  return compareData(excelData, csvData);
};
