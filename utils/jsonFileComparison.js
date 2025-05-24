/**
 * Utility to read file contents as text
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
 * Parse JSON content safely
 */
export const parseJSON = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};

/**
 * Flattens a nested JSON object using dot notation
 */
const flattenObject = (obj, prefix = '', res = {}) => {
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, res);
    } else {
      res[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }
  return res;
};

/**
 * Loads and flattens JSON file content
 */
export const parseJSONFile = async (file) => {
  const text = await readFileAsText(file);
  const parsed = parseJSON(text);

  if (Array.isArray(parsed)) {
    return parsed.map((item, i) => flattenObject(item, `row${i}`));
  }

  if (typeof parsed === 'object') {
    return [flattenObject(parsed)];
  }

  throw new Error('Unsupported JSON format. Expecting object or array of objects.');
};

/**
 * Compares two flattened JSON structures row-by-row
 */
const compareJSONData = (data1, data2) => {
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
      const isMatch = val1 === val2;

      results.push({
        ID: `${i + 1}-${key}`,
        COLUMN: key,
        SOURCE_1_VALUE: val1,
        SOURCE_2_VALUE: val2,
        STATUS: isMatch ? 'match' : 'difference'
      });

      isMatch ? matches++ : differences++;
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
 * Main comparison function with optional field mapping
 */
export const compareJSONFiles_main = async (file1, file2, finalMappings = null) => {
  try {
    if (!file1.name.endsWith('.json') || !file2.name.endsWith('.json')) {
      throw new Error('Both files must be JSON (.json)');
    }

    const [data1, rawData2] = await Promise.all([
      parseJSONFile(file1),
      parseJSONFile(file2)
    ]);

    let data2 = rawData2;

    if (finalMappings) {
      data2 = rawData2.map(row => {
        const remapped = {};
        finalMappings.forEach(({ file1Header, file2Header }) => {
          remapped[file1Header] = row[file2Header] ?? '';
        });
        return remapped;
      });
    }

    return compareJSONData(data1, data2);
  } catch (err) {
    console.error('JSON comparison error:', err);
    throw new Error(`JSON comparison failed: ${err.message}`);
  }
};
