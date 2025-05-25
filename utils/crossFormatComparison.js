// File: utils/crossFormatComparison.js - Modular Cross-Format System

import { parseExcelFile } from './excelFileComparison';
import { parseCSVFile } from './simpleCSVComparison';
import { parseJSONFile } from './jsonFileComparison';
import { parseXMLFile } from './xmlFileComparison';
import { parsePDFFile } from './pdfFileComparison';

/**
 * FILE TYPE DETECTION REGISTRY
 * Easily extensible for new formats
 */
const FILE_TYPE_PATTERNS = {
  excel: {
    extensions: ['.xlsx', '.xls', '.xlsm'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    parser: parseExcelFile,
    label: 'Excel'
  },
  csv: {
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/csv'],
    parser: parseCSVFile,
    label: 'CSV'
  },
  json: {
    extensions: ['.json'],
    mimeTypes: ['application/json'],
    parser: parseJSONFile,
    label: 'JSON'
  },
  xml: {
    extensions: ['.xml'],
    mimeTypes: ['application/xml', 'text/xml'],
    parser: parseXMLFile,
    label: 'XML'
  },
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    parser: parsePDFFile,
    label: 'PDF'
  }
  // FUTURE: Easy to add new formats here
  // word: { extensions: ['.docx'], parser: parseWordFile, label: 'Word' },
  // powerpoint: { extensions: ['.pptx'], parser: parsePPTFile, label: 'PowerPoint' }
};

/**
 * SUPPORTED CROSS-FORMAT COMBINATIONS
 * Define which format combinations are supported
 */
const CROSS_FORMAT_COMBINATIONS = {
  'excel_csv': {
    formats: ['excel', 'csv'],
    bidirectional: true, // Can be Excel->CSV or CSV->Excel
    label: 'Excel ↔ CSV'
  },
  
  // FUTURE: Easy to add new combinations
  // 'excel_json': {
  //   formats: ['excel', 'json'],
  //   bidirectional: true,
  //   label: 'Excel ↔ JSON'
  // },
  // 'csv_json': {
  //   formats: ['csv', 'json'],
  //   bidirectional: true,
  //   label: 'CSV ↔ JSON'
  // }
};

/**
 * AUTO-DETECT FILE TYPE
 * Smart detection based on extension and MIME type
 */
export const detectFileType = (file) => {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  for (const [type, config] of Object.entries(FILE_TYPE_PATTERNS)) {
    // Check extension match
    const extensionMatch = config.extensions.some(ext => fileName.endsWith(ext));
    // Check MIME type match
    const mimeMatch = config.mimeTypes.some(mime => mimeType === mime);
    
    if (extensionMatch || mimeMatch) {
      return {
        type,
        config,
        confidence: extensionMatch && mimeMatch ? 'high' : extensionMatch ? 'medium' : 'low'
      };
    }
  }
  
  return { type: 'unknown', config: null, confidence: 'none' };
};

/**
 * VALIDATE CROSS-FORMAT COMBINATION
 * Check if the file combination is supported
 */
export const validateCrossFormatCombination = (file1, file2, expectedCombination) => {
  console.log(`🔍 Validating cross-format combination: ${expectedCombination}`);
  
  const file1Type = detectFileType(file1);
  const file2Type = detectFileType(file2);
  
  console.log(`📁 File 1 (${file1.name}) detected as: ${file1Type.type} (${file1Type.confidence} confidence)`);
  console.log(`📁 File 2 (${file2.name}) detected as: ${file2Type.type} (${file2Type.confidence} confidence)`);
  
  const combination = CROSS_FORMAT_COMBINATIONS[expectedCombination];
  if (!combination) {
    return {
      valid: false,
      error: `❌ Unsupported combination: ${expectedCombination}`,
      detected: null
    };
  }
  
  const supportedFormats = combination.formats;
  const detectedFormats = [file1Type.type, file2Type.type];
  
  console.log(`✅ Expected formats: ${supportedFormats.join(' + ')}`);
  console.log(`🔍 Detected formats: ${detectedFormats.join(' + ')}`);
  
  // Check if detected formats match supported formats (order-independent)
  const isValidCombination = supportedFormats.every(format => detectedFormats.includes(format)) &&
                            detectedFormats.every(format => supportedFormats.includes(format)) &&
                            supportedFormats.length === detectedFormats.length;
  
  if (!isValidCombination) {
    const expectedLabel = combination.label;
    const actualLabel = `${file1Type.config?.label || 'Unknown'} + ${file2Type.config?.label || 'Unknown'}`;
    
    return {
      valid: false,
      error: `❌ Invalid file combination!\n\nExpected: ${expectedLabel}\nReceived: ${actualLabel}\n\nPlease upload one Excel file and one CSV file.`,
      detected: { file1: file1Type, file2: file2Type }
    };
  }
  
  console.log(`✅ Valid combination confirmed!`);
  
  return {
    valid: true,
    file1Type,
    file2Type,
    combination,
    detected: { file1: file1Type, file2: file2Type }
  };
};

/**
 * SAFE DATA EXTRACTION
 * Handle different parser return formats consistently
 */
const safeExtractData = (result, fileName) => {
  if (result && typeof result === 'object' && result.data) {
    return result.data;
  } else if (Array.isArray(result)) {
    return result;
  } else {
    console.warn(`⚠️ Unexpected data format from ${fileName}:`, result);
    return result;
  }
};

/**
 * FLEXIBLE CROSS-FORMAT PARSER
 * Automatically handles file order and parsing
 */
export const parseFilesFlexibly = async (file1, file2, expectedCombination, options = {}) => {
  console.log(`🚀 Starting flexible cross-format parsing: ${expectedCombination}`);
  
  // Validate the combination first
  const validation = validateCrossFormatCombination(file1, file2, expectedCombination);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const { file1Type, file2Type } = validation;
  
  // Parse files with appropriate parsers
  const parseWithOptions = async (file, type, fileOptions) => {
    const parser = type.config.parser;
    console.log(`📊 Parsing ${type.config.label} file: ${file.name}`);
    
    try {
      let result;
      
      // Handle different parser signatures
      if (type.type === 'excel' && fileOptions) {
        result = await parser(file, fileOptions); // Excel with sheet selection
      } else {
        result = await parser(file); // Standard parsing
      }
      
      console.log(`✅ ${type.config.label} parsing successful`);
      
      // Standardize data extraction
      const data = safeExtractData(result, file.name);
      
      return { 
        data, 
        metadata: result && typeof result === 'object' ? result : { fileName: file.name }
      };
    } catch (error) {
      console.error(`❌ Error parsing ${type.config.label} file:`, error);
      throw new Error(`Failed to parse ${type.config.label} file (${file.name}): ${error.message}`);
    }
  };
  
  // Parse both files
  console.log(`🔄 Parsing files...`);
  const [result1, result2] = await Promise.all([
    parseWithOptions(file1, file1Type, options.file1Options),
    parseWithOptions(file2, file2Type, options.file2Options)
  ]);
  
  // Validate parsed data
  if (!Array.isArray(result1.data) || result1.data.length === 0) {
    throw new Error(`File 1 (${file1.name}) contains no valid data rows`);
  }
  if (!Array.isArray(result2.data) || result2.data.length === 0) {
    throw new Error(`File 2 (${file2.name}) contains no valid data rows`);
  }
  
  console.log(`✅ Flexible parsing completed successfully!`);
  console.log(`📊 File 1 data: ${result1.data.length} rows`);
  console.log(`📊 File 2 data: ${result2.data.length} rows`);
  
  // Return standardized format with metadata
  return {
    file1: {
      type: file1Type.type,
      label: file1Type.config.label,
      data: result1.data,
      metadata: result1.metadata,
      fileName: file1.name
    },
    file2: {
      type: file2Type.type,
      label: file2Type.config.label,
      data: result2.data,
      metadata: result2.metadata,
      fileName: file2.name
    },
    combination: expectedCombination,
    detectedCombination: `${file1Type.type}_${file2Type.type}`
  };
};

/**
 * SMART HEADER EXTRACTION
 * Extract headers regardless of file format
 */
export const extractHeaders = (data, fileType) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn(`⚠️ No data available for header extraction (${fileType})`);
    return [];
  }
  
  const firstRow = data[0];
  if (typeof firstRow === 'object' && !Array.isArray(firstRow)) {
    const headers = Object.keys(firstRow);
    console.log(`📋 Extracted ${headers.length} headers from ${fileType}:`, headers);
    return headers;
  }
  
  // Handle other data structures if needed
  console.warn(`⚠️ Unexpected data structure for ${fileType}:`, firstRow);
  return [];
};

/**
 * GET SUPPORTED COMBINATIONS
 * For UI display and validation
 */
export const getSupportedCombinations = () => {
  return Object.entries(CROSS_FORMAT_COMBINATIONS).map(([key, config]) => ({
    key,
    label: config.label,
    formats: config.formats,
    bidirectional: config.bidirectional
  }));
};

/**
 * MAIN FLEXIBLE COMPARISON FUNCTION
 * Entry point for all cross-format comparisons
 */
export const compareFilesFlexibly = async (file1, file2, expectedCombination, finalMappings = [], options = {}) => {
  console.log(`🎯 Starting flexible comparison: ${expectedCombination}`);
  
  try {
    // Parse files flexibly
    const parsedResult = await parseFilesFlexibly(file1, file2, expectedCombination, options);
    
    // Extract data and headers
    const data1 = parsedResult.file1.data;
    const data2 = parsedResult.file2.data;
    const headers1 = extractHeaders(data1, parsedResult.file1.type);
    const headers2 = extractHeaders(data2, parsedResult.file2.type);
    
    console.log(`🎯 Flexible comparison setup complete`);
    
    return {
      parseResult: parsedResult,
      headers1,
      headers2,
      data1,
      data2,
      // Future: Add actual comparison logic here
    };
    
  } catch (error) {
    console.error(`❌ Flexible comparison failed:`, error);
    throw new Error(`Cross-format comparison failed: ${error.message}`);
  }
};

// EXPORT ALL UTILITIES
export {
  FILE_TYPE_PATTERNS,
  CROSS_FORMAT_COMBINATIONS
};
