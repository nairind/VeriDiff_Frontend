import Papa from 'papaparse';

/**
 * Reads a file and returns its contents as text
 * @param {File} file - The file to read
 * @returns {Promise<string>}
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsText(file);
  });
};

/**
 * Parses CSV content using PapaParse
 * @param {string} content - The CSV content to parse
 * @returns {Array<Object>}
 */
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

/**
 * Parses a CSV file to JSON (used for Excel–CSV comparisons)
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
export const parseCSVFile = async (file) => {
  const content = await readFileAsText(file);
  return parseCSV(content);
};

/**
 * Compares two CSV datasets
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Object}
 */
export const compareCSVData = (data1, data2) => {
  const allColumns = new Set();
  data1.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  data2.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));

  let idColumn = Object.keys(data1[0] || {})[0] || '';
  if ('id' in (data1[0] || {})) idColumn = 'id';
  if ('ID' in (data1[0] || {})) idColumn = 'ID';

  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
