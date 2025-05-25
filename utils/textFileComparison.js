// File: utils/textFileComparison.js

/**
 * Text file comparison utility
 * Provides browser-compatible text file comparison functionality
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
 * Simple line-by-line comparison (without external diff library)
 * @param {string} text1 - The first text content
 * @param {string} text2 - The second text content
 * @returns {Object} - The comparison results in consistent format
 */
export const compareTextFiles = (text1, text2) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  const maxLines = Math.max(lines1.length, lines2.length);
  const fieldResults = {};
  let matches = 0;
  let differences = 0;
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    const lineKey = `line.${i + 1}`;
    
    let status = 'difference';
    if (line1 === line2) {
      status = 'match';
      matches++;
    } else {
      differences++;
    }
    
    fieldResults[lineKey] = {
      val1: line1,
      val2: line2,
      status: status,
      difference: ''
    };
  }
  
  return {
    total_records: 1, // Text comparison is treated as one record with multiple line fields
    differences_found: differences,
    matches_found: matches,
    results: [{
      ID: 1,
      fields: fieldResults
    }]
  };
};

/**
 * Main function to compare two text files
 * @param {File} file1 - The first file
 * @param {File} file2 - The second file
 * @returns {Promise<Object>} - A promise that resolves to the comparison results
 */
export const compareTextFiles_main = async (file1, file2) => {
  try {
    // Validate file types
    const isText1 = file1.name.toLowerCase().endsWith('.txt');
    const isText2 = file2.name.toLowerCase().endsWith('.txt');
    
    if (!isText1 || !isText2) {
      throw new Error('Both files must be text (.txt) files');
    }
    
    // Read file contents
    const content1 = await readFileAsText(file1);
    const content2 = await readFileAsText(file2);
    
    // Compare text files
    return compareTextFiles(content1, content2);
  } catch (error) {
    console.error('Text comparison error:', error);
    throw new Error(`Text comparison failed: ${error.message}`);
  }
};
