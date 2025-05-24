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

function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function compareWithTolerance(val1, val2, tolerance, type) {
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
}

/**
 * Compares two flattened JSON structures row-by-row
 */
const compareJSONData = (data1, data2, finalMappings = []) => {
  const results = [];
  const maxRows = Math.max(data1.length, data2.length);
  let matches = 0,
    differences = 0;

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = data2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    const fieldResults = {};

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      const mapping = finalMappings.find((m) => m.file1Header === key);

      let status = 'difference';
      if (val1 === val2) {
        status = 'match';
      } else if (
        mapping?.isAmountField &&
        mapping?.toleranceType &&
        mapping?.toleranceValue !== '' &&
        compareWithTolerance(val1, val2, mapping.toleranceValue, mapping.toleranceType)
      ) {
        status = 'acceptable';
      }

      fieldResults[key] = {
        val1,
        val2,
        status,
        difference: isNumeric(val1) && isNumeric(val2) ? Math.abs(val1 - val2).toFixed(2) : ''
      };

      if (status === 'match' || status === 'acceptable') {
        matches++;
      } else {
        differences++;
      }
    }

    results.push({
      ID: row1['ID'] || i + 1,
      fields: fieldResults
    });
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
      data2 = rawData2.map((row) => {
        const remapped = {};
        finalMappings.forEach(({ file1Header, file2Header }) => {
          remapped[file1Header] = row[file2Header] ?? '';
        });
        return remapped;
      });
    }

    return compareJSONData(data1, data2, finalMappings);
  } catch (err) {
    console.error('JSON comparison error:', err);
    throw new Error(`JSON comparison failed: ${err.message}`);
  }
};
