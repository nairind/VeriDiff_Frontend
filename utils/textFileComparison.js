import { diffLines } from 'diff';

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
 * Compares two text files line by line
 * @param {string} text1 - The first text content
 * @param {string} text2 - The second text content
 * @returns {Object} - The comparison results
 */
export const compareTextFiles = (text1, text2) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  const diff = diffLines(text1, text2);
  
  const results = [];
  let differencesFound = 0;
  let matchesFound = 0;
  let lineNumber = 0;
  
  diff.forEach((part) => {
    const lines = part.value.split('\n');
    // Remove the last empty line if the part ends with a newline
    if (part.value.endsWith('\n')) {
      lines.pop();
    }
    
    lines.forEach((line) => {
      lineNumber++;
      
      if (part.added) {
        results.push({
          ID: lineNumber.toString(),
          COLUMN: 'Line',
          SOURCE_1_VALUE: '',
          SOURCE_2_VALUE: line,
          STATUS: 'difference'
        });
        differencesFound++;
      } else if (part.removed) {
        results.push({
          ID: lineNumber.toString(),
          COLUMN: 'Line',
          SOURCE_1_VALUE: line,
          SOURCE_2_VALUE: '',
          STATUS: 'difference'
        });
        differencesFound++;
      } else {
        results.push({
          ID: lineNumber.toString(),
          COLUMN: 'Line',
          SOURCE_1_VALUE: line,
          SOURCE_2_VALUE: line,
          STATUS: 'match'
        });
        matchesFound++;
      }
    });
  });
  
  return {
    total_records: Math.max(lines1.length, lines2.length),
    differences_found: differencesFound,
    matches_found: matchesFound,
    results: results
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
    if (!file1.name.toLowerCase().endsWith('.txt') || !file2.name.toLowerCase().endsWith('.txt')) {
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
