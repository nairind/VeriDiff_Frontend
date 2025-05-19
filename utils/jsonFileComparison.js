import { diffJson } from 'diff';

/**
 * JSON file comparison utility
 * Provides browser-compatible JSON file comparison functionality
 */

/**
 * Reads a file and returns its contents as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} - A promise that resolves to the file contents
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parses JSON content
 * @param {string} content - The JSON content to parse
 * @returns {Object} - The parsed JSON data
 */
export const parseJSON = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};

/**
 * Compares two JSON objects
 * @param {Object} json1 - The first JSON object
 * @param {Object} json2 - The second JSON object
 * @returns {Object} - The comparison results
 */
export const compareJSONObjects = (json1, json2) => {
  // Use the diff library to compare JSON objects
  const diff = diffJson(json1, json2);
  
  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
  let pathIndex = 0;
  
  // Function to flatten the diff results into a tabular format
  const processDiff = (part, path = '') => {
    pathIndex++;
    
    if (part.added) {
      results.push({
        ID: pathIndex.toString(),
        COLUMN: path || 'root',
        SOURCE_1_VALUE: '',
        SOURCE_2_VALUE: JSON.stringify(part.value),
        STATUS: 'difference'
      });
      differencesFound++;
    } else if (part.removed) {
      results.push({
        ID: pathIndex.toString(),
        COLUMN: path || 'root',
        SOURCE_1_VALUE: JSON.stringify(part.value),
        SOURCE_2_VALUE: '',
        STATUS: 'difference'
      });
      differencesFound++;
    } else {
      // For unchanged parts, we still want to show them in the results
      results.push({
        ID: pathIndex.toString(),
        COLUMN: path || 'root',
        SOURCE_1_VALUE: JSON.stringify(part.value),
        SOURCE_2_VALUE: JSON.stringify(part.value),
        STATUS: 'match'
      });
      matchesFound++;
    }
  };
  
  // Process each part of the diff
  diff.forEach(part => {
    processDiff(part);
  });
  
  return {
    total_records: results.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results: results
  };
};

/**
 * Main function to compare two JSON files
 * @param {File} file1 - The first file
 * @param {File} file2 - The second file
 * @returns {Promise<Object>} - A promise that resolves to the comparison results
 */
export const compareJSONFiles_main = async (file1, file2) => {
  try {
    // Validate file types
    if (!file1.name.toLowerCase().endsWith('.json') || !file2.name.toLowerCase().endsWith('.json')) {
      throw new Error('Both files must be JSON (.json) files');
    }
    
    // Read file contents
    const content1 = await readFileAsText(file1);
    const content2 = await readFileAsText(file2);
    
    // Parse JSON
    let json1, json2;
    try {
      json1 = parseJSON(content1);
    } catch (error) {
      throw new Error('Error parsing first JSON file: ' + error.message);
    }
    
    try {
      json2 = parseJSON(content2);
    } catch (error) {
      throw new Error('Error parsing second JSON file: ' + error.message);
    }
    
    // Compare JSON objects
    return compareJSONObjects(json1, json2);
  } catch (error) {
    console.error('JSON comparison error:', error);
    throw new Error(`JSON comparison failed: ${error.message}`);
  }
};
