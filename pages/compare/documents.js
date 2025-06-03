import { useState, useEffect } from 'react';
import Head from 'next/head';   
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AuthGuard from '../../components/auth/AuthGuard';

// Import document-specific utilities
import { compareTextFiles_main } from '../../utils/textFileComparison';
import { parseJSONFile, compareJSONFiles } from '../../utils/jsonFileComparison1';
import { parseXMLFile, compareXMLFiles } from '../../utils/xmlFileComparison1';
import { parsePDFFile, comparePDFFiles } from '../../utils/pdfFileComparison1';

// Import format-specific result components
import TextResults from '../../components/TextResults';
import JsonResults from '../../components/JsonResults';
import XmlResults from '../../components/XmlResults';
import PdfResults from '../../components/PdfResults';

// ===== UPDATED FILE SIZE LIMITS =====
const getFileSizeLimit = (fileType) => {
  switch (fileType) {
    case 'text':
      return 10 * 1024 * 1024; // 10MB - text files are usually small
    case 'json':
      return 25 * 1024 * 1024; // 25MB - JSON can be large datasets
    case 'xml': 
      return 25 * 1024 * 1024; // 25MB - XML documents can be substantial
    case 'pdf':
      return 100 * 1024 * 1024; // 100MB - PDFs can be very large
    default:
      return 10 * 1024 * 1024;
  }
};

const getFileSizeLimitText = (fileType) => {
  switch (fileType) {
    case 'text': return '10MB';
    case 'json': return '25MB';
    case 'xml': return '25MB';
    case 'pdf': return '100MB';
    default: return '10MB';
  }
};

// ===== DYNAMIC USER GUIDANCE COMPONENTS =====

// Dynamic File Requirements Info Component
const FileRequirementsInfo = ({ fileType }) => {
  const getFileTypeInfo = () => {
    switch (fileType) {
      case 'text':
        return {
          title: '📋 Supported Text Files',
          supported: [
            '.txt, .csv, .log files',
            'Code files (.js, .html, .css)',
            'Config files (.json, .xml, .yaml)'
          ],
          requirements: [
            'Maximum size: 10MB',
            'UTF-8 text encoding',
            'No binary/image files'
          ]
        };
      
      case 'json':
        return {
          title: '🌳 Supported JSON Files',
          supported: [
            '.json files with valid syntax',
            'Nested objects and arrays',
            'All JSON data types',
            'Pretty-formatted or minified'
          ],
          requirements: [
            'Maximum size: 25MB',
            'Valid JSON syntax required',
            'UTF-8 encoding preferred'
          ]
        };
      
      case 'xml':
        return {
          title: '🏗️ Supported XML Files',
          supported: [
            '.xml files with valid markup',
            'XML documents with namespaces',
            'Elements, attributes, and text',
            'XML with comments and CDATA'
          ],
          requirements: [
            'Maximum size: 25MB',
            'Well-formed XML required',
            'UTF-8 encoding preferred'
          ]
        };
      
      case 'pdf':
        return {
          title: '📑 Supported PDF Files',
          supported: [
            '.pdf files with extractable text',
            'Multi-page documents',
            'Text-based content',
            'Standard PDF formats'
          ],
          requirements: [
            'Maximum size: 100MB',
            'Text-extractable PDFs only',
            'No password-protected files'
          ]
        };
      
      default:
        return {
          title: '📋 Supported Files',
          supported: ['Select a file type above'],
          requirements: ['File type not selected']
        };
    }
  };

  const info = getFileTypeInfo();

  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #2563eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      fontSize: '0.9rem'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1rem' }}>
        {info.title}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <strong>✅ Supported:</strong>
          {info.supported.map((item, index) => (
            <div key={index}>• {item}</div>
          ))}
        </div>
        <div>
          <strong>📏 Requirements:</strong>
          {info.requirements.map((item, index) => (
            <div key={index}>• {item}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dynamic Success Tips Component
const SuccessTips = ({ fileType }) => {
  const getSuccessTips = () => {
    switch (fileType) {
      case 'text':
        return [
          { label: 'Small files compare faster:', tip: 'Under 1MB for instant results' },
          { label: 'Save as UTF-8:', tip: 'Ensures all characters display correctly' },
          { label: 'Use .txt extension:', tip: 'Guarantees compatibility' },
          { label: 'Line-by-line works best:', tip: 'For code and structured text' }
        ];
      
      case 'json':
        return [
          { label: 'Validate JSON first:', tip: 'Use jsonlint.com to check syntax' },
          { label: 'Pretty-format for clarity:', tip: 'Formatted JSON is easier to compare' },
          { label: 'Consistent key ordering:', tip: 'Helps identify structural changes' },
          { label: 'Nested structures supported:', tip: 'Deep object comparison included' }
        ];
      
      case 'xml':
        return [
          { label: 'Well-formed XML required:', tip: 'Validate with XML validator first' },
          { label: 'Namespace handling:', tip: 'Namespaces are compared accurately' },
          { label: 'Attribute comparison:', tip: 'Both order and values are analyzed' },
          { label: 'Comments preserved:', tip: 'XML comments included in comparison' }
        ];
      
      case 'pdf':
        return [
          { label: 'Text-based PDFs work best:', tip: 'Avoid image-only PDF files' },
          { label: 'Page-by-page analysis:', tip: 'Each page compared individually' },
          { label: 'Large files supported:', tip: 'Up to 100MB for comprehensive documents' },
          { label: 'Real text extraction:', tip: 'Uses PDF.js for accurate text analysis' }
        ];
      
      default:
        return [
          { label: 'Select file type above:', tip: 'Choose your document format first' }
        ];
    }
  };

  const tips = getSuccessTips();

  return (
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
        {tips.map((tip, index) => (
          <div key={index}>
            • <strong>{tip.label}</strong> {tip.tip}
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Error Messages with Solutions
const getHelpfulErrorMessage = (error, fileName) => {
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('too large')) {
    return {
      title: "📁 File Too Large",
      message: `"${fileName}" exceeds our size limit.`,
      solutions: [
        "Text files: Maximum 10MB",
        "JSON/XML files: Maximum 25MB", 
        "PDF files: Maximum 100MB",
        "Try splitting large files into smaller sections",
        "For large datasets, consider our Premium bulk comparison tools"
      ]
    };
  }
  
  if (errorMsg.includes('pdf.js') || errorMsg.includes('pdfjslib') || errorMsg.includes('pdf processing')) {
    return {
      title: "📚 PDF Processing Error",
      message: `PDF processing service issue.`,
      solutions: [
        "Refresh the page and try again",
        "Check your internet connection is stable",
        "Disable ad blockers temporarily",
        "Try a different PDF file to test",
        "Contact support if the issue persists"
      ]
    };
  }
  
  if (errorMsg.includes('binary') || errorMsg.includes('not readable as text')) {
    return {
      title: "🚫 Binary File Detected",
      message: `"${fileName}" appears to be a binary file.`,
      solutions: [
        "For PDF files, use the PDF comparison tool",
        "For images, convert to text first",
        "Save files as plain text (.txt) format",
        "Use appropriate file type selector"
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
  
  if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
    return {
      title: "🔒 Protected PDF File",
      message: `"${fileName}" is password-protected.`,
      solutions: [
        "Remove password protection from the PDF",
        "Use an unprotected version of the document",
        "Contact the document owner for an unlocked version"
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
      "Ensure both files are valid and correct format",
      "Check file size is within limits",
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
const readFileContent = (file, fileType = 'text') => {
  return new Promise((resolve, reject) => {
    console.log('🐛 DEBUG: Reading file:', file.name, 'Size:', file.size, 'Type:', file.type, 'Expected:', fileType);
    
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('File is empty'));
      return;
    }

    const sizeLimit = getFileSizeLimit(fileType);
    if (file.size > sizeLimit) {
      reject(new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size for ${fileType.toUpperCase()} files is ${getFileSizeLimitText(fileType)}.`));
      return;
    }

    // For PDF files, use ArrayBuffer reading (not text)
    if (fileType === 'pdf') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          console.log('✅ PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);
          resolve(arrayBuffer);
        } catch (error) {
          console.error('❌ PDF file reading error:', error);
          reject(new Error('Failed to process PDF file content'));
        }
      };
      
      reader.onerror = (e) => {
        console.error('❌ FileReader error:', e);
        reject(new Error(`Failed to read PDF file "${file.name}". The file may be corrupted.`));
      };
      
      reader.readAsArrayBuffer(file);
      return;
    }

    // For text-based files (JSON, XML, TXT), use text reading
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
  
  const getAcceptedFileTypes = () => {
    switch (fileType) {
      case 'text':
        return ".txt,.csv,.log,.md,.html,.css,.js,.json,.xml,.yaml,.yml,.ini,.cfg,.conf,text/*";
      case 'json':
        return ".json,application/json";
      case 'xml':
        return ".xml,application/xml,text/xml";
      case 'pdf':
        return ".pdf,application/pdf";
      default:
        return "*";
    }
  };
  
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setValidationWarning(null);
    
    try {
      const sizeLimit = getFileSizeLimit(fileType);
      const sizeLimitText = getFileSizeLimitText(fileType);
      
      // Updated size validation with proper limits
      if (selectedFile.size > sizeLimit) {
        setValidationWarning({
          type: 'error',
          message: `File is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB (max ${sizeLimitText} allowed for ${fileType.toUpperCase()} files)`
        });
        return;
      }
      
      // Warning for large files (but still within limits)
      if (selectedFile.size > sizeLimit * 0.7) { // 70% of limit
        setValidationWarning({
          type: 'warning',
          message: `Large file (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) - comparison may take longer`
        });
      }
      
      // File type specific validation
      const fileName = selectedFile.name.toLowerCase();
      let isValidType = false;
      
      switch (fileType) {
        case 'text':
          const textExtensions = ['.txt', '.csv', '.log', '.md', '.html', '.css', '.js', '.json', '.xml'];
          isValidType = textExtensions.some(ext => fileName.endsWith(ext)) || selectedFile.type.startsWith('text/');
          break;
        case 'json':
          isValidType = fileName.endsWith('.json') || selectedFile.type === 'application/json';
          break;
        case 'xml':
          isValidType = fileName.endsWith('.xml') || selectedFile.type.includes('xml');
          break;
        case 'pdf':
          isValidType = fileName.endsWith('.pdf') || selectedFile.type === 'application/pdf';
          break;
        default:
          isValidType = true;
      }
      
      if (!isValidType) {
        setValidationWarning({
          type: 'error',
          message: `Please select a ${fileType.toUpperCase()} file with the correct extension`
        });
        return;
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
        accept={getAcceptedFileTypes()}
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

      let result;

      switch (fileType) {
        case 'text':
          // Read file contents first
          console.log('🐛 DEBUG: Reading text file contents...');
          
          const file1Content = await readFileContent(file1, 'text');
          const file2Content = await readFileContent(file2, 'text');

          console.log('🐛 DEBUG: Text file contents read successfully');

          // Ensure textOptions has all required properties with safe defaults
          const safeTextOptions = {
            compareMode: textOptions.compareMode || 'line',
            caseSensitive: textOptions.caseSensitive !== undefined ? textOptions.caseSensitive : true,
            ignoreWhitespace: textOptions.ignoreWhitespace !== undefined ? textOptions.ignoreWhitespace : false,
            showLineNumbers: textOptions.showLineNumbers !== undefined ? textOptions.showLineNumbers : true
          };

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

          // Adapt the results to TextResults expected format
          result = adaptTextComparisonResults(
            rawTextResults,
            file1Content,
            file2Content,
            file1.name,
            file2.name
          );
          break;
          
        case 'json':
          console.log('🐛 DEBUG: Processing JSON files...');
          result = await compareJSONFiles(file1, file2, jsonOptions);
          break;
          
        case 'xml':
          console.log('🐛 DEBUG: Processing XML files...');
          result = await compareXMLFiles(file1, file2, xmlOptions);
          break;
          
        case 'pdf':
          console.log('🐛 DEBUG: Processing PDF files...');
          // PDFs are handled differently - pass file objects directly
          result = await comparePDFFiles(file1, file2, pdfOptions);
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
          
          {/* FIXED PDF.js Loading System - Consistent Versions */}
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            onLoad="console.log('✅ PDF.js main script loaded from CDNJS'); window.pdfJsMainLoaded = true;"
            onError="console.error('❌ PDF.js main script failed from CDNJS'); window.pdfJsMainError = true;"
          ></script>
          
          {/* PDF.js Initialization with Enhanced Error Handling */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let initAttempts = 0;
                const maxAttempts = 8;
                let workerConfigured = false;
                
                // Multiple worker URLs to try (consistent with main version 3.11.174)
                const workerUrls = [
                  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
                  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
                  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
                ];
                
                function attemptPDFJSInit() {
                  initAttempts++;
                  console.log('🔄 PDF.js initialization attempt', initAttempts);
                  
                  if (typeof window.pdfjsLib !== 'undefined' && !workerConfigured) {
                    console.log('📚 PDF.js library detected, configuring worker...');
                    
                    let workerIndex = 0;
                    
                    function tryWorker() {
                      if (workerIndex >= workerUrls.length) {
                        console.error('❌ All PDF.js worker URLs failed');
                        showPDFJSError();
                        return;
                      }
                      
                      const workerUrl = workerUrls[workerIndex];
                      console.log('🔧 Trying worker URL:', workerUrl);
                      
                      try {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                        
                        // Test worker by creating a dummy task
                        const testData = new Uint8Array([37, 80, 68, 70]); // "%PDF"
                        const loadingTask = window.pdfjsLib.getDocument({ data: testData });
                        
                        // Set timeout for worker test
                        const testTimeout = setTimeout(() => {
                          console.warn('⚠️ Worker test timeout, trying next URL...');
                          workerIndex++;
                          tryWorker();
                        }, 3000);
                        
                        loadingTask.promise.then(() => {
                          clearTimeout(testTimeout);
                          console.log('✅ PDF.js worker configured successfully with:', workerUrl);
                          workerConfigured = true;
                          window.pdfJsReady = true;
                          
                          // Notify successful initialization
                          if (window.onPDFJSReady) {
                            window.onPDFJSReady();
                          }
                          
                        }).catch((error) => {
                          clearTimeout(testTimeout);
                          console.warn('⚠️ Worker test failed:', error.message);
                          workerIndex++;
                          tryWorker();
                        });
                        
                      } catch (error) {
                        console.warn('⚠️ Worker configuration failed:', error.message);
                        workerIndex++;
                        tryWorker();
                      }
                    }
                    
                    tryWorker();
                    return;
                  }
                  
                  // PDF.js not loaded yet or already configured
                  if (!workerConfigured && initAttempts < maxAttempts) {
                    console.log('⏳ PDF.js not ready, retrying in 800ms...');
                    setTimeout(attemptPDFJSInit, 800);
                  } else if (initAttempts >= maxAttempts && !workerConfigured) {
                    console.error('❌ PDF.js failed to initialize after', maxAttempts, 'attempts');
                    loadFallbackPDFJS();
                  }
                }
                
                function loadFallbackPDFJS() {
                  console.log('🔄 Loading fallback PDF.js from different CDN...');
                  
                  const fallbackScript = document.createElement('script');
                  fallbackScript.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
                  fallbackScript.onload = function() {
                    console.log('✅ Fallback PDF.js loaded, retrying initialization...');
                    setTimeout(attemptPDFJSInit, 1000);
                  };
                  fallbackScript.onerror = function() {
                    console.error('❌ Fallback PDF.js also failed');
                    showPDFJSError();
                  };
                  document.head.appendChild(fallbackScript);
                }
                
                function showPDFJSError() {
                  console.error('🚨 PDF.js completely failed to load');
                  window.pdfJsError = true;
                  
                  // Create persistent error notification
                  const errorDiv = document.createElement('div');
                  errorDiv.id = 'pdfjs-error-persistent';
                  errorDiv.innerHTML = \`
                    <div style="
                      position: fixed;
                      top: 80px;
                      right: 20px;
                      background: #fef2f2;
                      border: 2px solid #dc2626;
                      border-radius: 12px;
                      padding: 16px;
                      max-width: 350px;
                      z-index: 10000;
                      box-shadow: 0 4px 20px rgba(220,38,38,0.3);
                      animation: slideIn 0.3s ease-out;
                    ">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.2rem;">⚠️</span>
                        <strong style="color: #dc2626; font-size: 0.9rem;">PDF Service Unavailable</strong>
                      </div>
                      <p style="margin: 0 0 10px 0; color: #7f1d1d; font-size: 0.8rem; line-height: 1.3;">
                        PDF comparison is temporarily disabled due to library loading issues.
                      </p>
                      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button onclick="window.location.reload()" style="
                          background: #dc2626; color: white; border: none; padding: 4px 8px; 
                          border-radius: 4px; cursor: pointer; font-size: 0.75rem;
                        ">Refresh</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                          background: #6b7280; color: white; border: none; padding: 4px 8px; 
                          border-radius: 4px; cursor: pointer; font-size: 0.75rem;
                        ">Dismiss</button>
                      </div>
                    </div>
                    <style>
                      @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                      }
                    </style>
                  \`;
                  document.body.appendChild(errorDiv);
                  
                  // Auto-dismiss after 10 seconds
                  setTimeout(() => {
                    const errorEl = document.getElementById('pdfjs-error-persistent');
                    if (errorEl) errorEl.remove();
                  }, 10000);
                }
                
                // Start initialization sequence
                console.log('🚀 Starting PDF.js initialization sequence...');
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(attemptPDFJSInit, 300);
                  });
                } else {
                  setTimeout(attemptPDFJSInit, 300);
                }
                
                // Backup initialization on window load
                window.addEventListener('load', function() {
                  if (!window.pdfJsReady && !window.pdfJsError) {
                    console.log('🔄 Backup PDF.js initialization on window load...');
                    setTimeout(attemptPDFJSInit, 1000);
                  }
                });
                
              })();
            `
          }} />
        </Head>

        {/* Header */}
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

          {/* Dynamic File Requirements and Tips */}
          {(fileType === 'text' || userTier === 'premium') && (
            <>
              <FileRequirementsInfo fileType={fileType} />
              <SuccessTips fileType={fileType} />
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
