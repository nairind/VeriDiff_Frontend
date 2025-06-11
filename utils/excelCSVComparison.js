// File: utils/excelCSVComparison.js - Enhanced Version with Fixes

import { parseExcelFile, getExcelFileInfo } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';

// FEATURE FLAGS for consistent behavior with main index
const FEATURES = {
  SHEET_SELECTION: true,         // Enable sheet selection for Excel files
  AUTO_DETECTION: true,          // Auto-detection of amount fields
  ENHANCED_EXCEL_PARSING: true   // Use enhanced Excel parsing with data extraction
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
 * ENHANCED: Get Excel file info for sheet selection (handles multiple sheets)
 */
export const getExcelCSVFileInfo = async (excelFile, csvFile) => {
  try {
    // Get comprehensive Excel file info including all sheets
    const excelInfo = await getExcelFileInfo(excelFile);
    
    return {
      excelInfo,
      csvInfo: {
        fileName: csvFile.name,
        sheets: [{ 
          name: 'CSV Data', 
          hasData: true, 
          isHidden: false,
          rowCount: 'Unknown', // CSV row count would need separate parsing
          headers: [] // Could be populated if needed
        }],
        defaultSheet: 'CSV Data'
      }
    };
  } catch (error) {
    console.error('Error getting Excel-CSV file info:', error);
    // Fallback for compatibility
    return {
      excelInfo: {
        fileName: excelFile.name,
        sheets: [{ name: 'Sheet1', hasData: true, isHidden: false }],
        defaultSheet: 'Sheet1'
      },
      csvInfo: {
        fileName: csvFile.name,
        sheets: [{ name: 'CSV Data', hasData: true, isHidden: false }],
        defaultSheet: 'CSV Data'
      }
    };
  }
};

/**
 * MODULAR: Safe Excel data extraction
 */
const safeExtractExcelData = (result) => {
  if (FEATURES.ENHANCED_EXCEL_PARSING && result && typeof result === 'object' && result.data) {
    return result.data;
  }
  // Fallback for legacy format
  return Array.isArray(result) ? result : [];
};

/**
 * Auto-detect amount fields based on name and content
 */
const isLikelyAmountField = (fieldName, sampleValues) => {
  // Check field name patterns
  const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill|salary|wage|revenue|profit|expense|budget/i;
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
 * ENHANCED: Excel-CSV comparison with sheet selection, auto-detection, and safe parsing
 */
export async function compareExcelCSVFiles(excelFile, csvFile, finalMappings = [], options = {}) {
  try {
    const { 
      selectedExcelSheet, 
      sheet1, // Alternative naming from main index
      autoDetectAmounts = true 
    } = options;

    // Determine which sheet to use (support multiple naming conventions)
    const excelSheet = selectedExcelSheet || sheet1;

    // ENHANCED: Parse Excel file with safe data extraction and sheet selection
    let excelData = [];
    try {
      if (FEATURES.ENHANCED_EXCEL_PARSING) {
        const excelResult = await parseExcelFile(excelFile, excelSheet);
        excelData = safeExtractExcelData(excelResult);
      } else {
        // Fallback parsing
        const excelResult = await parseExcelFile(excelFile, excelSheet);
        excelData = Array.isArray(excelResult) ? excelResult : (excelResult.data || []);
      }
    } catch (excelError) {
      console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
      // Fallback to basic parsing
      const excelResult = await parseExcelFile(excelFile);
      excelData = Array.isArray(excelResult) ? excelResult : (excelResult.data || []);
    }

    // Parse CSV file (this should remain stable)
    const csvData = await parseCSVFile(csvFile);

    // ENHANCED: Validate data formats
    if (!Array.isArray(excelData) || excelData.length === 0) {
      throw new Error('Excel file contains no valid data rows');
    }
    if (!Array.isArray(csvData) || csvData.length === 0) {
      throw new Error('CSV file contains no valid data rows');
    }

    // Validate data structure
    if (typeof excelData[0] !== 'object' || Array.isArray(excelData[0])) {
      throw new Error('Excel data format is not supported - expected object rows');
    }
    if (typeof csvData[0] !== 'object' || Array.isArray(csvData[0])) {
      throw new Error('CSV data format is not supported - expected object rows');
    }

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
    if (FEATURES.AUTO_DETECTION && autoDetectAmounts && excelData.length > 0) {
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
      let recordHasDifferences = false;

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
          isAutoDetectedAmount: FEATURES.AUTO_DETECTION && autoDetectAmounts && mapping?.isAmountField && !finalMappings.find(m => m.file1Header === key)?.isAmountField
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

    // ENHANCED: Return more comprehensive info
    return {
      total_records: results.length,
      differences_found: differences,
      matches_found: matches,
      results,
      autoDetectedFields: FEATURES.AUTO_DETECTION && autoDetectAmounts ? enhancedMappings.filter(m => 
        m.isAmountField && !finalMappings.find(f => f.file1Header === m.file1Header)?.isAmountField
      ).map(m => m.file1Header) : [],
      excelInfo: { 
        sheet: excelSheet || 'Sheet1', 
        totalSheets: 1, // Could be enhanced to return actual sheet count
        fileName: excelFile.name
      },
      csvInfo: { 
        fileName: csvFile.name,
        sheet: 'CSV Data'
      }
    };
  } catch (error) {
    console.error('Excel-CSV comparison error:', error);
    throw new Error(`Failed to compare Excel and CSV files: ${error.message}`);
  }
}
