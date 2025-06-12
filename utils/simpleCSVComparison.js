// File: utils/simpleCSVComparison.js

import Papa from 'papaparse';

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

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

export const parseCSVFile = async (file) => {
  const content = await readFileAsText(file);
  return parseCSV(content);
};

const isNumeric = (val) => {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

const compareWithTolerance = (val1, val2, tolerance, type) => {
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
};

export const compareFiles = async (file1, file2, finalMappings = []) => {
  const [data1, data2] = await Promise.all([
    parseCSVFile(file1),
    parseCSVFile(file2)
  ]);

  const remappedData2 = data2.map(row => {
    const remapped = {};
    finalMappings.forEach(({ file1Header, file2Header }) => {
      remapped[file1Header] = row[file2Header] ?? '';
    });
    return remapped;
  });

  const results = [];
  let matches = 0;
  let differences = 0;
  const maxRows = Math.max(data1.length, remappedData2.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = remappedData2[i] || {};
    
    // FIXED: Only process fields that are in the final mappings
    let keysToProcess;
    if (finalMappings.length > 0) {
      // Only process mapped fields
      keysToProcess = new Set(
        finalMappings
          .filter(m => m.file1Header && m.file2Header)
          .map(m => m.file1Header)
      );
    } else {
      // Fallback: process all available keys
      keysToProcess = new Set([...Object.keys(row1), ...Object.keys(row2)]);
    }
    
    const fieldResults = {};
    let recordHasDifferences = false;

    for (const key of keysToProcess) {
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
        difference: isNumeric(val1) && isNumeric(val2)
          ? Math.abs(parseFloat(val1) - parseFloat(val2)).toFixed(2)
          : ''
      };

      if (status !== 'match' && status !== 'acceptable') {
        recordHasDifferences = true;
      }
    }

    // Count at record level
    if (recordHasDifferences) {
      differences++;
    } else {
      matches++;
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
