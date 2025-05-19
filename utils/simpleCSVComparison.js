import Papa from 'papaparse';

/**
 * Simple CSV file comparison utility
 * Focuses on reliable browser-based CSV comparison
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
 * Parses CSV content using PapaParse
 * @param {string} content - The CSV content to parse
 * @returns {Array} - The parsed CSV data as an array of objects
 */
export const parseCSV = (content) => {
  try {
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true // Automatically convert numeric values
    });
    
    if (result.errors && result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }
    
    return result.data;
  } catch (error) {
    throw new Error('Failed to parse CSV: ' + error.message);
  }
};

/**
 * Compares two CSV datasets
 * @param {Array} data1 - The first dataset (array of objects)
 * @param {Array} data2 - The second dataset (array of objects)
 * @returns {Object} - The comparison results
 */
export const compareCSVData = (data1, data2) => {
  // Get all unique column names from both datasets
  const allColumns = new Set();
  data1.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  data2.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  
  // Find a common identifier column (first column or 'id' or 'ID')
  let idColumn = Object.keys(data1[0] || {})[0] || ''; // Default to first column
  if (data1[0]?.id !== undefined) idColumn = 'id';
  if (data1[0]?.ID !== undefined) idColumn = 'ID';
  
  // Compare rows
  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
  
  // Create a map of the second dataset for faster lookups
  const data2Map = new Map();
  data2.forEach(row => {
    if (row[idColumn] !== undefined) {
      data2Map.set(String(row[idColumn]), row);
    }
  });
  
  // Compare each row in the first dataset
  data1.forEach(row1 => {
    const id = row1[idColumn];
    if (id === undefined) return;
    
    const row2 = data2Map.get(String(id));
    
    if (!row2) {
      // Row exists in data1 but not in data2
      for (const column of allColumns) {
        if (row1[column] !== undefined) {
          results.push({
            ID: String(id),
            COLUMN: column,
            SOURCE_1_VALUE: String(row1[column]),
            SOURCE_2_VALUE: '',
            STATUS: 'difference'
          });
          differencesFound++;
        }
      }
      return;
    }
    
    // Compare each column
    for (const column of allColumns) {
      const value1 = row1[column] !== undefined ? row1[column] : '';
      const value2 = row2[column] !== undefined ? row2[column] : '';
      
      // Skip if both values are empty
      if (value1 === '' && value2 === '') continue;
      
      // Simple equality check (can be enhanced later)
      const isMatch = String(value1) === String(value2);
      
      results.push({
        ID: String(id),
        COLUMN: column,
        SOURCE_1_VALUE: String(value1),
        SOURCE_2_VALUE: String(value2),
        STATUS: isMatch ? 'match' : 'difference'
      });
      
      if (isMatch) {
        matchesFound++;
      } else {
        differencesFound++;
      }
    }
  });
  
  // Check for rows in data2 that don't exist in data1
  const data1Ids = new Set(data1.map(row => String(row[idColumn])));
  data2.forEach(row2 => {
    const id = row2[idColumn];
    if (id !== undefined && !data1Ids.has(String(id))) {
      for (const column of allColumns) {
        if (row2[column] !== undefined) {
          results.push({
            ID: String(id),
            COLUMN: column,
            SOURCE_1_VALUE: '',
            SOURCE_2_VALUE: String(row2[column]),
            STATUS: 'difference'
          });
          differencesFound++;
        }
      }
    }
  });
  
  return {
    total_records: data1.length,
    differences_found: differencesFound,
    matches_found: matchesFound,
    results: results
  };
};

/**
 * Main function to compare two CSV files
 * @param {File} file1 - The first file
 * @param {File} file2 - The second file
 * @returns {Promise<Object>} - A promise that resolves to the comparison results
 */
export const compareFiles = async (file1, file2) => {
  try {
    // Validate file types
    if (!file1.name.toLowerCase().endsWith('.csv') || !file2.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Both files must be CSV files');
    }
    
    // Read file contents
    const content1 = await readFileAsText(file1);
    const content2 = await readFileAsText(file2);
    
    // Parse CSV data
    const data1 = parseCSV(content1);
    const data2 = parseCSV(content2);
    
    // Compare data
    return compareCSVData(data1, data2);
  } catch (error) {
    console.error('Comparison error:', error);
    throw new Error(`Comparison failed: ${error.message}`);
  }
};
