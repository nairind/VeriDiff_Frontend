// File: components/ExcelCompareClient.js
"use client";

import * as XLSX from "xlsx";

/**
 * Parses an Excel file to JSON
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
const parseExcelFile = (file) => {
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
 * Compares two arrays of JSON rows from Excel
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Array<Object>}
 */
const compareExcelData = (data1, data2) => {
  const diffs = [];
  const maxRows = Math.max(data1.length, data2.length);

  for (let i = 0; i < maxRows; i++) {
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
          status: "mismatch"
        });
      }
    }
  }

  return diffs;
};

/**
 * Main entry to compare two Excel files
 * @param {File} file1
 * @param {File} file2
 * @returns {Promise<Array<Object>>}
 */
export const compareExcelFiles = async (file1, file2) => {
  const [data1, data2] = await Promise.all([
    parseExcelFile(file1),
    parseExcelFile(file2)
  ]);

  return compareExcelData(data1, data2);
};
