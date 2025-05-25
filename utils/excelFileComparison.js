// File: utils/excelFileComparison.js - Enhanced Version with Fix

import * as XLSX from "xlsx";

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
 * Enhanced function to get Excel file info including all sheets - FIXED VERSION
 */
export const getExcelFileInfo = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Get all sheet information
        const sheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const isHidden = workbook.Workbook?.Sheets?.find(s => s.name === sheetName)?.Hidden === 1;
          
          // FIXED: Better handling of empty sheets and range calculation
          let rowCount = 0;
          let headers = [];
          let hasData = false;
          
          try {
            // Check if worksheet has any reference range
            if (worksheet['!ref']) {
              const range = XLSX.utils.decode_range(worksheet['!ref']);
              // FIXED: Safe access to range.e
              if (range && range.e && typeof range.e.r === 'number') {
                rowCount = range.e.r + 1;
                hasData = rowCount > 1;
              } else {
                rowCount = 0;
                hasData = false;
              }
              
              // Get first few headers for preview
              const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", header: 1 });
              if (json.length > 0 && Array.isArray(json[0])) {
                headers = json[0].slice(0, 5).map(h => String(h || '').trim());
              }
            } else {
              // Empty sheet
              rowCount = 0;
              hasData = false;
              headers = [];
            }
          } catch (sheetError) {
            console.warn(`Error processing sheet ${sheetName}:`, sheetError);
            // Fallback for problematic sheets
            rowCount = 0;
            hasData = false;
            headers = [];
          }
          
          return {
            name: sheetName,
            isHidden,
            rowCount,
            headers,
            hasData
          };
        });

        resolve({
          fileName: file.name,
          sheets: sheets,
          defaultSheet: sheets.find(s => !s.isHidden && s.hasData)?.name || sheets[0]?.name
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Enhanced Excel parsing with sheet selection and cell cleanup
 */
export const parseExcelFile = (file, selectedSheet = null) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Determine which sheet to use
        let sheetName = selectedSheet;
        if (!sheetName) {
          // Auto-select: first visible sheet with data, or just first sheet
          const visibleSheetsWithData = workbook.SheetNames.filter(name => {
            const isHidden = workbook.Workbook?.Sheets?.find(s => s.name === name)?.Hidden === 1;
            const worksheet = workbook.Sheets[name];
            
            // FIXED: Safe range checking
            let hasData = false;
            try {
              if (worksheet['!ref']) {
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                hasData = range.e && range.e.r > 0; // More than just header row
              }
            } catch (error) {
              console.warn(`Error checking sheet ${name}:`, error);
              hasData = false;
            }
            
            return !isHidden && hasData;
          });
          
          sheetName = visibleSheetsWithData[0] || workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error(`Sheet "${sheetName}" not found`);
        }

        // Parse with enhanced cleaning
        const json = XLSX.utils.sheet_to_json(worksheet, { 
          defval: "",
          raw: false, // Convert everything to strings first for consistent cleaning
          dateNF: 'yyyy-mm-dd' // Standardize date format
        });

        // Clean and process the data
        const cleanedData = json.map(row => {
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            // Clean header names (remove padding, normalize)
            const cleanKey = String(key).trim().replace(/\s+/g, ' ');
            
            // Clean cell values
            let cleanValue = row[key];
            if (typeof cleanValue === 'string') {
              cleanValue = cleanValue.trim();
              // Handle special cases
              if (cleanValue === '') cleanValue = '';
              // Remove non-breaking spaces and other hidden characters
              cleanValue = cleanValue.replace(/[\u00A0\u2000-\u200B\u2028-\u2029]/g, ' ').trim();
            }
            
            cleanedRow[cleanKey] = cleanValue;
          });
          return cleanedRow;
        });

        resolve({
          data: cleanedData,
          sheetName: sheetName,
          totalSheets: workbook.SheetNames.length
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
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
 * Enhanced comparison with auto-tolerance detection
 */
const compareExcelData = (data1, data2, finalMappings = [], autoDetectAmounts = true) => {
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

  // Auto-detect amount fields if enabled
  let enhancedMappings = finalMappings;
  if (autoDetectAmounts && data1.length > 0) {
    enhancedMappings = finalMappings.map(mapping => {
      if (!mapping.isAmountField && mapping.file1Header) {
        // Get sample values from both datasets
        const sampleValues1 = data1.slice(0, 10).map(row => row[mapping.file1Header]).filter(v => v != null);
        const sampleValues2 = remappedData2.slice(0, 10).map(row => row[mapping.file1Header]).filter(v => v != null);
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
  const maxRows = Math.max(data1.length, remappedData2.length);

  for (let i = 0; i < maxRows; i++) {
    const row1 = data1[i] || {};
    const row2 = remappedData2[i] || {};
    
    // Only process fields that are in the final mappings
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
    ).map(m => m.file1Header) : []
  };
};

/**
 * Main Excel comparison function with enhanced features
 */
export const compareExcelFiles = async (file1, file2, finalMappings = [], options = {}) => {
  try {
    const { sheet1, sheet2, autoDetectAmounts = true } = options;
    
    const [result1, result2] = await Promise.all([
      parseExcelFile(file1, sheet1),
      parseExcelFile(file2, sheet2),
    ]);

    if (!Array.isArray(result1.data) || !Array.isArray(result2.data)) {
      throw new Error('Parsed data missing or invalid');
    }

    const comparison = compareExcelData(result1.data, result2.data, finalMappings, autoDetectAmounts);
    
    return {
      ...comparison,
      file1Info: { sheet: result1.sheetName, totalSheets: result1.totalSheets },
      file2Info: { sheet: result2.sheetName, totalSheets: result2.totalSheets }
    };
  } catch (error) {
    throw new Error(`Failed to compare Excel files: ${error.message}`);
  }
};
