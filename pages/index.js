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
    <div className="container">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
      </Head>

      {/* Simple Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <span className="nav-brand">VeriDiff</span>
          <div className="nav-links">
            <Link href="/about">
              <span className="nav-about">📖 MUST READ - About</span>
            </Link>
            <span className="nav-current">Compare Files</span>
          </div>
        </div>
      </nav>

      <main>
        {/* Simple Hero */}
        <div className="hero">
          <h1 className="hero-title">VeriDiff</h1>
          <h2 className="hero-subtitle">Smart File Comparison</h2>
          <p className="hero-description">
            Compare documents with precision and confidence. From Excel to PDFs, 
            VeriDiff handles your most critical file comparisons with professional-grade accuracy.
          </p>
        </div>

        {/* File Type Selection */}
        <div className="section">
          <h2 className="section-title">Choose Your Comparison Type</h2>
          <p className="section-subtitle">Select the file formats you want to compare</p>
          
          <div className="file-type-selector">
            <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV</label>
            <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> Text Files</label>
            <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON</label>
            <label><input type="radio" name="fileType" value="xml" checked={fileType === 'xml'} onChange={handleFileTypeChange} /> XML</label>
            <label><input type="radio" name="fileType" value="pdf" checked={fileType === 'pdf'} onChange={handleFileTypeChange} /> PDF</label>
            <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> Excel</label>
            <label className="featured"><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV (Most Popular)</label>
          </div>
        </div>

        {/* File Order Guidance for Excel-CSV */}
        {fileType === 'excel_csv' && (
          <div className="guidance">
            <h3>📋 File Upload Instructions</h3>
            <p>Please upload your files in the correct order:</p>
            <div className="order-guide">
              <span className="step">1. Excel File First (.xlsx, .xls, .xlsm)</span>
              <span className="arrow">→</span>
              <span className="step">2. CSV File Second (.csv)</span>
            </div>
            <p className="note">⚠️ File order matters for accurate data mapping and comparison results.</p>
          </div>
        )}

        {/* File Upload */}
        <div className="section">
          <h2 className="section-title">Upload Your Files</h2>
          <p className="section-subtitle">
            {fileType === 'excel_csv' ? 'Upload Excel file first, then CSV file' : 'Select two files to compare'}
          </p>

          <div className="file-inputs">
            <div className="file-input-group">
              <label>File 1:</label>
              <input type="file" onChange={(e) => handleFileChange(e, 1)} />
              {file1 && <div className="file-name">✅ {file1.name}</div>}
            </div>
            
            <div className="file-input-group">
              <label>File 2:</label>
              <input type="file" onChange={(e) => handleFileChange(e, 2)} />
              {file2 && <div className="file-name">✅ {file2.name}</div>}
            </div>
          </div>

          <button 
            onClick={handleLoadFiles} 
            disabled={loading || !file1 || !file2}
            className="load-button"
          >
            {loading ? 'Processing Files...' : '🚀 Load Files & Start Comparison'}
          </button>
        </div>

        {/* Sheet Selector */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <div className="section">
            <SheetSelector
              file1Info={file1Info}
              file2Info={file2Info}
              onSheetSelect={handleSheetSelect}
              fileType={fileType}
            />
            <button 
              onClick={handleProceedWithSheets} 
              disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}
              className="load-button"
            >
              {loading ? 'Processing...' : 'Proceed with Selected Sheets'}
            </button>
          </div>
        )}

        {/* Header Mapper */}
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

        {/* Error Display */}
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">
            <strong>Loading...</strong> Processing files...
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="results">
            <h2>Comparison Results</h2>
            <div className="summary">
              <p><strong>Total Records:</strong> {results.total_records}</p>
              <p><strong>Differences Found:</strong> {results.differences_found}</p>
              <p><strong>Matches Found:</strong> {results.matches_found}</p>
              
              {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
                <p><strong>🤖 Auto-detected Amount Fields:</strong> {results.autoDetectedFields.join(', ')}</p>
              )}
              
              <div className="download-buttons">
                <button onClick={handleDownloadExcel} className="download-btn excel">📊 Download Excel</button>
                <button onClick={handleDownloadCSV} className="download-btn csv">📄 Download CSV</button>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {Object.keys(results.results[0].fields).map((field, idx) => (
                      <th key={idx}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td data-label="ID">{row.ID}</td>
                      {Object.entries(row.fields).map(([key, value], idx) => (
                        <td
                          key={idx}
                          data-label={key}
                          className={`cell-${value.status}`}
                        >
                          <div>
                            <strong>{value.val1} / {value.val2}</strong>
                            {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                              <span className="auto-detected">🤖</span>
                            )}
                          </div>
                          <small>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .nav {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-about {
          color: #FF6B35;
          cursor: pointer;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .nav-current {
          color: #667eea;
          font-weight: 500;
        }

        .hero {
          text-align: center;
          padding: 40px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          margin-bottom: 30px;
          color: white;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          font-weight: 400;
          margin: 0 0 20px 0;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }

        .section-title {
          font-size: 1.8rem;
          color: #1f2937;
          margin: 0 0 10px 0;
          text-align: center;
          font-weight: 600;
        }

        .section-subtitle {
          font-size: 1rem;
          color: #6b7280;
          text-align: center;
          margin: 0 0 30px 0;
        }

        .file-type-selector {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .file-type-selector label {
          margin-right: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .file-type-selector label:hover {
          background: #e5e7eb;
        }

        .file-type-selector label.featured {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          font-weight: 600;
        }

        .guidance {
          background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
          border: 2px solid #2196f3;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }

        .guidance h3 {
          color: #1976d2;
          margin: 0 0 10px 0;
          font-size: 1.2rem;
        }

        .order-guide {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 15px 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .step {
          background: white;
          padding: 10px 15px;
          border-radius: 8px;
          border: 2px solid #2196f3;
          font-weight: 600;
        }

        .arrow {
          font-size: 1.5rem;
          color: #2196f3;
          font-weight: bold;
        }

        .note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          padding: 10px;
          margin: 10px 0 0 0;
          color: #856404;
          font-size: 0.9rem;
        }

        .file-inputs {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .file-input-group {
          flex: 1;
          min-width: 250px;
        }

        .file-input-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }

        .file-input-group input[type="file"] {
          width: 100%;
          padding: 10px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .file-name {
          margin-top: 8px;
          padding: 8px;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #0c4a6e;
        }

        .load-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
          margin: 20px auto 0;
          min-width: 250px;
        }

        .load-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .load-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .error {
          color: #dc2626;
          margin: 10px 0;
          padding: 15px;
          border: 1px solid #dc2626;
          border-radius: 6px;
          background: #fef2f2;
        }

        .loading {
          margin: 10px 0;
          padding: 15px;
          background: #f0f8ff;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          color: #1e40af;
        }

        .results {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin: 20px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }

        .summary {
          margin: 20px 0;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .download-buttons {
          margin-top: 15px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .download-btn {
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .download-btn.excel {
          background: #10b981;
          color: white;
        }

        .download-btn.excel:hover {
          background: #059669;
        }

        .download-btn.csv {
          background: #0ea5e9;
          color: white;
        }

        .download-btn.csv:hover {
          background: #0284c7;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 0.9rem;
        }

        .results-table th {
          border: 1px solid #d1d5db;
          padding: 10px 8px;
          text-align: left;
          background: #f9fafb;
          font-weight: 600;
        }

        .results-table td {
          border: 1px solid #d1d5db;
          padding: 10px 8px;
          vertical-align: top;
        }

        .cell-difference {
          background: #fef2f2;
        }

        .cell-acceptable {
          background: #fefce8;
        }

        .cell-match {
          background: #f0fdf4;
        }

        .auto-detected {
          margin-left: 5px;
          font-size: 0.8em;
        }

        .results-table small {
          color: #6b7280;
          display: block;
          margin-top: 4px;
        }

        /* Mobile-First Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }

          .nav-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .nav-links {
            flex-direction: column;
            gap: 1rem;
          }

          .hero {
            padding: 30px 15px;
            margin-bottom: 20px;
          }

          .hero-title {
            font-size: 2.2rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }

          .hero-description {
            font-size: 1rem;
            padding: 0 10px;
          }

          .section {
            padding: 20px 15px;
            margin-bottom: 15px;
          }
          
          .section-title {
            font-size: 1.4rem;
          }

          .section-subtitle {
            font-size: 0.9rem;
          }

          /* Mobile-friendly file type selector */
          .file-type-selector {
            padding: 15px;
          }

          .file-type-selector label {
            display: block;
            margin-right: 0;
            margin-bottom: 10px;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            font-size: 0.95rem;
          }

          .file-type-selector label:hover {
            background: #f3f4f6;
          }

          .file-type-selector label.featured {
            background: #fef3c7;
            border: 2px solid #f59e0b;
          }

          /* Mobile guidance section */
          .guidance {
            padding: 15px;
            margin: 15px 0;
          }

          .guidance h3 {
            font-size: 1.1rem;
            text-align: center;
          }

          .order-guide {
            flex-direction: column;
            gap: 10px;
          }

          .step {
            padding: 12px;
            text-align: center;
            font-size: 0.9rem;
          }

          .arrow {
            transform: rotate(90deg);
            font-size: 1.2rem;
          }

          /* Mobile file inputs */
          .file-inputs {
            flex-direction: column;
            gap: 15px;
          }

          .file-input-group {
            min-width: auto;
          }

          .file-input-group input[type="file"] {
            padding: 12px;
            font-size: 1rem;
            min-height: 48px; /* Touch-friendly */
          }

          .file-name {
            padding: 10px;
            font-size: 0.9rem;
          }

          /* Mobile-friendly buttons */
          .load-button {
            min-width: auto;
            width: 100%;
            padding: 16px 20px;
            font-size: 1rem;
            margin: 15px 0;
          }

          /* Mobile results */
          .results {
            padding: 15px;
            margin: 15px 0;
          }

          .summary {
            padding: 15px;
            font-size: 0.9rem;
          }

          .download-buttons {
            flex-direction: column;
            gap: 8px;
          }

          .download-btn {
            width: 100%;
            padding: 12px;
            font-size: 0.95rem;
          }

          /* Mobile table - make it scrollable */
          .results-table {
            font-size: 0.8rem;
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            border: 1px solid #d1d5db;
          }

          .results-table thead,
          .results-table tbody,
          .results-table th,
          .results-table td,
          .results-table tr {
            display: block;
          }

          .results-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }

          .results-table tr {
            border: 1px solid #d1d5db;
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 6px;
          }

          .results-table td {
            border: none;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            padding: 8px 8px 8px 35%;
            white-space: normal;
            text-align: left;
          }

          .results-table td:before {
            content: attr(data-label) ": ";
            position: absolute;
            left: 6px;
            width: 30%;
            padding-right: 10px;
            white-space: nowrap;
            font-weight: 600;
            color: #374151;
          }

          /* Error and loading mobile styles */
          .error, .loading {
            padding: 12px;
            font-size: 0.9rem;
            margin: 10px 0;
          }
        }

        /* Small mobile devices */
        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.8rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 1.2rem;
          }

          .file-type-selector label {
            padding: 10px;
            font-size: 0.9rem;
          }

          .step {
            padding: 10px;
            font-size: 0.85rem;
          }

          .load-button {
            padding: 14px 16px;
            font-size: 0.95rem;
          }
        }

        /* Landscape orientation adjustments */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero {
            padding: 20px 15px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section {
            padding: 20px;
          }
        }

        /* Touch-friendly improvements for all devices */
        @media (pointer: coarse) {
          .file-type-selector label {
            min-height: 44px;
            display: flex;
            align-items: center;
          }

          .load-button {
            min-height: 48px;
          }

          .download-btn {
            min-height: 44px;
          }

          input[type="file"] {
            min-height: 44px;
          }

          input[type="radio"] {
            width: 18px;
            height: 18px;
            margin-right: 8px;
          }
        }
      `}</style>
    </div>
  );
}
