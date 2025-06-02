import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';

// Import document-specific utilities
import { compareTextFiles_main } from '../../utils/textFileComparison';
import { parseJSONFile, compareJSONFiles } from '../../utils/jsonFileComparison';
import { parseXMLFile, compareXMLFiles } from '../../utils/xmlFileComparison';
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison';

// Import format-specific result components
import TextResults from '../../components/TextResults';
import JsonResults from '../../components/JsonResults';
import XmlResults from '../../components/XmlResults';
import PdfResults from '../../components/PdfResults';

// ===== USER GUIDANCE COMPONENTS =====

// File Requirements Info Component
const FileRequirementsInfo = () => (
  <div style={{
    background: '#eff6ff',
    border: '1px solid #2563eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    fontSize: '0.9rem'
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1rem' }}>
      📋 Supported Text Files
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
      <div>
        <strong>✅ Supported:</strong>
        <br />• .txt, .csv, .log files
        <br />• Code files (.js, .html, .css)
        <br />• Config files (.json, .xml, .yaml)
      </div>
      <div>
        <strong>📏 Requirements:</strong>
        <br />• Maximum size: 10MB
        <br />• UTF-8 text encoding
        <br />• No binary/image files
      </div>
    </div>
  </div>
);

// Success Tips Component
const SuccessTips = () => (
  <div style={{
    background: '#f0fdf4',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '1rem' }}>
      💡 Pro Tips for Best Results
    </h4>
    <div style={{ fontSize: '0.9rem', color: '#166534' }}>
      • <strong>Small files compare faster:</strong> Under 1MB for instant results
      <br />
      • <strong>Save as UTF-8:</strong> Ensures all characters display correctly  
      <br />
      • <strong>Use .txt extension:</strong> Guarantees compatibility
      <br />
      • <strong>Line-by-line works best:</strong> For code and structured text
    </div>
  </div>
);

// Enhanced Error Messages with Solutions
const getHelpfulErrorMessage = (error, fileName) => {
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('too large')) {
    return {
      title: "📁 File Too Large",
      message: `"${fileName}" exceeds our 10MB limit.`,
      solutions: [
        "Try splitting large files into smaller sections",
        "Use a text editor to reduce file size",
        "Compare specific sections instead of entire files",
        "For large datasets, consider our Premium bulk comparison tools"
      ]
    };
  }
  
  if (errorMsg.includes('binary') || errorMsg.includes('not readable as text')) {
    return {
      title: "🚫 Binary File Detected",
      message: `"${fileName}" appears to be a binary file (image, PDF, etc.).`,
      solutions: [
        "Select .txt, .csv, or other text files instead",
        "For PDF comparison, use our PDF comparison tool",
        "Extract text content from documents first",
        "Save files as plain text (.txt) format"
      ]
    };
  }
  
  if (errorMsg.includes('empty')) {
    return {
      title: "📄 Empty File",
      message: `"${fileName}" contains no content.`,
      solutions: [
        "Check if the file contains text content",
        "Try opening the file in a text editor first",
        "Ensure the file finished uploading completely"
      ]
    };
  }
  
  if (errorMsg.includes('encoding') || errorMsg.includes('tolowercase')) {
    return {
      title: "🔤 Text Encoding Issue",
      message: `"${fileName}" may have incompatible text encoding.`,
      solutions: [
        "Save file as UTF-8 encoding in your text editor",
        "Try opening in Notepad and 'Save As' with UTF-8 encoding",
        "Avoid files with special characters or non-English text",
        "Convert file to plain text format first"
      ]
    };
  }
  
  if (errorMsg.includes('failed to read') || errorMsg.includes('corrupted')) {
    return {
      title: "💾 File Reading Error",
      message: `Unable to read "${fileName}".`,
      solutions: [
        "Check if the file is open in another program",
        "Try uploading the file again",
        "Ensure the file isn't corrupted",
        "Save a copy of the file and try again"
      ]
    };
  }
  
  // Generic fallback
  return {
    title: "⚠️ Comparison Error",
    message: error.message,
    solutions: [
      "Ensure both files are valid text files",
      "Check file size is under 10MB",
      "Try refreshing the page and uploading again",
      "Contact support if the issue persists"
    ]
  };
};

// User-Friendly Error Display Component
const HelpfulErrorDisplay = ({ error, fileName }) => {
  const errorInfo = getHelpfulErrorMessage(error, fileName || 'Unknown file');
  
  return (
    <div style={{
      background: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ fontSize: '2rem' }}>❌</div>
        <div>
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.3rem' }}>
            {errorInfo.title}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#7f1d1d', fontSize: '1rem' }}>
            {errorInfo.message}
          </p>
        </div>
      </div>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #fca5a5'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '1rem' }}>
          💡 How to Fix This:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
          {errorInfo.solutions.map((solution, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>{solution}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ===== DATA ADAPTER FOR TEXT RESULTS =====
const adaptTextComparisonResults = (rawResults, file1Content, file2Content, file1Name, file2Name) => {
  console.log('🔧 Adapting text comparison results...', {
    file1Name,
    file2Name,
    file1_length: file1Content?.length,
    file2_length: file2Content?.length,
    rawResults: rawResults
  });

  // Handle different possible result structures from compareTextFiles_main
  const file1Lines = (file1Content || '').split('\n');
  const file2Lines = (file2Content || '').split('\n');
  const maxLines = Math.max(file1Lines.length, file2Lines.length);
  
  // Initialize arrays to match lengths
  const normalizedFile1 = [...file1Lines];
  const normalizedFile2 = [...file2Lines];
  
  // Pad shorter array with empty strings
  while (normalizedFile1.length < maxLines) normalizedFile1.push('');
  while (normalizedFile2.length < maxLines) normalizedFile2.push('');
  
  // Generate line-by-line comparison
  const lineByLineComparison = [];
  let differences = 0;
  let matches = 0;
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = normalizedFile1[i] || '';
    const line2 = normalizedFile2[i] || '';
    
    let status;
    if (line1 === line2) {
      status = 'unchanged';
      matches++;
    } else if (line1 === '' && line2 !== '') {
      status = 'added';
      differences++;
    } else if (line1 !== '' && line2 === '') {
      status = 'removed';
      differences++;
    } else {
      status = 'modified';
      differences++;
    }
    
    lineByLineComparison.push({
      line_number: i + 1,
      status: status,
      file1_content: line1,
      file2_content: line2
    });
  }
  
  // Create the expected data structure for TextResults
  const adaptedResults = {
    // Core statistics
    total_lines: maxLines,
    differences_found: differences,
    matches_found: matches,
    similarity_percentage: maxLines > 0 ? Math.round((matches / maxLines) * 100) : 0,
    
    // File contents
    file1_content: file1Content || '',
    file2_content: file2Content || '',
    file1_name: file1Name,
    file2_name: file2Name,
    
    // Detailed comparison
    line_by_line_comparison: lineByLineComparison,
    
    // Legacy support - include original results if they exist
    original_results: rawResults,
    
    // Summary changes array (for compatibility)
    changes: lineByLineComparison.filter(line => line.status !== 'unchanged').map((line, index) => ({
      type: line.status,
      line_number: line.line_number,
      old_content: line.file1_content,
      new_content: line.file2_content,
      description: `Line ${line.line_number}: ${line.status}`
    }))
  };
  
  console.log('✅ Text Comparison Results Adapted:', {
    total_lines: adaptedResults.total_lines,
    differences_found: adaptedResults.differences_found,
    matches_found: adaptedResults.matches_found,
    similarity: adaptedResults.similarity_percentage + '%'
  });
  
  return adaptedResults;
};

// ===== ENHANCED FILE READING UTILITY =====
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    console.log('🐛 DEBUG: Reading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('File is empty'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        console.log('🐛 DEBUG: File read successfully. Length:', content?.length);
        
        if (typeof content !== 'string') {
          reject(new Error('File content is not readable as text'));
          return;
        }
        
        // Check for binary content (null bytes indicate binary)
        if (content.includes('\0')) {
          reject(new Error(`File "${file.name}" appears to contain binary data. Please select a text file.`));
          return;
        }
        
        if (content.length === 0) {
          reject(new Error('File appears to be empty'));
          return;
        }
        
        // Performance warnings
        const lineCount = content.split('\n').length;
        if (lineCount > 10000) {
          console.warn(`⚠️ File "${file.name}" has ${lineCount} lines. Comparison may be slow.`);
        }
        
        resolve(content);
      } catch (error) {
        console.error('🚨 File reading error:', error);
        reject(new Error('Failed to process file content'));
      }
    };
    
    reader.onerror = (e) => {
      console.error('🚨 FileReader error:', e);
      reject(new Error(`Failed to read file "${file.name}". The file may be corrupted or in use.`));
    };
    
    // Read as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  });
};

// ===== ENHANCED FILE UPLOAD COMPONENT =====
const FileUploadWithValidation = ({ fileNum, file, onChange, fileType }) => {
  const [validationWarning, setValidationWarning] = useState(null);
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setValidationWarning(null);
    
    try {
      // Proactive validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        setValidationWarning({
          type: 'error',
          message: `File is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB (max 10MB allowed)`
        });
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setValidationWarning({
          type: 'warning',
          message: `Large file (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) - comparison may take longer`
        });
      }
      
      // Check file type
      const fileName = selectedFile.name.toLowerCase();
      const isBinaryType = selectedFile.type && (
        selectedFile.type.startsWith('image/') ||
        selectedFile.type.startsWith('video/') ||
        selectedFile.type === 'application/pdf'
      );
      
      if (isBinaryType) {
        setValidationWarning({
          type: 'error',
          message: 'Binary files not supported. Please select a text file (.txt, .csv, .log, etc.)'
        });
        return;
      }
      
      const textExtensions = ['.txt', '.csv', '.log', '.md', '.html', '.css', '.js', '.json', '.xml'];
      const hasTextExtension = textExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasTextExtension && !selectedFile.type.startsWith('text/')) {
        setValidationWarning({
          type: 'warning',
          message: `File extension "${fileName.split('.').pop()}" may not be a text file`
        });
      }
      
      onChange(e, fileNum);
      
    } catch (error) {
      setValidationWarning({
        type: 'error',
        message: error.message
      });
    }
  };
  
  return (
    <div style={{
      background: '#f0f9ff',
      padding: '25px',
      borderRadius: '16px',
      border: '2px solid #0ea5e9'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>File {fileNum}</h3>
      
      <input
        type="file"
        onChange={handleFileChange}
        accept=".txt,.csv,.log,.md,.html,.css,.js,.json,.xml,.yaml,.yml,.ini,.cfg,.conf,text/*"
        style={{
          width: '100%',
          padding: '14px',
          border: '2px solid rgba(255,255,255,0.8)',
          borderRadius: '10px',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.9)'
        }}
      />
      
      {/* File Status Display */}
      {file && !validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          color: '#166534',
          fontWeight: '600'
        }}>
          ✅ {file.name} ({(file.size / 1024).toFixed(1)}KB)
        </div>
      )}
      
      {/* Validation Warnings */}
      {validationWarning && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: validationWarning.type === 'error' ? '#fef2f2' : '#fffbeb',
          border: `2px solid ${validationWarning.type === 'error' ? '#dc2626' : '#f59e0b'}`,
          borderRadius: '8px',
          color: validationWarning.type === 'error' ? '#dc2626' : '#92400e',
          fontWeight: '500'
        }}>
          {validationWarning.type === 'error' ? '❌' : '⚠️'} {validationWarning.message}
        </div>
      )}
    </div>
  );
};

function DocumentComparePage() {
  const { data: session } = useSession();
  
  // Core states
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('text');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userTier, setUserTier] = useState('free');

  // Document-specific option states
  const [showTextOptions, setShowTextOptions] = useState(false);
  const [showJsonOptions, setShowJsonOptions] = useState(false);
  const [showXmlOptions, setShowXmlOptions] = useState(false);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  // Comparison options
  const [textOptions, setTextOptions] = useState({
    compareMode: 'line',
    caseSensitive: true,
    ignoreWhitespace: false,
    showLineNumbers: true
  });

  const [jsonOptions, setJsonOptions] = useState({
    ignoreKeyOrder: true,
    ignoreArrayOrder: false,
    numericalTolerance: 0,
    deepComparison: true
  });

  const [xmlOptions, setXmlOptions] = useState({
    ignoreAttributeOrder: true,
    ignoreNamespaces: false,
    ignoreComments: true,
    ignoreWhitespace: true,
    compareText: true,
    compareAttributes: true
  });

  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    pageByPage: true,
    includeImages: false
  });

  // Fetch user data
  const fetchUserData = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/usage/current');
      const data = await response.json();
      if (response.ok) {
        setUserTier(data.user?.tier || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  // Navigation handlers
  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    window.location.href = `/#${sectionId}`;
    setMobileMenuOpen(false);
  };

  // Premium upgrade handlers
  const handlePremiumUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      alert('Error starting premium subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalUpgrade = async () => {
    setShowPremiumModal(false);
    await handlePremiumUpgrade();
  };

  const handleModalDismiss = () => {
    setShowPremiumModal(false);
    setFileType('text');
  };

  // File handling
  const handleFileChange = (e, fileNum) => {
    // Block premium formats for free users
    if (fileType !== 'text' && userTier !== 'premium') {
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  const handleFileTypeChange = (e) => {
    const newFileType = e.target.value;
    
    // Show premium modal for non-text formats if user is not premium
    if (newFileType !== 'text' && userTier !== 'premium' && session) {
      setShowPremiumModal(true);
      return;
    }
    
    // Reset states when changing file type
    setFileType(newFileType);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
    setShowTextOptions(false);
    setShowJsonOptions(false);
    setShowXmlOptions(false);
    setShowPdfOptions(false);
  };

  // ===== ENHANCED MAIN COMPARISON HANDLER =====
  const handleCompareFiles = async () => {
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare documents.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🐛 DEBUG: Starting comparison...');
      console.log('🐛 DEBUG: Files:', { file1: file1.name, file2: file2.name });
      console.log('🐛 DEBUG: File type:', fileType);
      console.log('🐛 DEBUG: Text options BEFORE:', textOptions);

      // Ensure textOptions has all required properties with safe defaults
      const safeTextOptions = {
        compareMode: textOptions.compareMode || 'line',
        caseSensitive: textOptions.caseSensitive !== undefined ? textOptions.caseSensitive : true,
        ignoreWhitespace: textOptions.ignoreWhitespace !== undefined ? textOptions.ignoreWhitespace : false,
        showLineNumbers: textOptions.showLineNumbers !== undefined ? textOptions.showLineNumbers : true
      };

      console.log('🐛 DEBUG: Safe text options:', safeTextOptions);

      let result;

      switch (fileType) {
        case 'text':
          // Read file contents first
          console.log('🐛 DEBUG: Reading file contents...');
          
          const file1Content = await readFileContent(file1);
          const file2Content = await readFileContent(file2);

          console.log('🐛 DEBUG: File contents read successfully');
          console.log('🐛 DEBUG: File 1 content length:', file1Content?.length);
          console.log('🐛 DEBUG: File 2 content length:', file2Content?.length);

          // Validate file contents
          if (!file1Content || !file2Content) {
            throw new Error('Failed to read file contents. Please ensure both files contain text.');
          }

          if (typeof file1Content !== 'string' || typeof file2Content !== 'string') {
            throw new Error('File contents are not valid text strings.');
          }

          console.log('🐛 DEBUG: Calling compareTextFiles_main...');

          // Try the comparison function with different parameter formats
          let rawTextResults;
          
          try {
            // First try: pass file content strings (most likely correct)
            console.log('🐛 DEBUG: Trying compareTextFiles_main with file contents...');
            rawTextResults = await compareTextFiles_main(
              file1Content, 
              file2Content, 
              safeTextOptions
            );
          } catch (error1) {
            console.log('🐛 DEBUG: Failed with file contents, trying with file objects...', error1.message);
            
            try {
              // Second try: pass file objects (legacy format)
              rawTextResults = await compareTextFiles_main(
                file1, 
                file2, 
                safeTextOptions
              );
            } catch (error2) {
              console.log('🐛 DEBUG: Failed with file objects, trying basic call...', error2.message);
              
              // Third try: basic call without options
              rawTextResults = await compareTextFiles_main(file1Content, file2Content);
            }
          }

          console.log('🐛 DEBUG: Raw comparison results:', rawTextResults);

          // Adapt the results to TextResults expected format
          result = adaptTextComparisonResults(
            rawTextResults,
            file1Content,
            file2Content,
            file1.name,
            file2.name
          );

          console.log('🐛 DEBUG: Final adapted result:', result);
          break;
          
        case 'json':
          console.log('🐛 DEBUG: Processing JSON files...');
          const json1Content = await readFileContent(file1);
          const json2Content = await readFileContent(file2);
          
          const json1 = await parseJSONFile(json1Content);
          const json2 = await parseJSONFile(json2Content);
          result = await compareJSONFiles(json1, json2, jsonOptions);
          break;
          
        case 'xml':
          console.log('🐛 DEBUG: Processing XML files...');
          const xml1Content = await readFileContent(file1);
          const xml2Content = await readFileContent(file2);
          
          const xml1 = await parseXMLFile(xml1Content);
          const xml2 = await parseXMLFile(xml2Content);
          result = await compareXMLFiles(xml1, xml2, xmlOptions);
          break;
          
        case 'pdf':
          console.log('🐛 DEBUG: Processing PDF files...');
          const pdf1 = await parsePDFFile(file1);
          const pdf2 = await parsePDFFile(file2);
          result = await comparePDFFiles(pdf1, pdf2, pdfOptions);
          break;
          
        default:
          throw new Error('Unsupported file type');
      }

      console.log('🐛 DEBUG: Setting final result:', result);
      setResults(result);
      
    } catch (err) {
      console.error('🚨 COMPARISON ERROR:', err);
      console.error('🚨 ERROR STACK:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load files and show appropriate options
  const handleLoadFiles = async () => {
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }

    if (!session) {
      alert('Please sign in to compare documents.');
      return;
    }

    // Route to appropriate options based on file type
    switch (fileType) {
      case 'text':
        // Text files can be compared directly or show options
        setShowTextOptions(true);
        break;
      case 'json':
        setShowJsonOptions(true);
        break;
      case 'xml':
        setShowXmlOptions(true);
        break;
      case 'pdf':
        setShowPdfOptions(true);
        break;
      default:
        setError('Unsupported file type');
    }
  };

  // Format-specific results rendering
  const renderResults = () => {
    if (!results) return null;

    switch (fileType) {
      case 'text':
        return <TextResults results={results} file1Name={file1?.name} file2Name={file2?.name} />;
      case 'json':
        return <JsonResults results={results} file1Name={file1?.name} file2Name={file2?.name} />;
      case 'xml':
        return <XmlResults results={results} file1Name={file1?.name} file2Name={file2?.name} />;
      case 'pdf':
        return <PdfResults results={results} file1Name={file1?.name} file2Name={file2?.name} />;
      default:
        return null;
    }
  };

  // Text Options Component
  const TextOptionsComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        📄 Text Comparison Options
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Comparison Mode
          </label>
          <select
            value={textOptions.compareMode}
            onChange={(e) => setTextOptions({...textOptions, compareMode: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          >
            <option value="line">Line-by-line</option>
            <option value="word">Word-by-word</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={textOptions.caseSensitive}
              onChange={(e) => setTextOptions({...textOptions, caseSensitive: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Case sensitive</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={textOptions.ignoreWhitespace}
              onChange={(e) => setTextOptions({...textOptions, ignoreWhitespace: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Ignore whitespace</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={textOptions.showLineNumbers}
              onChange={(e) => setTextOptions({...textOptions, showLineNumbers: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Show line numbers</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleCompareFiles}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Comparing...' : '🚀 Compare Text Files'}
      </button>
    </div>
  );

  // JSON Options Component
  const JsonOptionsComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        🌳 JSON Comparison Options
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={jsonOptions.ignoreKeyOrder}
              onChange={(e) => setJsonOptions({...jsonOptions, ignoreKeyOrder: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Ignore object key order</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={jsonOptions.ignoreArrayOrder}
              onChange={(e) => setJsonOptions({...jsonOptions, ignoreArrayOrder: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Ignore array element order</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={jsonOptions.deepComparison}
              onChange={(e) => setJsonOptions({...jsonOptions, deepComparison: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Deep nested comparison</span>
          </label>
        </div>

        <div>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Numerical Tolerance
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={jsonOptions.numericalTolerance}
            onChange={(e) => setJsonOptions({...jsonOptions, numericalTolerance: parseFloat(e.target.value) || 0})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
            placeholder="0.00"
          />
        </div>
      </div>

      <button
        onClick={handleCompareFiles}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Comparing...' : '🚀 Compare JSON Files'}
      </button>
    </div>
  );

  // XML Options Component
  const XmlOptionsComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        🏗️ XML Comparison Options
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '500' }}>Ignore Differences</h4>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={xmlOptions.ignoreAttributeOrder}
              onChange={(e) => setXmlOptions({...xmlOptions, ignoreAttributeOrder: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Attribute order</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={xmlOptions.ignoreComments}
              onChange={(e) => setXmlOptions({...xmlOptions, ignoreComments: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Comments</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={xmlOptions.ignoreWhitespace}
              onChange={(e) => setXmlOptions({...xmlOptions, ignoreWhitespace: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Whitespace</span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '500' }}>Compare Elements</h4>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={xmlOptions.compareText}
              onChange={(e) => setXmlOptions({...xmlOptions, compareText: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Text content</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={xmlOptions.compareAttributes}
              onChange={(e) => setXmlOptions({...xmlOptions, compareAttributes: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Attributes</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleCompareFiles}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Comparing...' : '🚀 Compare XML Files'}
      </button>
    </div>
  );

  // PDF Options Component
  const PdfOptionsComponent = () => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        📑 PDF Comparison Options
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Comparison Mode
          </label>
          <select
            value={pdfOptions.compareMode}
            onChange={(e) => setPdfOptions({...pdfOptions, compareMode: e.target.value})}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          >
            <option value="text">Text content</option>
            <option value="visual">Visual appearance</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pdfOptions.ignoreFormatting}
              onChange={(e) => setPdfOptions({...pdfOptions, ignoreFormatting: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Ignore formatting</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pdfOptions.pageByPage}
              onChange={(e) => setPdfOptions({...pdfOptions, pageByPage: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Page-by-page comparison</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pdfOptions.includeImages}
              onChange={(e) => setPdfOptions({...pdfOptions, includeImages: e.target.checked})}
              style={{ accentColor: '#2563eb' }}
            />
            <span>Include images</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleCompareFiles}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Comparing...' : '🚀 Compare PDF Files'}
      </button>
    </div>
  );

  // Premium Modal Component
  const PremiumModal = () => {
    if (!showPremiumModal) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: '600' }}>
            🚀 Upgrade to Premium
          </h3>
          <p style={{ marginBottom: '20px' }}>
            Document comparison (JSON, XML, PDF) requires premium access. 
            Text file comparison is FREE forever!
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleModalUpgrade}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Upgrade Now
            </button>
            <button
              onClick={handleModalDismiss}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Head>
          <title>VeriDiff - Document Comparison</title>
        </Head>

        {/* Header (same as main compare page) */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                VeriDiff
              </span>
            </Link>
            
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link href="/compare" style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                ← Back to Spreadsheet Compare
              </Link>
              
              {session ? (
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.25rem'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      minWidth: '200px',
                      marginTop: '0.5rem',
                      zIndex: 1000
                    }}>
                      <div style={{ padding: '0.5rem' }}>
                        <button onClick={handleSignOut} style={{ 
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem',
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          borderRadius: '0.25rem'
                        }}>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={handleSignIn} style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px'
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            padding: '50px 30px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderRadius: '20px',
            marginBottom: '40px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              margin: '0 0 15px 0'
            }}>
              Document Compare
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: '0.9',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Compare text files, JSON, XML, and PDF documents with format-specific analysis tools. 
              Text comparisons are free forever!
            </p>
          </div>

          {/* File Type Selection */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 15px 0',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              Choose Document Type
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {[
                { value: 'text', label: 'Text Files (.txt)', free: true },
                { value: 'json', label: 'JSON Files (.json)', free: false },
                { value: 'xml', label: 'XML Files (.xml)', free: false },
                { value: 'pdf', label: 'PDF Files (.pdf)', free: false }
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: option.free ? '#f0fdf4' : 'white',
                    border: option.free ? '2px solid #22c55e' : '2px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="fileType"
                    value={option.value}
                    checked={fileType === option.value}
                    onChange={handleFileTypeChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>
                    {option.label}
                    {option.free && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '0.75em',
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        FREE
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* File Requirements and Tips */}
          {(fileType === 'text' || userTier === 'premium') && (
            <>
              <FileRequirementsInfo />
              <SuccessTips />
            </>
          )}

          {/* File Upload Section */}
          {(fileType === 'text' || userTier === 'premium') && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              marginBottom: '30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 15px 0',
                textAlign: 'center',
                fontWeight: '700'
              }}>
                Upload Your Files
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '25px',
                marginBottom: '35px'
              }}>
                {/* Enhanced File Upload Components */}
                <FileUploadWithValidation 
                  fileNum={1} 
                  file={file1} 
                  onChange={handleFileChange} 
                  fileType={fileType} 
                />
                <FileUploadWithValidation 
                  fileNum={2} 
                  file={file2} 
                  onChange={handleFileChange} 
                  fileType={fileType} 
                />
              </div>

              {/* Load Files Button */}
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={handleLoadFiles} 
                  disabled={loading || !file1 || !file2}
                  style={{
                    background: loading || !file1 || !file2
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: loading || !file1 || !file2 ? 'not-allowed' : 'pointer',
                    minWidth: '200px'
                  }}
                >
                  {loading ? 'Loading...' : '📄 Load Files'}
                </button>
              </div>
            </div>
          )}

          {/* Format-Specific Options */}
          {showTextOptions && <TextOptionsComponent />}
          {showJsonOptions && <JsonOptionsComponent />}
          {showXmlOptions && <XmlOptionsComponent />}
          {showPdfOptions && <PdfOptionsComponent />}

          {/* Enhanced Error Display */}
          {error && (
            <HelpfulErrorDisplay 
              error={new Error(error)} 
              fileName={file1?.name || file2?.name} 
            />
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
              <strong>Processing...</strong> Please wait while we analyze your documents...
            </div>
          )}

          {/* Results */}
          {renderResults()}
        </main>

        {/* Premium Modal */}
        <PremiumModal />
      </div>
    </AuthGuard>
  );
}

export default DocumentComparePage;
