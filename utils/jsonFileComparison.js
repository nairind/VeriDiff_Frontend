/**
 * Reads a file and returns its contents as text
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
 * Parses JSON content
 */
export const parseJSON = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};

/**
 * Parses a JSON file into an array of objects
 * @param {File} file
 * @returns {Promise<Array<Object>>}
 */
export const parseJSONFile = async (file) => {
  const text = await readFileAsText(file);
  const parsed = parseJSON(text);

  if (Array.isArray(parsed)) return parsed;

  // Handle common wrappers like { data: [...] }
  const wrappedArray = Object.values(parsed).find(val => Array.isArray(val));
  if (wrappedArray) return wrappedArray;

  throw new Error('JSON must be or contain an array of objects');
};

/**
 * Compares two arrays of JSON data
 * @param {Array<Object>} data1
 * @param {Array<Object>} data2
 * @returns {Object}
 */
const compareJSONData = (data1, data2) => {
  const results = [];
  const maxRows = Math.max(data1.length, data2.length);
  let matches = 0;
  let differences = 0;

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      const status = val1 === val2 ? 'match' : 'difference';

      results.push({
        ID: row1['ID'] || `${i + 1}-${key}`,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: status
      });

      status === 'match' ? matches++ : differences++;
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
 * Main function to compare two JSON files with optional mapping
 * @param {File} file1
 * @param {File} file2
 * @param {Array<{ file1Header: string, file2Header: string }>} [finalMappings=null]
 * @returns {Promise<Object>}
 */
export const compareJSONFiles_main = async (file1, file2, finalMappings = null) => {
  try {
    if (!file1.name.endsWith('.json') || !file2.name.endsWith('.json')) {
      throw new Error('Both files must be JSON (.json) files');
    }

    const [data1, data2] = await Promise.all([
      parseJSONFile(file1),
      parseJSONFile(file2)
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

    return compareJSONData(data1, alignedData2);
  } catch (error) {
    console.error('JSON comparison error:', error);
    throw new Error(`JSON comparison failed: ${error.message}`);
  }
};
