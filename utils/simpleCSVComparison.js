import Papa from 'papaparse';

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
 * Parses a CSV file and returns JSON array
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
export const parseCSVFile = async (file) => {
  const content = await readFileAsText(file);
  return parseCSV(content);
};

/**
 * Compares two CSV datasets with optional mappings
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Object}
 */
const compareCSVData = (data1, data2) => {
  const results = [];
  const maxRows = Math.max(data1.length, data2.length);
  let matches = 0, differences = 0;

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      results.push({
        ID: row1['ID'] || `${i + 1}-${key}`,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: val1 === val2 ? 'match' : 'difference'
      });
      val1 === val2 ? matches++ : differences++;
    }
  }

  return {
    total_records: results.length,
    differences_found: differences,
    matches_found: matches,
    results
  };
};

/**
 * Main function to compare two CSV files with optional mapping
 * @param {File} file1
 * @param {File} file2
 * @param {Array<{file1Header: string, file2Header: string}>} [finalMappings=null]
 * @returns {Promise<Object>}
 */
export const compareFiles = async (file1, file2, finalMappings = null) => {
  const [data1, data2] = await Promise.all([
    parseCSVFile(file1),
    parseCSVFile(file2)
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

  return compareCSVData(data1, alignedData2);
};
