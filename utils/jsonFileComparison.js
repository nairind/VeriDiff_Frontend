// File: utils/jsonFileComparison.js

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
const flattenObject = (obj, prefix = '') => {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        flattened[newKey] = '';
      } else if (Array.isArray(value)) {
        flattened[newKey] = JSON.stringify(value);
      } else if (typeof value === 'object') {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = String(value);
      }
    }
  }
  
  return flattened;
};

/**
 * Loads and parses JSON file content
 */
export const parseJSONFile = async (file) => {
  const text = await readFileAsText(file);
  const parsed = parseJSON(text);

  if (Array.isArray(parsed)) {
    // Handle array of objects
    return parsed.map(item => flattenObject(item));
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Handle single object - wrap in array to maintain consistency
    return [flattenObject(parsed)];
  } else {
    throw new Error('Unsupported JSON format. Expecting object or array of objects.');
  }
};

/**
 * Check if value is numeric
 */
function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

/**
 * Tolerance comparison logic
 */
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
 * Compares two arrays of JSON data row-by-row and field-by-field with tolerance support.
 */
const compareJSONData = (data1, data2, finalMappings = []) => {
  // Apply mappings to data2 if provided
  let remappedData2 = data2;
  if (finalMappings.length > 0) {
    remappedData2 = data2.map(row => {
      const remappedRow = {};
      finalMappings.forEach(mapping => {
        if (mapping.file1Header && mapping.file2Header) {
          remappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
        }
      });
      return remappedRow;
    });
  }

  const results = [];
  let matches = 0;
  let differences = 0;
  const maxRows = Math.max(data1.length, remappedData2.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = remappedData2[i] || {};
    const keys = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    const fieldResults = {};

    for (const key of keys) {
      const val1 = row1[key] ?? '';
      const val2 = row2[key] ?? '';
      const mapping = finalMappings.find(m => m.file1Header === key);

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
      ID: i + 1,
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
 * Main JSON file comparison function
 */
export const compareJSONFiles = async (file1, file2, finalMappings = []) => {
  try {
    if (!file1.name.endsWith('.json') || !file2.name.endsWith('.json')) {
      throw new Error('Both files must be JSON (.json)');
    }

    const [data1, data2] = await Promise.all([
      parseJSONFile(file1),
      parseJSONFile(file2)
    ]);

    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Parsed data missing or invalid');
    }

    return compareJSONData(data1, data2, finalMappings);
  } catch (error) {
    throw new Error(`Failed to compare JSON files: ${error.message}`);
  }
};

// Keep the old function name for backward compatibility
export const compareJSONFiles_main = compareJSONFiles;
