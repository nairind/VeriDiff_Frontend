import Papa from 'papaparse';

/**
 * Parses CSV content using PapaParse
 * @param {string} content
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
 * Reads a File object as text
 * @param {File} file
 * @returns {Promise<string>}
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Parses a CSV file and returns JSON array
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
export const parseCSVFile = async (file) => {
  const content = await readFileAsText(file);
  return parseCSV(content);
};
