.container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          padding: 60px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          margin-bottom: 50px;
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .hero-title {
          margin: 0 0 20px 0;
          font-size: 3.5em;
          font-weight: 700;
          line-height: 1.1;
        }

        .gradient-text {
          background: linear-gradient(45deg, #ffffff, #e3f2fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .hero-subtitle {
          display: block;
          font-size: 0.6em;
          opacity: 0.9;
          font-weight: 400;
          margin-top: 10px;
        }

        .hero-description {
          font-size: 1.3em;
          opacity: 0.9;
          line-height: 1.6;
          margin: 0 0 30px 0;
        }

        .hero-badges {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .badge {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.9em;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Section Styling */
        .comparison-section, .upload-section {
          background: white;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          font-size: 2.2em;
          color: #1f2937;
          margin: 0 0 15px 0;
          text-align: center;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 1.1em;
          color: #6b7280;
          text-align: center;
          margin: 0 0 40px 0;
          line-height: 1.5;
        }

        /* File Type Grid */
        .file-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .file-type-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: block;
        }

        .file-type-card input[type="radio"] {
          display: none;
        }

        .file-type-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .file-type-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .file-type-card.featured {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
        }

        .file-type-card.featured.selected {
          background: linear-gradient(135deg, #d97706, #ea580c);
        }

        .card-icon {
          font-size: 2.5em;
          margin-bottom: 15px;
          display: block;
        }

        .card-title {
          font-size: 1.2em;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .card-description {
          font-size: 0.9em;
          opacity: 0.8;
          line-height: 1.4;
        }

        .featured-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 0.7em;
          padding: 4px 8px;
          border-radius: 10px;
          font-weight: 600;
        }

        /* Enhanced File Order Guidance */
        .file-order-guidance.enhanced {
          background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
          border: 2px solid #2196f3;
          border-radius: 16px;
          padding: 30px;
          margin: 30px 0;
        }

        .guidance-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .guidance-header h3 {
          color: #1976d2;
          margin: 0 0 10px 0;
          font-size: 1.4em;
          font-weight: 700;
        }

        .guidance-header p {
          color: #1565c0;
          margin: 0;
          font-size: 1em;
        }

        .order-instruction {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          margin: 30px 0;
          flex-wrap: wrap;
        }

        .file-slot {
          background: white;
          padding: 25px;
          border-radius: 12px;
          border: 2px solid #2196f3;
          min-width: 220px;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.1);
        }

        .excel-slot {
          border-color: #4caf50;
        }

        .csv-slot {
          border-color: #ff9800;
        }

        .slot-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .slot-number {
          background: #2196f3;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2em;
        }

        .excel-slot .slot-number {
          background: #4caf50;
        }

        .csv-slot .slot-number {
          background: #ff9800;
        }

        .slot-info {
          flex: 1;
        }

        .slot-title {
          font-weight: 600;
          color: #1976d2;
          font-size: 1.1em;
        }

        .slot-formats {
          font-size: 0.85em;
          color: #666;
          margin-top: 2px;
        }

        .slot-icon {
          font-size: 2em;
          text-align: center;
        }

        .arrow-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .arrow {
          font-size: 2em;
          color: #2196f3;
          font-weight: bold;
        }

        .then-text {
          font-size: 0.8em;
          color: #666;
          font-weight: 500;
        }

        .guidance-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin-top: 25px;
        }

        .note-icon {
          font-size: 1.2em;
          flex-shrink: 0;
        }

        .note-text {
          color: #856404;
          font-size: 0.95em;
          line-height: 1.4;
        }

        /* Enhanced File Inputs */
        .excel-csv-file-inputs.enhanced {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 30px 0;
        }

        .file-input-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .input-number {
          background: #667eea;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1em;
        }

        .input-info {
          flex: 1;
        }

        .input-title {
          font-size: 1.2em;
          font-weight: 600;
          color: #1f2937;
        }

        .input-subtitle {
          font-size: 0.9em;
          color: #6b7280;
        }

        .file-input-label.enhanced {
          display: block;
          cursor: pointer;
        }

        .file-input-area {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 30px 20px;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .file-input-area:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .upload-icon {
          font-size: 2.5em;
          margin-bottom: 15px;
          display: block;
        }

        .file-selected {
          color: #059669;
        }

        .file-name {
          font-weight: 600;
          font-size: 1em;
          margin-bottom: 5px;
        }

        .file-size {
          font-size: 0.85em;
          opacity: 0.7;
        }

        .file-placeholder {
          color: #6b7280;
        }

        .placeholder-main {
          font-weight: 500;
          font-size: 1em;
          margin-bottom: 5px;
        }

        .placeholder-sub {
          font-size: 0.85em;
          opacity: 0.7;
        }

        .file-input {
          display: none;
        }

        /* Standard File Inputs */
        .standard-file-inputs {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 30px 0;
        }

        .file-input-group.standard {
          flex: 1;
          min-width: 250px;
          max-width: 400px;
        }

        .file-input-label.standard {
          display: block;
          cursor: pointer;
        }

        .file-input-area.standard {
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          background: white;
        }

        .file-input-area.standard:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        /* Load Files Button */
        .load-files-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-size: 1.2em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 30px auto 0;
          min-width: 280px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .load-files-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .load-files-button.disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .load-files-button.loading {
          background: #6b7280;
          cursor: wait;
        }

        .button-icon {
          font-size: 1.1em;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles, getExcelFileInfo } from '../utils/excelFileComparison';
import { parseJSONFile, compareJSONFiles } from '../utils/jsonFileComparison';
import { parseXMLFile, compareXMLFiles } from '../utils/xmlFileComparison';
import { parsePDFFile, comparePDFFiles } from '../utils/pdfFileComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import HeaderMapper from '../components/HeaderMapper';
import SheetSelector from '../components/SheetSelector';  // ENABLED: Now importing SheetSelector
import { mapHeaders } from '../utils/mapHeaders';
import { downloadResultsAsExcel, downloadResultsAsCSV } from '../utils/downloadResults';

// FEATURE FLAGS - easily disable problematic features
const FEATURES = {
  SHEET_SELECTION: true,         // ENABLED: SheetSelector is ready to test
  AUTO_DETECTION: true,          // Auto-detection of amount fields
  AUTO_RERUN: true,             // Auto-rerun functionality
  ENHANCED_EXCEL_PARSING: true,  // Use enhanced Excel parsing with data extraction
  FLEXIBLE_CROSS_FORMAT: true   // NEW: Use flexible cross-format comparison
};

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('csv');

  // Core states (always present)
  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleData1, setSampleData1] = useState(null);
  const [sampleData2, setSampleData2] = useState(null);

  // Optional states (only used if features enabled)
  const [file1Info, setFile1Info] = useState(null);
  const [file2Info, setFile2Info] = useState(null);
  const [selectedSheet1, setSelectedSheet1] = useState(null);
  const [selectedSheet2, setSelectedSheet2] = useState(null);
  const [showSheetSelector, setShowSheetSelector] = useState(false);

  // INLINE FILE DETECTION (inside component)
  const detectFileTypeInline = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.xlsm')) {
      return { type: 'excel', label: 'Excel' };
    }
    if (fileName.endsWith('.csv')) {
      return { type: 'csv', label: 'CSV' };
    }
    if (fileName.endsWith('.json')) {
      return { type: 'json', label: 'JSON' };
    }
    if (fileName.endsWith('.txt')) {
      return { type: 'text', label: 'Text' };
    }
    
    return { type: 'unknown', label: 'Unknown' };
  };

  // ENFORCED FILE ORDER VALIDATION - Simple and Clear
  const validateExcelCSVOrder = (file1, file2) => {
    const file1Type = detectFileTypeInline(file1);
    const file2Type = detectFileTypeInline(file2);
    
    console.log(`🔍 File 1 (${file1.name}) detected as: ${file1Type.type}`);
    console.log(`🔍 File 2 (${file2.name}) detected as: ${file2Type.type}`);
    
    // STRICT: File 1 must be Excel, File 2 must be CSV
    if (file1Type.type !== 'excel') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 1 must be an Excel file (.xlsx, .xls)\nYou uploaded: ${file1Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    if (file2Type.type !== 'csv') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 2 must be a CSV file (.csv)\nYou uploaded: ${file2Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    console.log("✅ Correct file order: Excel → CSV");
    return {
      valid: true,
      excelFile: file1,
      csvFile: file2
    };
  };

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
    setShowMapper(false);
    
    // Reset optional states
    if (FEATURES.SHEET_SELECTION) {
      setShowSheetSelector(false);
      setFile1Info(null);
      setFile2Info(null);
    }
  };

  // LEGACY EXCEL-CSV PARSING FUNCTION (fallback)
  const legacyExcelCSVParsing = async () => {
    console.log("Using legacy Excel-CSV parsing...");
    let data1 = [], data2 = []; // Declare variables in function scope
    
    try {
      if (FEATURES.SHEET_SELECTION) {
        const excelInfo = await getExcelFileInfo(file1);
        setFile1Info(excelInfo);
        
        if (excelInfo.sheets.length > 1) {
          setShowSheetSelector(true);
          setLoading(false);
          return { data1: [], data2: [] }; // Return empty data to continue flow
        }
        
        const result1 = await parseExcelFile(file1, excelInfo.defaultSheet);
        data1 = safeExtractExcelData(result1);
      } else {
        const result1 = await parseExcelFile(file1);
        data1 = safeExtractExcelData(result1);
      }
    } catch (excelError) {
      console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
      const result1 = await parseExcelFile(file1);
      data1 = Array.isArray(result1) ? result1 : (result1.data || []);
    }
    
    data2 = await parseCSVFile(file2);
    return { data1, data2 }; // Return the parsed data
  };

  // MODULAR: Safe Excel data extraction
  const safeExtractExcelData = (result) => {
    if (FEATURES.ENHANCED_EXCEL_PARSING && result && typeof result === 'object' && result.data) {
      return result.data;
    }
    // Fallback for legacy format
    return Array.isArray(result) ? result : [];
  };

  // MODULAR: Safe data validation (can be disabled if causing issues)
  const validateDataFormat = (data1, data2) => {
    if (!FEATURES.ENHANCED_EXCEL_PARSING) return; // Skip validation if feature disabled
    
    if (!Array.isArray(data1) || data1.length === 0) {
      throw new Error('File 1 contains no valid data rows');
    }
    if (!Array.isArray(data2) || data2.length === 0) {
      throw new Error('File 2 contains no valid data rows');
    }
    
    if (typeof data1[0] !== 'object' || Array.isArray(data1[0])) {
      throw new Error('File 1 data format is not supported - expected object rows');
    }
    if (typeof data2[0] !== 'object' || Array.isArray(data2[0])) {
      throw new Error('File 2 data format is not supported - expected object rows');
    }
  };

  // MODULAR: Sheet selection handler (only if feature enabled)
  const handleSheetSelect = (sheet1, sheet2) => {
    if (!FEATURES.SHEET_SELECTION) return;
    setSelectedSheet1(sheet1);
    setSelectedSheet2(sheet2);
  };

  const handleLoadFiles = async () => {
    console.log("🚀 handleLoadFiles started");
    console.log("📁 File 1:", file1?.name);
    console.log("📁 File 2:", file2?.name);
    console.log("🎯 File type:", fileType);
    
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = []; // FIXED: Properly declare variables
      
      if (fileType === 'excel_csv') {
        console.log("📊 Processing Excel-CSV combination");
        console.log("🔧 FLEXIBLE_CROSS_FORMAT feature:", FEATURES.FLEXIBLE_CROSS_FORMAT);
        
        if (FEATURES.FLEXIBLE_CROSS_FORMAT) {
          console.log("✅ Using flexible cross-format system");
          
          try {
            console.log("🔍 Starting file validation...");
            
            // Use strict order validation
            const validation = validateExcelCSVOrder(file1, file2);
            console.log("🔍 Validation result:", validation);
            
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            console.log("✅ File validation passed");
            
            // Parse files in the REQUIRED order: Excel first, CSV second
            console.log("📊 Parsing Excel file (File 1):", validation.excelFile.name);
            const excelResult = await parseExcelFile(validation.excelFile, selectedSheet1);
            data1 = safeExtractExcelData(excelResult);
            
            console.log("📊 Parsing CSV file (File 2):", validation.csvFile.name);
            data2 = await parseCSVFile(validation.csvFile);
            
            console.log("📊 Final data1 length:", data1?.length);
            console.log("📊 Final data2 length:", data2?.length);
            
          } catch (flexibleError) {
            console.warn("❌ Flexible cross-format failed:", flexibleError);
            console.log("🔄 Falling back to legacy approach");
            
            // Fallback to original logic
            const legacyResult = await legacyExcelCSVParsing();
            data1 = legacyResult.data1;
            data2 = legacyResult.data2;
          }
        } else {
          console.log("🔄 Using legacy approach (feature disabled)");
          // Original logic as fallback
          const legacyResult = await legacyExcelCSVParsing();
          data1 = legacyResult.data1;
          data2 = legacyResult.data2;
        }
        
      } else if (fileType === 'csv') {
        data1 = await parseCSVFile(file1);
        data2 = await parseCSVFile(file2);
        
      } else if (fileType === 'excel') {
        // MODULAR: Enhanced Excel-Excel comparison
        try {
          if (FEATURES.SHEET_SELECTION) {
            const [excelInfo1, excelInfo2] = await Promise.all([
              getExcelFileInfo(file1),
              getExcelFileInfo(file2)
            ]);
            setFile1Info(excelInfo1);
            setFile2Info(excelInfo2);
            
            if (excelInfo1.sheets.length > 1 || excelInfo2.sheets.length > 1) {
              setShowSheetSelector(true);
              setLoading(false);
              return;
            }
            
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1, excelInfo1.defaultSheet),
              parseExcelFile(file2, excelInfo2.defaultSheet)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          } else {
            // Fallback: simple Excel parsing
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1),
              parseExcelFile(file2)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          }
        } catch (excelError) {
          console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
          const [result1, result2] = await Promise.all([
            parseExcelFile(file1),
            parseExcelFile(file2)
          ]);
          data1 = Array.isArray(result1) ? result1 : (result1.data || []);
          data2 = Array.isArray(result2) ? result2 : (result2.data || []);
        }
        
      } else if (fileType === 'json') {
        data1 = await parseJSONFile(file1);
        data2 = await parseJSONFile(file2);
      } else if (fileType === 'xml') {
        data1 = await parseXMLFile(file1);
        data2 = await parseXMLFile(file2);
      } else if (fileType === 'pdf') {
        data1 = await parsePDFFile(file1);
        data2 = await parsePDFFile(file2);
      } else if (fileType === 'text') {
        // Text files bypass header mapping
        const result = await compareTextFiles_main(file1, file2);
        setResults(result);
        setLoading(false);
        return;
      } else {
        throw new Error('Unsupported file type.');
      }
      
      // MODULAR: Safe data validation
      try {
        validateDataFormat(data1, data2);
      } catch (validationError) {
        console.warn('Data validation warning:', validationError.message);
        // Continue anyway for backwards compatibility
      }
      
      // Setup header mapping (existing functionality)
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      
    } catch (err) {
      console.error('File loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // MODULAR: Sheet selection continuation (only if feature enabled)
  const handleProceedWithSheets = async () => {
    if (!FEATURES.SHEET_SELECTION) return;
    
    if (!selectedSheet1 || (fileType === 'excel' && !selectedSheet2)) {
      setError('Please select sheets for both files.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        const result1 = await parseExcelFile(file1, selectedSheet1);
        data1 = safeExtractExcelData(result1);
        data2 = await parseCSVFile(file2);
      } else if (fileType === 'excel') {
        const [result1, result2] = await Promise.all([
          parseExcelFile(file1, selectedSheet1),
          parseExcelFile(file2, selectedSheet2)
        ]);
        data1 = safeExtractExcelData(result1);
        data2 = safeExtractExcelData(result2);
      }
      
      // Setup header mapping
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      setShowSheetSelector(false);
      
    } catch (err) {
      console.error('Sheet processing error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  const handleDownloadExcel = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.xlsx`;
      downloadResultsAsExcel(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.csv`;
      downloadResultsAsCSV(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRunComparison = async () => {
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Missing files or mappings.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // MODULAR: Build options only if features are enabled
      const options = {};
      if (FEATURES.SHEET_SELECTION) {
        options.sheet1 = selectedSheet1;
        options.sheet2 = selectedSheet2;
      }
      if (FEATURES.AUTO_DETECTION) {
        options.autoDetectAmounts = true;
      }
      
      // Call appropriate comparison function
      if (fileType === 'excel_csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else if (fileType === 'excel') {
        result = await compareExcelFiles(file1, file2, finalMappings, options);
      } else if (fileType === 'json') {
        result = await compareJSONFiles(file1, file2, finalMappings);
      } else if (fileType === 'xml') {
        result = await compareXMLFiles(file1, file2, finalMappings);
      } else if (fileType === 'pdf') {
        result = await comparePDFFiles(file1, file2, finalMappings);
      } else if (fileType === 'text') {
        result = await compareTextFiles_main(file1, file2);
      } else if (fileType === 'csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      }
      
      setResults(result);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
      </Head>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#667eea'
          }}>VeriDiff</span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/about">
              <span style={{ 
                color: '#FF6B35', 
                cursor: 'pointer', 
                textDecoration: 'none',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                📖 <strong>MUST READ</strong> - About
              </span>
            </Link>
            <span style={{ color: '#667eea', fontWeight: '500' }}>Compare Files</span>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">VeriDiff</span>
              <span className="hero-subtitle">Smart File Comparison</span>
            </h1>
            <p className="hero-description">
              Compare documents with precision and confidence. From Excel to PDFs, 
              VeriDiff handles your most critical file comparisons with professional-grade accuracy.
            </p>
            <div className="hero-badges">
              <span className="badge">🔒 100% Private</span>
              <span className="badge">⚡ Instant Results</span>
              <span className="badge">🎯 Smart Mapping</span>
            </div>
          </div>
        </div>

        {/* File Type Selection */}
        <div className="comparison-section">
          <h2 className="section-title">Choose Your Comparison Type</h2>
          <p className="section-subtitle">Select the file formats you want to compare</p>
          
          <div className="file-type-grid">
            <label className={`file-type-card ${fileType === 'csv' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} />
              <div className="card-icon">📄</div>
              <div className="card-title">CSV</div>
              <div className="card-description">Compare CSV spreadsheets</div>
            </label>
            
            <label className={`file-type-card ${fileType === 'text' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} />
              <div className="card-icon">📝</div>
              <div className="card-title">Text Files</div>
              <div className="card-description">Line-by-line text comparison</div>
            </label>
            
            <label className={`file-type-card ${fileType === 'json' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} />
              <div className="card-icon">🔗</div>
              <div className="card-title">JSON</div>
              <div className="card-description">Structured data comparison</div>
            </label>
            
            <label className={`file-type-card ${fileType === 'xml' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="xml" checked={fileType === 'xml'} onChange={handleFileTypeChange} />
              <div className="card-icon">📋</div>
              <div className="card-title">XML</div>
              <div className="card-description">Markup document comparison</div>
            </label>
            
            <label className={`file-type-card ${fileType === 'pdf' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="pdf" checked={fileType === 'pdf'} onChange={handleFileTypeChange} />
              <div className="card-icon">📑</div>
              <div className="card-title">PDF</div>
              <div className="card-description">Document text comparison</div>
            </label>
            
            <label className={`file-type-card ${fileType === 'excel' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} />
              <div className="card-icon">📊</div>
              <div className="card-title">Excel</div>
              <div className="card-description">Spreadsheet comparison</div>
            </label>
            
            <label className={`file-type-card featured ${fileType === 'excel_csv' ? 'selected' : ''}`}>
              <input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} />
              <div className="card-icon">⭐</div>
              <div className="card-title">Excel–CSV</div>
              <div className="card-description">Cross-format comparison</div>
              <div className="featured-badge">Most Popular</div>
            </label>
          </div>
        </div>

        {/* FILE ORDER GUIDANCE - Enhanced Design */}
        {fileType === 'excel_csv' && (
          <div className="file-order-guidance enhanced">
            <div className="guidance-header">
              <h3>📋 File Upload Instructions</h3>
              <p>Please upload your files in the correct order for accurate comparison</p>
            </div>
            <div className="order-instruction">
              <div className="file-slot excel-slot">
                <div className="slot-header">
                  <span className="slot-number">1</span>
                  <div className="slot-info">
                    <div className="slot-title">Excel File First</div>
                    <div className="slot-formats">.xlsx • .xls • .xlsm</div>
                  </div>
                </div>
                <div className="slot-icon">📊</div>
              </div>
              <div className="arrow-container">
                <div className="arrow">→</div>
                <div className="then-text">then</div>
              </div>
              <div className="file-slot csv-slot">
                <div className="slot-header">
                  <span className="slot-number">2</span>
                  <div className="slot-info">
                    <div className="slot-title">CSV File Second</div>
                    <div className="slot-formats">.csv</div>
                  </div>
                </div>
                <div className="slot-icon">📄</div>
              </div>
            </div>
            <div className="guidance-note">
              <div className="note-icon">⚠️</div>
              <div className="note-text">
                <strong>Important:</strong> File order matters for accurate data mapping and comparison results.
              </div>
            </div>
          </div>
        )}

        {/* FILE UPLOAD SECTION */}
        <div className="upload-section">
          <h2 className="section-title">Upload Your Files</h2>
          <p className="section-subtitle">
            {fileType === 'excel_csv' ? 'Upload Excel file first, then CSV file' : 'Select two files to compare'}
          </p>

          {/* Enhanced File Inputs */}
          {fileType === 'excel_csv' ? (
            <div className="excel-csv-file-inputs enhanced">
              <div className="file-input-group">
                <div className="file-input-header">
                  <span className="input-number">1</span>
                  <div className="input-info">
                    <div className="input-title">Excel File</div>
                    <div className="input-subtitle">Upload your .xlsx, .xls, or .xlsm file</div>
                  </div>
                </div>
                <label className="file-input-label enhanced">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => handleFileChange(e, 1)}
                    className="file-input"
                  />
                  <div className="file-input-area">
                    <div className="upload-icon">📊</div>
                    <div className="upload-text">
                      {file1 ? (
                        <div className="file-selected">
                          <div className="file-name">✅ {file1.name}</div>
                          <div className="file-size">{(file1.size / 1024).toFixed(1)} KB</div>
                        </div>
                      ) : (
                        <div className="file-placeholder">
                          <div className="placeholder-main">Click to select Excel file</div>
                          <div className="placeholder-sub">or drag and drop here</div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="file-input-group">
                <div className="file-input-header">
                  <span className="input-number">2</span>
                  <div className="input-info">
                    <div className="input-title">CSV File</div>
                    <div className="input-subtitle">Upload your .csv file</div>
                  </div>
                </div>
                <label className="file-input-label enhanced">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => handleFileChange(e, 2)}
                    className="file-input"
                  />
                  <div className="file-input-area">
                    <div className="upload-icon">📄</div>
                    <div className="upload-text">
                      {file2 ? (
                        <div className="file-selected">
                          <div className="file-name">✅ {file2.name}</div>
                          <div className="file-size">{(file2.size / 1024).toFixed(1)} KB</div>
                        </div>
                      ) : (
                        <div className="file-placeholder">
                          <div className="placeholder-main">Click to select CSV file</div>
                          <div className="placeholder-sub">or drag and drop here</div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="standard-file-inputs">
              <div className="file-input-group standard">
                <label className="file-input-label standard">
                  <input type="file" onChange={(e) => handleFileChange(e, 1)} className="file-input" />
                  <div className="file-input-area standard">
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      {file1 ? `✅ ${file1.name}` : 'Choose File 1'}
                    </div>
                  </div>
                </label>
              </div>
              <div className="file-input-group standard">
                <label className="file-input-label standard">
                  <input type="file" onChange={(e) => handleFileChange(e, 2)} className="file-input" />
                  <div className="file-input-area standard">
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      {file2 ? `✅ ${file2.name}` : 'Choose File 2'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <button 
            onClick={handleLoadFiles} 
            disabled={loading || !file1 || !file2}
            className={`load-files-button ${loading ? 'loading' : ''} ${!file1 || !file2 ? 'disabled' : 'ready'}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing Files...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Load Files & Start Comparison
              </>
            )}
          </button>
        </div>

        {/* MODULAR: Sheet selector when feature enabled and needed */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <>
            <SheetSelector
              file1Info={file1Info}
              file2Info={file2Info}
              onSheetSelect={handleSheetSelect}
              fileType={fileType}
            />
            <button onClick={handleProceedWithSheets} disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}>
              {loading ? 'Processing...' : 'Proceed with Selected Sheets'}
            </button>
          </>
        )}

        {showMapper && (
          <HeaderMapper
            file1Headers={headers1}
            file2Headers={headers2}
            suggestedMappings={suggestedMappings}
            sampleData1={sampleData1}
            sampleData2={sampleData2}
            onConfirm={handleMappingConfirmed}
            showRunButton={true}
            onRun={handleRunComparison}
          />
        )}

        {/* Error display */}
        {error && (
          <div className="error" style={{
            color: 'red', 
            margin: '10px 0', 
            padding: '10px', 
            border: '1px solid red', 
            borderRadius: '4px',
            backgroundColor: '#fee'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="loading" style={{
            margin: '10px 0', 
            padding: '10px', 
            backgroundColor: '#f0f8ff',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <strong>Loading...</strong> Processing files...
          </div>
        )}

        {/* Results display */}
        {results && (
          <div className="results">
            <h2>Comparison Results</h2>
            <div className="summary" style={{
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <p><strong>Total Records:</strong> {results.total_records}</p>
              <p><strong>Differences Found:</strong> {results.differences_found}</p>
              <p><strong>Matches Found:</strong> {results.matches_found}</p>
              
              {/* MODULAR: Show auto-detected fields only if feature enabled and data exists */}
              {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
                <p><strong>🤖 Auto-detected Amount Fields:</strong> {results.autoDetectedFields.join(', ')}</p>
              )}
              
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={handleDownloadExcel}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    marginRight: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Download Excel
                </button>
                <button 
                  onClick={handleDownloadCSV}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📄 Download CSV
                </button>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <table className="results-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                margin: '20px 0'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px', 
                      textAlign: 'left' 
                    }}>ID</th>
                    {Object.keys(results.results[0].fields).map((field, idx) => (
                      <th key={idx} style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px', 
                        textAlign: 'left' 
                      }}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px' 
                      }}>{row.ID}</td>
                      {Object.entries(row.fields).map(([key, value], idx) => (
                        <td
                          key={idx}
                          style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                            backgroundColor:
                              value.status === 'difference'
                                ? '#fdd'
                                : value.status === 'acceptable'
                                ? '#ffd'
                                : '#dfd'
                          }}
                        >
                          <div>
                            <strong>{value.val1} / {value.val2}</strong>
                            {/* MODULAR: Auto-detected indicator only if feature enabled */}
                            {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                              <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>🤖</span>
                            )}
                          </div>
                          <small style={{ color: '#666' }}>
                            {value.status}
                            {value.difference && ` (Δ ${value.difference})`}
                          </small>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .title {
          text-align: center;
          color: #333;
          margin-bottom: 10px;
        }
        
        .file-type-selector {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .file-type-selector label {
          margin-right: 15px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        
        input[type="file"] {
          margin: 10px 0;
          padding: 5px;
          display: block;
          width: 300px;
        }
        
        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          margin: 10px 5px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        button:hover:not(:disabled) {
          background-color: #0056b3;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        /* File Order Guidance Styles */
        .file-order-guidance {
          background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
          border: 2px solid #2196f3;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .file-order-guidance h3 {
          color: #1976d2;
          margin: 0 0 15px 0;
          font-size: 1.1em;
        }

        .order-instruction {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin: 15px 0;
          flex-wrap: wrap;
        }

        .file-slot {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 15px 20px;
          border-radius: 8px;
          border: 2px solid #2196f3;
          min-width: 180px;
        }

        .slot-number {
          background: #2196f3;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1em;
        }

        .slot-description {
          text-align: left;
          line-height: 1.4;
        }

        .slot-description strong {
          color: #1976d2;
          font-size: 1em;
        }

        .arrow {
          font-size: 1.5em;
          color: #2196f3;
          font-weight: bold;
        }

        .order-note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          padding: 10px;
          margin: 15px 0 0 0;
          color: #856404;
          font-size: 0.9em;
        }

        @media (max-width: 768px) {
          .order-instruction {
            flex-direction: column;
          }
          
          .arrow {
            transform: rotate(90deg);
          }
          
          .excel-csv-file-inputs {
            flex-direction: column;
          }
        }

        /* Excel-CSV File Input Styles */
        .excel-csv-file-inputs {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          justify-content: center;
          flex-wrap: wrap;
        }

        .file-input-group {
          flex: 1;
          min-width: 280px;
          max-width: 400px;
        }

        .file-input-label {
          display: block;
          background: white;
          border: 2px solid #2196f3;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .file-input-label:hover {
          border-color: #1976d2;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
          transform: translateY(-2px);
        }

        .input-number {
          display: inline-block;
          background: #2196f3;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          line-height: 30px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .input-title {
          display: block;
          font-size: 1.1em;
          font-weight: bold;
          color: #1976d2;
          margin-bottom: 15px;
        }

        .file-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9em;
          margin-bottom: 10px;
        }

        .file-name-display {
          min-height: 24px;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 0.9em;
          color: #666;
          border: 1px solid #e0e0e0;
        }

        .file-input-label:hover .file-name-display {
          background: #e3f2fd;
          border-color: #2196f3;
        }
      `}</style>
    </div>
  );
}
