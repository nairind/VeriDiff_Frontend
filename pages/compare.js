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

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const navStyle = {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const navContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    cursor: 'pointer',
    textDecoration: 'none'
  };

  const desktopNavStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const mobileNavButtonStyle = {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  };

  const heroStyle = {
    textAlign: 'center',
    padding: '50px 30px',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    borderRadius: '20px',
    marginBottom: '40px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  };

  const sectionTitleStyle = {
    fontSize: '1.8rem',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 15px 0',
    textAlign: 'center',
    fontWeight: '700'
  };

  const fileTypeGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  };

  const fileUploadGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '35px'
  };

  const loadButtonStyle = {
    background: loading || !file1 || !file2 
      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
      : 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)',
    color: 'white',
    border: 'none',
    padding: '20px 50px',
    borderRadius: '60px',
    fontSize: '1.4rem',
    fontWeight: '700',
    cursor: loading || !file1 || !file2 ? 'not-allowed' : 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: '360px',
    boxShadow: loading || !file1 || !file2 
      ? '0 4px 15px rgba(100, 116, 139, 0.2)' 
      : '0 10px 30px rgba(37, 99, 235, 0.4)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Media query styles
  const mediaQueries = `
    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
      .mobile-nav-button { display: block !important; }
      .file-type-grid { grid-template-columns: 1fr !important; }
      .file-upload-grid { grid-template-columns: 1fr !important; }
      .load-button { 
        min-width: 300px !important; 
        font-size: 1.2rem !important;
        padding: 16px 40px !important;
      }
      .hero-title { font-size: 2.5rem !important; }
      .section-title { font-size: 1.5rem !important; }
      .section-padding { padding: 25px !important; }
    }
    
    @media (max-width: 480px) {
      .main-container { padding: 15px !important; }
      .hero-section { padding: 30px 20px !important; }
      .load-button { 
        min-width: 280px !important; 
        font-size: 1.1rem !important;
        padding: 14px 30px !important;
      }
    }
  `;

  return (
    <div style={containerStyle}>
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
        <style>{mediaQueries}</style>
      </Head>

      {/* Navigation */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={logoStyle}>VeriDiff</span>
          </Link>
          
          <div style={desktopNavStyle} className="desktop-nav">
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <span style={{
                color: '#FF6B35',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                📖 About
              </span>
            </Link>
            <span style={{
              color: '#2563eb',
              fontWeight: '500',
              fontSize: '1rem'
            }}>
              Compare Files
            </span>
          </div>

          <button 
            style={mobileNavButtonStyle}
            className="mobile-nav-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 0',
            background: 'white'
          }}>
            <div style={{ padding: '0 20px' }}>
              <Link href="/about" style={{ textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
                <span style={{ color: '#FF6B35', fontSize: '1.1rem', fontWeight: '600' }}>
                  📖 About
                </span>
              </Link>
              <span style={{ color: '#2563eb', fontWeight: '500' }}>
                Compare Files
              </span>
            </div>
          </div>
        )}
      </nav>

      <main style={mainStyle} className="main-container">
        {/* Hero Section */}
        <div style={heroStyle} className="hero-section">
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            margin: '0 0 15px 0',
            lineHeight: '1.2'
          }} className="hero-title">
            VeriDiff
          </h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            margin: '0 0 20px 0',
            opacity: '0.9'
          }}>
            Smart File Comparison
          </h2>
          <p style={{
            fontSize: '1.1rem',
            opacity: '0.9',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Compare documents with precision and confidence. From Excel to PDFs, 
            VeriDiff handles your most critical file comparisons with professional-grade accuracy.
          </p>
        </div>

        {/* File Type Selection */}
        <div style={sectionStyle} className="section-padding">
          <h2 style={sectionTitleStyle} className="section-title">
            Choose Your Comparison Type
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            textAlign: 'center',
            margin: '0 0 35px 0'
          }}>
            Select the file formats you want to compare
          </p>
          
          <div style={fileTypeGridStyle} className="file-type-grid">
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: option.featured 
                    ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                    : option.disabled 
                      ? '#f9fafb' 
                      : 'white',
                  border: option.featured 
                    ? '2px solid #f59e0b' 
                    : option.disabled 
                      ? '2px dashed #9ca3af' 
                      : fileType === option.value 
                        ? '2px solid #2563eb' 
                        : '2px solid #e5e7eb',
                  opacity: option.disabled ? 0.7 : 1,
                  fontWeight: option.featured ? '600' : '500',
                  fontSize: '1rem',
                  minHeight: '60px'
                }}
                onMouseOver={(e) => {
                  if (!option.disabled && fileType !== option.value) {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.background = option.featured ? 'linear-gradient(135deg, #fde68a, #fcd34d)' : '#f0f4ff';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!option.disabled && fileType !== option.value) {
                    e.target.style.borderColor = option.featured ? '#f59e0b' : '#e5e7eb';
                    e.target.style.background = option.featured ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'white';
                    e.target.style.transform = 'none';
                  }
                }}
              >
                <input
                  type="radio"
                  name="fileType"
                  value={option.value}
                  checked={fileType === option.value}
                  onChange={handleFileTypeChange}
                  disabled={option.disabled}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#2563eb'
                  }}
                />
                <span style={{ flex: 1 }}>
                  {option.label}
                  {option.badge && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.75em',
                      background: option.badge === 'v1' ? '#dbeafe' : '#fef3c7',
                      color: option.badge === 'v1' ? '#1e40af' : '#92400e',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}>
                      {option.badge}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* File Upload Section */}
        <div style={sectionStyle} className="section-padding">
          <h2 style={sectionTitleStyle} className="section-title">
            Upload Your Files
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            textAlign: 'center',
            margin: '0 0 35px 0'
          }}>
            Select files to compare
          </p>

          <div style={fileUploadGridStyle} className="file-upload-grid">
            {/* File 1 Upload */}
            <div style={{
              background: fileType === 'excel_csv' 
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              padding: '25px',
              borderRadius: '16px',
              border: fileType === 'excel_csv' 
                ? '2px solid #f59e0b' 
                : '2px solid #0ea5e9',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: fileType === 'excel_csv' 
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  1
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '700',
                    color: '#1f2937',
                    fontSize: '1.1rem',
                    margin: '0'
                  }}>
                    {fileType === 'excel_csv' 
                      ? 'Excel File (.xlsx, .xls, .xlsm)' 
                      : 'File 1'}
                  </label>
                  {fileType === 'excel_csv' && (
                    <small style={{
                      color: '#92400e',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      📊 Upload your Excel spreadsheet first
                    </small>
                  )}
                </div>
              </div>
              
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 1)}
                accept={fileType === 'excel_csv' ? '.xlsx,.xls,.xlsm' : undefined}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}
              />
              {file1 && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: '#166534',
                  fontWeight: '600'
                }}>
                  ✅ {file1.name}
                </div>
              )}
            </div>
            
            {/* File 2 Upload */}
            <div style={{
              background: fileType === 'excel_csv' 
                ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' 
                : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              padding: '25px',
              borderRadius: '16px',
              border: fileType === 'excel_csv' 
                ? '2px solid #22c55e' 
                : '2px solid #0ea5e9',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: fileType === 'excel_csv' 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  2
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '700',
                    color: '#1f2937',
                    fontSize: '1.1rem',
                    margin: '0'
                  }}>
                    {fileType === 'excel_csv' 
                      ? 'CSV File (.csv)' 
                      : 'File 2'}
                  </label>
                  {fileType === 'excel_csv' && (
                    <small style={{
                      color: '#166534',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      📄 Upload your CSV data file second
                    </small>
                  )}
                </div>
              </div>
              
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 2)}
                accept={fileType === 'excel_csv' ? '.csv' : undefined}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}
              />
              {file2 && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid #22c55e',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: '#166534',
                  fontWeight: '600'
                }}>
                  ✅ {file2.name}
                </div>
              )}
            </div>
          </div>

          {/* Load Button */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={handleLoadFiles} 
              disabled={loading || !file1 || !file2}
              style={loadButtonStyle}
              className="load-button"
              onMouseOver={(e) => {
                if (!loading && file1 && file2) {
                  e.target.style.transform = 'translateY(-4px) scale(1.03)';
                  e.target.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && file1 && file2) {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{ 
                    marginRight: '12px',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite'
                  }}>⏳</span>
                  Processing Files...
                </>
              ) : (
                <>
                  <span style={{ 
                    marginRight: '12px',
                    fontSize: '1.6rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>🚀</span>
                  <span style={{
                    background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    Load Files & Start Comparison
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sheet Selector */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <div style={sectionStyle}>
            <SheetSelector
              file1Info={file1Info}
              file2Info={file2Info}
              onSheetSelect={handleSheetSelect}
              fileType={fileType}
            />
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button 
                onClick={handleProceedWithSheets} 
                disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}
                style={{
                  background: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Processing...' : 'Proceed with Selected Sheets'}
              </button>
            </div>
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
          <div style={{
            color: '#dc2626',
            margin: '20px 0',
            padding: '20px',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            background: '#fef2f2',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            margin: '20px 0',
            padding: '20px',
            background: '#eff6ff',
            border: '2px solid #2563eb',
            borderRadius: '12px',
            color: '#1e40af',
            fontSize: '1rem',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            <strong>Processing...</strong> Please wait while we compare your files...
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={sectionStyle}>
            <h2 style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 0 25px 0',
              textAlign: 'center'
            }}>
              Comparison Results
            </h2>
            <div style={{
              margin: '25px 0',
              padding: '25px',
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                    {results.total_records}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Records</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
                    {results.differences_found}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Differences Found</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
                    {results.matches_found}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Matches Found</div>
                </div>
              </div>
              
              {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                  border: '1px solid #22c55e',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <strong style={{ color: '#166534' }}>🤖 Auto-detected Amount Fields:</strong>
                  <span style={{ color: '#16a34a', marginLeft: '8px' }}>
                    {results.autoDetectedFields.join(', ')}
                  </span>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleDownloadExcel}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  📊 Download Excel
                </button>
                <button
                  onClick={handleDownloadCSV}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  📄 Download CSV
                </button>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <div style={{
                overflowX: 'auto',
                marginTop: '30px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                  minWidth: '600px'
                }}>
                  <thead>
                    <tr style={{
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
                    }}>
                      <th style={{
                        border: '1px solid #e5e7eb',
                        padding: '16px 12px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        ID
                      </th>
                      {Object.keys(results.results[0].fields).map((field, idx) => (
                        <th key={idx} style={{
                          border: '1px solid #e5e7eb',
                          padding: '16px 12px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td style={{
                          border: '1px solid #e5e7eb',
                          padding: '12px',
                          verticalAlign: 'top',
                          background: 'white'
                        }}>
                          {row.ID}
                        </td>
                        {Object.entries(row.fields).map(([key, value], idx) => (
                          <td
                            key={idx}
                            style={{
                              border: '1px solid #e5e7eb',
                              padding: '12px',
                              verticalAlign: 'top',
                              background: value.status === 'difference' ? '#fef2f2' 
                                        : value.status === 'acceptable' ? '#fefce8' 
                                        : '#f0fdf4'
                            }}
                          >
                            <div>
                              <strong>{value.val1} / {value.val2}</strong>
                              {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                <span style={{
                                  marginLeft: '5px',
                                  fontSize: '0.8em'
                                }}>
                                  🤖
                                </span>
                              )}
                            </div>
                            <small style={{
                              color: '#6b7280',
                              display: 'block',
                              marginTop: '4px'
                            }}>
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
