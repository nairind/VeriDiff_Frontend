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
import SheetSelector from '../components/SheetSelector';
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

export default function Compare() {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    let data1 = [], data2 = [];
    
    try {
      if (FEATURES.SHEET_SELECTION) {
        const excelInfo = await getExcelFileInfo(file1);
        setFile1Info(excelInfo);
        
        if (excelInfo.sheets.length > 1) {
          setShowSheetSelector(true);
          setLoading(false);
          return { data1: [], data2: [] };
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
    return { data1, data2 };
  };

  // MODULAR: Safe Excel data extraction
  const safeExtractExcelData = (result) => {
    if (FEATURES.ENHANCED_EXCEL_PARSING && result && typeof result === 'object' && result.data) {
      return result.data;
    }
    return Array.isArray(result) ? result : [];
  };

  // MODULAR: Safe data validation
  const validateDataFormat = (data1, data2) => {
    if (!FEATURES.ENHANCED_EXCEL_PARSING) return;
    
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

  // MODULAR: Sheet selection handler
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
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        console.log("📊 Processing Excel-CSV combination");
        console.log("🔧 FLEXIBLE_CROSS_FORMAT feature:", FEATURES.FLEXIBLE_CROSS_FORMAT);
        
        if (FEATURES.FLEXIBLE_CROSS_FORMAT) {
          console.log("✅ Using flexible cross-format system");
          
          try {
            console.log("🔍 Starting file validation...");
            
            const validation = validateExcelCSVOrder(file1, file2);
            console.log("🔍 Validation result:", validation);
            
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            console.log("✅ File validation passed");
            
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
            
            const legacyResult = await legacyExcelCSVParsing();
            data1 = legacyResult.data1;
            data2 = legacyResult.data2;
          }
        } else {
          console.log("🔄 Using legacy approach (feature disabled)");
          const legacyResult = await legacyExcelCSVParsing();
          data1 = legacyResult.data1;
          data2 = legacyResult.data2;
        }
        
      } else if (fileType === 'csv') {
        data1 = await parseCSVFile(file1);
        data2 = await parseCSVFile(file2);
        
      } else if (fileType === 'excel') {
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
        const result = await compareTextFiles_main(file1, file2);
        setResults(result);
        setLoading(false);
        return;
      } else {
        throw new Error('Unsupported file type.');
      }
      
      try {
        validateDataFormat(data1, data2);
      } catch (validationError) {
        console.warn('Data validation warning:', validationError.message);
      }
      
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
      
      const options = {};
      if (FEATURES.SHEET_SELECTION) {
        options.sheet1 = selectedSheet1;
        options.sheet2 = selectedSheet2;
      }
      if (FEATURES.AUTO_DETECTION) {
        options.autoDetectAmounts = true;
      }
      
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-decoration-none">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                VeriDiff
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-decoration-none">
                <span className="text-orange-500 cursor-pointer text-lg font-semibold hover:text-orange-600 transition-colors">
                  📖 About
                </span>
              </Link>
              <span className="text-blue-600 font-medium">
                Compare Files
              </span>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 bg-white">
              <div className="flex flex-col space-y-4">
                <Link href="/about" className="text-decoration-none">
                  <span className="text-orange-500 cursor-pointer text-lg font-semibold px-4">
                    📖 About
                  </span>
                </Link>
                <span className="text-blue-600 font-medium px-4">
                  Compare Files
                </span>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-8 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            VeriDiff
          </h1>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-light mb-4 opacity-90">
            Smart File Comparison
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed max-w-2xl mx-auto">
            Compare documents with precision and confidence. From Excel to PDFs, 
            VeriDiff handles your most critical file comparisons with professional-grade accuracy.
          </p>
        </div>

        {/* File Type Selection */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 text-center">
            Choose Your Comparison Type
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
            Select the file formats you want to compare
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { value: 'excel', label: 'Excel–Excel', featured: false },
              { value: 'excel_csv', label: 'Excel–CSV', featured: true },
              { value: 'csv', label: 'CSV–CSV', featured: false },
              { value: 'pdf', label: 'PDF–PDF', featured: false, badge: 'v1' },
              { value: 'text', label: 'TXT–TXT', featured: false },
              { value: 'json', label: 'JSON–JSON', featured: false },
              { value: 'xml', label: 'XML–XML', featured: false },
              { value: 'pdf_ocr', label: 'PDF–PDF', disabled: true, badge: 'OCR coming' }
            ].map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 min-h-[60px]
                  ${option.disabled ? 'cursor-not-allowed opacity-70 bg-gray-50 border-2 border-dashed border-gray-300' :
                    option.featured ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 font-semibold hover:from-yellow-100 hover:to-yellow-200 hover:-translate-y-1' :
                    fileType === option.value ? 'bg-blue-50 border-2 border-blue-500' :
                    'bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-1'}
                `}
              >
                <input
                  type="radio"
                  name="fileType"
                  value={option.value}
                  checked={fileType === option.value}
                  onChange={handleFileTypeChange}
                  disabled={option.disabled}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="flex-1 text-sm sm:text-base">
                  {option.label}
                  {option.badge && (
                    <span className={`
                      ml-2 text-xs px-2 py-1 rounded-md font-semibold
                      ${option.badge === 'v1' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {option.badge}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 text-center">
            Upload Your Files
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
            Select files to compare
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* File 1 Upload */}
            <div className={`
              p-6 rounded-2xl border-2 shadow-md transition-all duration-300
              ${fileType === 'excel_csv' 
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400'}
            `}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
                  ${fileType === 'excel_csv' 
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'}
                `}>
                  1
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-gray-900 text-base sm:text-lg">
                    {fileType === 'excel_csv' ? 'Excel File (.xlsx, .xls, .xlsm)' : 'File 1'}
                  </label>
                  {fileType === 'excel_csv' && (
                    <small className="text-yellow-700 text-xs sm:text-sm font-medium">
                      📊 Upload your Excel spreadsheet first
                    </small>
                  )}
                </div>
              </div>
              
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 1)}
                accept={fileType === 'excel_csv' ? '.xlsx,.xls,.xlsm' : undefined}
                className="w-full p-3 border-2 border-white/80 rounded-lg text-sm sm:text-base bg-white/90 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {file1 && (
                <div className="mt-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg text-xs sm:text-sm text-green-700 font-semibold">
                  ✅ {file1.name}
                </div>
              )}
            </div>
            
            {/* File 2 Upload */}
            <div className={`
              p-6 rounded-2xl border-2 shadow-md transition-all duration-300
              ${fileType === 'excel_csv' 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400'}
            `}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
                  ${fileType === 'excel_csv' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'}
                `}>
                  2
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-gray-900 text-base sm:text-lg">
                    {fileType === 'excel_csv' ? 'CSV File (.csv)' : 'File 2'}
                  </label>
                  {fileType === 'excel_csv' && (
                    <small className="text-green-700 text-xs sm:text-sm font-medium">
                      📄 Upload your CSV data file second
                    </small>
                  )}
                </div>
              </div>
              
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 2)}
                accept={fileType === 'excel_csv' ? '.csv' : undefined}
                className="w-full p-3 border-2 border-white/80 rounded-lg text-sm sm:text-base bg-white/90 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {file2 && (
                <div className="mt-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg text-xs sm:text-sm text-green-700 font-semibold">
                  ✅ {file2.name}
                </div>
              )}
            </div>
          </div>

          {/* Load Button */}
          <div className="text-center relative">
            <button 
              onClick={handleLoadFiles} 
              disabled={loading || !file1 || !file2}
              className={`
                px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg lg:text-xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden min-w-[300px] sm:min-w-[360px]
                ${loading || !file1 || !file2 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:shadow-xl hover:-translate-y-1 active:scale-95'}
              `}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-3">⏳</span>
                  Processing Files...
                </>
              ) : (
                <>
                  <span className="mr-3 text-lg sm:text-xl filter drop-shadow-sm">🚀</span>
                  <span className="bg-gradient-to-r from-white to-blue-50 bg-clip-text text-transparent drop-shadow-sm">
                    Load Files & Start Comparison
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sheet Selector */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-gray-200">
            <SheetSelector
              file1Info={file1Info}
              file2Info={file2Info}
              onSheetSelect={handleSheetSelect}
              fileType={fileType}
            />
            <div className="text-center mt-6">
              <button 
                onClick={handleProceedWithSheets} 
                disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}
                className={`
                  px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300
                  ${loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:-translate-y-1'}
                `}
              >
                {loading ? 'Processing...' : 'Proceed with Selected Sheets'}
              </button>
            </div>
          </div>
        )}

        {/* Header Mapper */}
        {showMapper && (
          <div className="mb-8">
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
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 sm:p-6 border-2 border-red-500 rounded-xl bg-red-50 text-red-700">
            <strong className="block text-base sm:text-lg mb-2">Error:</strong>
            <span className="text-sm sm:text-base whitespace-pre-line">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-8 p-4 sm:p-6 bg-blue-50 border-2 border-blue-500 rounded-xl text-blue-700 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="font-semibold text-sm sm:text-base">Processing... Please wait while we compare your files</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
              Comparison Results
            </h2>
            
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {results.total_records}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                    {results.differences_found}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm">Differences Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {results.matches_found}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm">Matches Found</div>
                </div>
              </div>
              
              {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
                <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6 text-center">
                  <strong className="text-green-800 text-sm sm:text-base">🤖 Auto-detected Amount Fields:</strong>
                  <span className="text-green-700 ml-2 text-sm sm:text-base">
                    {results.autoDetectedFields.join(', ')}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadExcel}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base"
                >
                  📊 Download Excel
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base"
                >
                  📄 Download CSV
                </button>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-xs sm:text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="border border-gray-200 p-3 sm:p-4 text-left font-semibold text-gray-900">
                        ID
                      </th>
                      {Object.keys(results.results[0].fields).map((field, idx) => (
                        <th key={idx} className="border border-gray-200 p-3 sm:p-4 text-left font-semibold text-gray-900">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border border-gray-200 p-3 sm:p-4 bg-white">
                          {row.ID}
                        </td>
                        {Object.entries(row.fields).map(([key, value], idx) => (
                          <td
                            key={idx}
                            className={`
                              border border-gray-200 p-3 sm:p-4
                              ${value.status === 'difference' ? 'bg-red-50' 
                                : value.status === 'acceptable' ? 'bg-yellow-50' 
                                : 'bg-green-50'}
                            `}
                          >
                            <div className="font-semibold text-xs sm:text-sm">
                              {value.val1} / {value.val2}
                              {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                <span className="ml-1 text-xs">🤖</span>
                              )}
                            </div>
                            <small className="text-gray-600 block mt-1 text-xs">
                              {value.status}
                              {value.difference && ` (Δ ${value.difference})`}
                            </small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
