// File: utils/extractHeaders.js

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Extracts headers from a CSV file
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export const extractCSVHeaders = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = Papa.parse(event.target.result, { header: true });
      if (result.meta && result.meta.fields) {
        resolve(result.meta.fields);
      } else {
        reject(new Error('Unable to parse CSV headers'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Extracts headers from an Excel file
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export const extractExcelHeaders = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(json[0]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extracts headers from a JSON file (assumes array of objects)
 * @param {File} file
 * @returns {Promise<string[]>}
 */
export const extractJSONHeaders = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json) && json.length > 0) {
          resolve(Object.keys(json[0]));
        } else {
          reject(new Error('Invalid or empty JSON structure'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Unified header extraction entry point
 * @param {File} file
 * @param {string} type - 'csv', 'excel', or 'json'
 * @returns {Promise<string[]>}
 */
export const extractHeaders = (file, type) => {
  switch (type) {
    case 'csv':
      return extractCSVHeaders(file);
    case 'excel':
      return extractExcelHeaders(file);
    case 'json':
      return extractJSONHeaders(file);
    default:
      return Promise.reject(new Error(`Unsupported type: ${type}`));
  }
};
