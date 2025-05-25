// File: utils/excelCSVComparison.js - Enhanced Version

import { parseExcelFile, getExcelFileInfo } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

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
 * Get Excel file info for sheet selection (same as pure Excel comparison)
 */
export const getExcelCSVFileInfo = async (excelFile, csvFile) => {
  // Only Excel file has sheets, CSV is always single "sheet"
  const excelInfo = await getExcelFileInfo(excelFile);
  
  return {
    excelInfo,
    csvInfo: {
      fileName: csvFile.name,
      sheets: [{ name: 'CSV Data', hasData: true, isHidden: false }],
      defaultSheet: 'CSV Data'
    }
  };
};

/**
 * Auto-detect amount fields based on name and content
 */
const isLikelyAmountField = (fieldName, sampleValues) => {
  // Check field name patterns
  const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill/i;
  const hasNumericName = numericFieldNames.test(fieldName);
  
  // Check if values look like numbers (even as text)
  const cleanNumericValues = sampleValues.filter(val => {
    if (!val && val !== 0) return false;
    // Clean common formatting
    const cleaned = String(val).replace(/[$,\s€£¥]/g, '');
    return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
  });
  
  const percentNumeric = cleanNumericValues.length / Math.max(sampleValues.length, 1);
  
  // Auto-detect if field name suggests numbers OR >70% of values are numeric
  return hasNumericName || percentNumeric > 0.7;
};

/**
 * Enhanced Excel-CSV comparison with auto-detection and sheet selection
 */
export async function compareExcelCSVFiles(excelFile, csvFile, finalMappings = [], options = {}) {
  try {
    const { selectedExcelSheet, autoDetectAmounts = true } = options;

    // Parse Excel file with sheet selection
    const excelResult = await parseExcelFile(excelFile, selectedExcelSheet);
    const csvData = await parseCSVFile(csvFile);

    if (!Array.isArray(excelResult.data) || !Array.isArray(csvData)) {
      throw new Error('Parsed data missing or invalid');
    }

    // Use the parsed Excel data
    const excelData = excelResult.data;

    // Apply mappings to CSV data
    const remappedCSVData = csvData.map(row => {
      const remappedRow = {};
      finalMappings.forEach(mapping => {
        if (mapping.file1Header && mapping.file2Header) {
          remappedRow[mapping.file1Header] = row[mapping.file2Header] ?? '';
        }
      });
      return remappedRow;
    });

    // Auto-detect amount fields if enabled
    let enhancedMappings = finalMappings;
    if (autoDetectAmounts && excelData.length > 0) {
      enhancedMappings = finalMappings.map(mapping => {
        if (!mapping.isAmountField && mapping.file1Header) {
          // Get sample values from both datasets
          const sampleValues1 = excelData.slice(0, 10).map(row => row[mapping.file1Header]).filter(v => v != null);
          const sampleValues2 = remappedCSVData.slice(0, 10).map(row => row[mapping.file1Header]).filter(v => v != null);
          const allSamples = [...sampleValues1, ...sampleValues2];
          
          if (isLikelyAmountField(mapping.file1Header, allSamples)) {
            return {
              ...mapping,
              isAmountField: true,
              toleranceType: mapping.toleranceType || 'flat',
              toleranceValue: mapping.toleranceValue || '0.01' // Default small tolerance
            };
          }
        }
        return mapping;
      });
    }

    const results = [];
    let matches = 0;
    let differences = 0;
    const maxRows = Math.max(excelData.length, remappedCSVData.length);

    for (let i = 0; i < maxRows; i++) {
      const row1 = excelData[i] || {};
      const row2 = remappedCSVData[i] || {};
      
      // Only process fields that are in the enhanced mappings
      let keysToProcess;
      if (enhancedMappings.length > 0) {
        keysToProcess = new Set(
          enhancedMappings
            .filter(m => m.file1Header && m.file2Header)
            .map(m => m.file1Header)
        );
      } else {
        keysToProcess = new Set([...Object.keys(row1), ...Object.keys(row2)]);
      }
      
      const fieldResults = {};

      for (const key of keysToProcess) {
        const val1 = row1[key] ?? '';
        const val2 = row2[key] ?? '';
        const mapping = enhancedMappings.find(m => m.file1Header === key);

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
          difference: isNumeric(val1) && isNumeric(val2) ? Math.abs(val1 - val2).toFixed(2) : '',
          isAutoDetectedAmount: autoDetectAmounts && mapping?.isAmountField && !finalMappings.find(m => m.file1Header === key)?.isAmountField
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
      results,
      autoDetectedFields: autoDetectAmounts ? enhancedMappings.filter(m => 
        m.isAmountField && !finalMappings.find(f => f.file1Header === m.file1Header)?.isAmountField
      ).map(m => m.file1Header) : [],
      excelInfo: { sheet: excelResult.sheetName, totalSheets: excelResult.totalSheets },
      csvInfo: { fileName: csvFile.name }
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
}
