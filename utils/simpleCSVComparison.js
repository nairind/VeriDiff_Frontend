// File: utils/simpleCSVComparison.js

import Papa from 'papaparse';

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const parseCSV = (content) => {
  try {
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    if (result.errors?.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }
    return result.data;
  } catch (error) {
    throw new Error('Failed to parse CSV: ' + error.message);
  }
};

export const parseCSVFile = async (file) => {
  const content = await readFileAsText(file);
  return parseCSV(content);
};

const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

const compareWithTolerance = (val1, val2, tolerance, type) => {
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
};

export const compareFiles = async (file1, file2, finalMappings = []) => {
  const [data1, data2] = await Promise.all([
    parseCSVFile(file1),
