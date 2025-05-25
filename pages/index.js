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
            
            // Use inline validation instead of import
            const validation = validateFilesInline(file1, file2);
            console.log("🔍 Validation result:", validation);
            
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            console.log("✅ File validation passed");
            
            // Parse files in correct order based on validation
            if (validation.swapped) {
              console.log("🔄 Files are swapped - CSV first, Excel second");
              console.log("📊 Parsing CSV file:", validation.csvFile.name);
              data2 = await parseCSVFile(validation.csvFile);
              console.log("📊 Parsing Excel file:", validation.excelFile.name);
              const excelResult = await parseExcelFile(validation.excelFile, selectedSheet1);
              data1 = safeExtractExcelData(excelResult);
            } else {
              console.log("✅ Files in correct order - Excel first, CSV second");
              console.log("📊 Parsing Excel file:", validation.excelFile.name);
              const excelResult = await parseExcelFile(validation.excelFile, selectedSheet1);
              data1 = safeExtractExcelData(excelResult);
              console.log("📊 Parsing CSV file:", validation.csvFile.name);
              data2 = await parseCSVFile(validation.csvFile);
            }
            
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
            <span style={{ color: '#667eea', fontWeight: '500' }}>Compare Files</span>
            <Link href="/about">
              <span style={{ 
                color: '#6b7280', 
                cursor: 'pointer', 
                textDecoration: 'none'
              }}>About</span>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <h1 className="title">VeriDiff</h1>
        <p>Upload two files to compare their contents</p>

        <div className="file-type-selector">
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON</label>
          <label><input type="radio" name="fileType" value="xml" checked={fileType === 'xml'} onChange={handleFileTypeChange} /> XML</label>
          <label><input type="radio" name="fileType" value="pdf" checked={fileType === 'pdf'} onChange={handleFileTypeChange} /> PDF</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> Excel</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <input type="file" onChange={(e) => handleFileChange(e, 1)} />
        <input type="file" onChange={(e) => handleFileChange(e, 2)} />

        <button onClick={handleLoadFiles} disabled={loading}>
          {loading ? 'Loading...' : 'Load Files'}
        </button>

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
      `}</style>
    </div>
  );
}
