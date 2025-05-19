import Papa from 'papaparse';
import XLSX from 'xlsx';
import { diffLines, diffWords } from 'diff';

/**
 * Detects file type based on file object
 * @param {File} file - The file object to detect
 * @returns {string} - The detected file type ('csv', 'excel', 'text', 'json', or 'unknown')
 */
export const detectFileType = (file) => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return 'csv';
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return 'excel';
  } else if (fileName.endsWith('.txt')) {
    return 'text';
  } else if (fileName.endsWith('.json')) {
    return 'json';
  } else {
    // Try to detect based on content if possible
    return 'unknown';
  }
};

/**
 * Reads a file and returns its contents
 * @param {File} file - The file to read
 * @returns {Promise<string>} - A promise that resolves to the file contents
 */
export const readFileContents = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Reads an Excel file and returns its contents
 * @param {File} file - The Excel file to read
 * @returns {Promise<Array>} - A promise that resolves to the parsed Excel data
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses CSV content
 * @param {string} content - The CSV content to parse
 * @returns {Array} - The parsed CSV data
 */
export const parseCSV = (content) => {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true
  });
  
  return result.data;
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
    throw new Error('Invalid JSON format');
  }
};

/**
 * Compares two CSV or tabular datasets
 * @param {Array} data1 - The first dataset
 * @param {Array} data2 - The second dataset
 * @param {Object} options - Comparison options
 * @returns {Object} - The comparison results
 */
export const compareTabularData = (data1, data2, options = {}) => {
  const { tolerance = 0.001, caseSensitive = true } = options;
  
  // Get all unique column names from both datasets
  const allColumns = new Set();
  data1.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  data2.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
  
  // Identify potential numeric columns
  const potentialNumericColumns = [];
  for (const column of allColumns) {
    // Check if at least one value in this column is numeric
    const isNumeric = data1.some(row => {
      const value = row[column];
      return value !== undefined && !isNaN(parseFloat(value)) && isFinite(value);
    }) || data2.some(row => {
      const value = row[column];
      return value !== undefined && !isNaN(parseFloat(value)) && isFinite(value);
    });
    
    if (isNumeric) {
      potentialNumericColumns.push(column);
    }
  }
  
  // Find a common identifier column (first column or 'id' or 'ID')
  let idColumn = Object.keys(data1[0])[0]; // Default to first column
  if (data1[0].id !== undefined) idColumn = 'id';
  if (data1[0].ID !== undefined) idColumn = 'ID';
  
  // Compare rows
  const results = [];
  let differencesFound = 0;
  let withinTolerance = 0;
  
  // Create a map of the second dataset for faster lookups
  const data2Map = new Map();
  data2.forEach(row => {
    data2Map.set(row[idColumn], row);
  });
  
  // Compare each row in the first dataset
  data1.forEach(row1 => {
    const id = row1[idColumn];
    const row2 = data2Map.get(id);
    
    if (!row2) {
      // Row exists in data1 but not in data2
      for (const column of allColumns) {
        if (row1[column] !== undefined) {
          results.push({
            ID: id,
            COLUMN: column,
            SOURCE_1_VALUE: row1[column],
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
      
      // Check if this is a numeric column
      if (potentialNumericColumns.includes(column)) {
        const num1 = parseFloat(value1);
        const num2 = parseFloat(value2);
        
        if (!isNaN(num1) && !isNaN(num2)) {
          // Numeric comparison with tolerance
          const diff = Math.abs(num1 - num2);
          const relDiff = num1 !== 0 ? diff / Math.abs(num1) : diff;
          
          if (relDiff <= tolerance) {
            // Within tolerance
            results.push({
              ID: id,
              COLUMN: column,
              SOURCE_1_VALUE: value1,
              SOURCE_2_VALUE: value2,
              STATUS: 'match'
            });
            withinTolerance++;
          } else {
            // Outside tolerance
            results.push({
              ID: id,
              COLUMN: column,
              SOURCE_1_VALUE: value1,
              SOURCE_2_VALUE: value2,
              STATUS: 'difference'
            });
            differencesFound++;
          }
          continue;
        }
      }
      
      // Text comparison
      let isMatch = false;
      if (caseSensitive) {
        isMatch = value1 === value2;
      } else {
        isMatch = String(value1).toLowerCase() === String(value2).toLowerCase();
      }
      
      results.push({
        ID: id,
        COLUMN: column,
        SOURCE_1_VALUE: value1,
        SOURCE_2_VALUE: value2,
        STATUS: isMatch ? 'match' : 'difference'
      });
      
      if (!isMatch) differencesFound++;
    }
  });
  
  // Check for rows in data2 that don't exist in data1
  const data1Ids = new Set(data1.map(row => row[idColumn]));
  data2.forEach(row2 => {
    const id = row2[idColumn];
    if (!data1Ids.has(id)) {
      for (const column of allColumns) {
        if (row2[column] !== undefined) {
          results.push({
            ID: id,
            COLUMN: column,
            SOURCE_1_VALUE: '',
            SOURCE_2_VALUE: row2[column],
            STATUS: 'difference'
          });
          differencesFound++;
        }
      }
    }
  });
  
  return {
    total_records: data1.length + data2.filter(row => !data1Ids.has(row[idColumn])).length,
    differences_found: differencesFound,
    within_tolerance: withinTolerance,
    potential_numeric_columns: potentialNumericColumns,
    results: results
  };
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
      }
    });
  });
  
  return {
    total_records: Math.max(lines1.length, lines2.length),
    differences_found: differencesFound,
    within_tolerance: 0,
    potential_numeric_columns: [],
    results: results
  };
};

/**
 * Compares two JSON objects
 * @param {Object} json1 - The first JSON object
 * @param {Object} json2 - The second JSON object
 * @returns {Object} - The comparison results
 */
export const compareJSONFiles = (json1, json2) => {
  // Convert to strings for comparison
  const str1 = JSON.stringify(json1, null, 2);
  const str2 = JSON.stringify(json2, null, 2);
  
  return compareTextFiles(str1, str2);
};

/**
 * Main function to compare two files
 * @param {File} file1 - The first file
 * @param {File} file2 - The second file
 * @returns {Promise<Object>} - A promise that resolves to the comparison results
 */
export const compareFiles = async (file1, file2) => {
  try {
    const type1 = detectFileType(file1);
    const type2 = detectFileType(file2);
    
    // Check if file types match
    if (type1 !== type2) {
      throw new Error(`File types don't match: ${type1} vs ${type2}`);
    }
    
    // Process based on file type
    if (type1 === 'csv') {
      const content1 = await readFileContents(file1);
      const content2 = await readFileContents(file2);
      
      const data1 = parseCSV(content1);
      const data2 = parseCSV(content2);
      
      return compareTabularData(data1, data2);
    } else if (type1 === 'excel') {
      const data1 = await readExcelFile(file1);
      const data2 = await readExcelFile(file2);
      
      // Convert to objects with headers
      const headers = data1[0].map((header, index) => header || `Column${index + 1}`);
      
      const objData1 = data1.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : '';
        });
        return obj;
      });
      
      const objData2 = data2.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : '';
        });
        return obj;
      });
      
      return compareTabularData(objData1, objData2);
    } else if (type1 === 'text') {
      const content1 = await readFileContents(file1);
      const content2 = await readFileContents(file2);
      
      return compareTextFiles(content1, content2);
    } else if (type1 === 'json') {
      const content1 = await readFileContents(file1);
      const content2 = await readFileContents(file2);
      
      const json1 = parseJSON(content1);
      const json2 = parseJSON(content2);
      
      return compareJSONFiles(json1, json2);
    } else {
      throw new Error(`Unsupported file type: ${type1}`);
    }
  } catch (error) {
    throw new Error(`Comparison failed: ${error.message}`);
  }
};
