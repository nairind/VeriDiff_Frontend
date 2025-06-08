// /components/UploadZone.js
import React, { useState } from 'react';

const UploadZone = ({ onFilesReady }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  const showErrorMessage = (title, message) => {
    setErrorMessage({ title, message });
    setTimeout(() => setErrorMessage(null), 6000);
  };

  const showWarningMessage = (title, message) => {
    setWarningMessage({ title, message });
    setTimeout(() => setWarningMessage(null), 5000);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📄';
      case 'pdf':
        return '📕';
      default:
        return '📁';
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    if (extension === 'csv') return 'csv';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'excel': return 'EXCEL';
      case 'csv': return 'CSV';
      case 'pdf': return 'PDF';
      default: return 'UNKNOWN';
    }
  };

  const areFilesCompatible = (file1Type, file2Type) => {
    // Valid combinations
    const validCombinations = [
      ['excel', 'excel'],
      ['csv', 'csv'],
      ['excel', 'csv'],
      ['csv', 'excel'],
      ['pdf', 'pdf']
    ];
    
    return validCombinations.some(([type1, type2]) => 
      (file1Type === type1 && file2Type === type2)
    );
  };

  const getIncompatibilityMessage = (file1Type, file2Type) => {
    const file1Label = getFileTypeLabel(file1Type);
    const file2Label = getFileTypeLabel(file2Type);
    
    return `${file1Label} and ${file2Label} files cannot be compared together.\n\n` +
           `${file1Label} files contain ${file1Type === 'pdf' ? 'text content' : 'structured data'} while ` +
           `${file2Label} files contain ${file2Type === 'pdf' ? 'text content' : 'structured data'}.\n\n` +
           'Supported combinations:\n' +
           '• Excel ↔ Excel (spreadsheet vs spreadsheet)\n' +
           '• CSV ↔ CSV (data vs data)\n' +
           '• Excel ↔ CSV (cross-format data comparison)\n' +
           '• PDF ↔ PDF (document vs document)\n\n' +
           'Please select compatible file types for comparison.';
  };

  const arrangeFiles = (uploadedFiles) => {
    // Smart auto-arrangement with priority system
    // Priority: Excel (1), CSV (2), PDF (3)
    const priority = { excel: 1, csv: 2, pdf: 3 };
    
    return uploadedFiles.sort((a, b) => {
      const aType = getFileType(a.name);
      const bType = getFileType(b.name);
      return (priority[aType] || 99) - (priority[bType] || 99);
    });
  };

  const validateAndProcessFiles = (filesToValidate) => {
    // Clear previous messages
    setErrorMessage(null);
    setWarningMessage(null);

    if (filesToValidate.length > 2) {
      showErrorMessage('Too many files', 'Please upload only 2 files for comparison');
      return { isValid: false, arrangedFiles: [] };
    }

    if (filesToValidate.length !== 2) {
      // Just update the files without proceeding to comparison
      const arrangedFiles = arrangeFiles(filesToValidate);
      setFiles(arrangedFiles);
      return { isValid: true, arrangedFiles: arrangedFiles, readyToCompare: false };
    }

    const arrangedFiles = arrangeFiles(filesToValidate);
    const [file1, file2] = arrangedFiles;
    const file1Type = getFileType(file1.name);
    const file2Type = getFileType(file2.name);

    // Check compatibility
    if (!areFilesCompatible(file1Type, file2Type)) {
      showErrorMessage('Incompatible File Types', getIncompatibilityMessage(file1Type, file2Type));
      return { isValid: false, arrangedFiles: [] };
    }

    // Files are compatible and ready to compare
    setFiles(arrangedFiles);
    return { isValid: true, arrangedFiles: arrangedFiles, readyToCompare: true };
  };

  const handleFiles = async (newFiles) => {
    console.log('🔄 handleFiles called with:', newFiles.map(f => f.name));
    console.log('📊 Current files in state:', files.map(f => f.name));
    
    setIsProcessing(true);
    
    try {
      const updatedFiles = [...files, ...newFiles];
      console.log('📋 Updated files list:', updatedFiles.map(f => f.name));
      
      const validationResult = validateAndProcessFiles(updatedFiles);
      console.log('✅ Validation result:', validationResult);
      
      if (validationResult.isValid && validationResult.readyToCompare) {
        console.log('🚀 Ready to compare! Auto-proceeding in 800ms...');
        // If we have exactly 2 compatible files, process them and auto-proceed
        setTimeout(() => {
          console.log('⏰ Timeout triggered, calling processAndProceed');
          processAndProceed(validationResult.arrangedFiles);
        }, 800);
      } else if (validationResult.isValid) {
        console.log('📝 Files valid but not ready to compare yet (need more files)');
      } else {
        console.log('❌ Validation failed');
      }
    } catch (error) {
      console.error('❌ Error in handleFiles:', error);
      showErrorMessage('Processing error', 'Error processing files. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const processAndProceed = async (filesToProcess) => {
    console.log('🔧 processAndProceed called with:', filesToProcess.map(f => f.name));
    
    try {
      const [file1, file2] = filesToProcess;

      // Store file metadata (matching existing structure)
      const file1Data = {
        name: file1.name,
        size: file1.size,
        type: file1.type,
        lastModified: file1.lastModified
      };
      const file2Data = {
        name: file2.name,
        size: file2.size,
        type: file2.type,
        lastModified: file2.lastModified
      };

      console.log('💾 Storing file metadata...');
      sessionStorage.setItem('veridiff_file1_info', JSON.stringify(file1Data));
      sessionStorage.setItem('veridiff_file2_info', JSON.stringify(file2Data));

      // Store actual file data as base64 (matching existing structure)
      const storeFile = (file, key) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              // Store as base64 string (remove data URL prefix)
              const base64 = e.target.result.split(',')[1];
              sessionStorage.setItem(key, base64);
              console.log(`💾 Stored ${key} (${base64.length} chars)`);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      console.log('📖 Reading file contents...');
      await Promise.all([
        storeFile(file1, 'veridiff_file1_data'),
        storeFile(file2, 'veridiff_file2_data')
      ]);

      console.log('✅ Files processed successfully, calling onFilesReady');
      // Call the callback to proceed
      onFilesReady({ file1, file2 });
      
    } catch (error) {
      console.error('❌ Error in processAndProceed:', error);
      showErrorMessage('Processing error', 'Error processing files. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    console.log('📁 Files dropped');
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log('📁 Dropped files:', droppedFiles.map(f => f.name));
    
    const validFiles = [];
    const invalidFiles = [];
    
    droppedFiles.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv', 'pdf'].includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    console.log('✅ Valid files:', validFiles.map(f => f.name));
    console.log('❌ Invalid files:', invalidFiles.map(f => f.name));

    // Handle different scenarios
    if (validFiles.length === 0) {
      showErrorMessage('No supported files found', 
        `Please upload Excel (.xlsx, .xls), CSV, or PDF files only.\n\nRejected: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (invalidFiles.length > 0) {
      showWarningMessage('Some files ignored', 
        `Only processing supported files.\n\nIgnored: ${invalidFiles.map(f => f.name).join(', ')}\nProcessing: ${validFiles.map(f => f.name).join(', ')}`);
    }

    handleFiles(validFiles);
  };

  const handleInputChange = (e) => {
    console.log('📁 Files selected via input');
    const selectedFiles = Array.from(e.target.files);
    console.log('📁 Selected files:', selectedFiles.map(f => f.name));
    
    const validFiles = [];
    const invalidFiles = [];
    
    selectedFiles.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv', 'pdf'].includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    console.log('✅ Valid files:', validFiles.map(f => f.name));
    console.log('❌ Invalid files:', invalidFiles.map(f => f.name));

    // Handle different scenarios
    if (validFiles.length === 0) {
      showErrorMessage('No supported files found', 
        `Please select Excel (.xlsx, .xls), CSV, or PDF files only.\n\nSelected: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (invalidFiles.length > 0) {
      showWarningMessage('Some files ignored', 
        `Only processing supported files.\n\nIgnored: ${invalidFiles.map(f => f.name).join(', ')}\nProcessing: ${validFiles.map(f => f.name).join(', ')}`);
    }

    handleFiles(validFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setErrorMessage(null); // Clear any compatibility errors
  };

  const openFileDialog = () => {
    document.getElementById('unified-file-input')?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const renderFileStatus = () => {
    if (files.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '0.5rem' 
          }}>
            Drop Any 2 Files to Compare
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Excel (.xlsx, .xls), CSV, and PDF files supported
          </div>
          <div style={{ 
            color: '#059669', 
            fontSize: '0.8rem', 
            marginTop: '0.5rem',
            fontWeight: '500'
          }}>
            📈 Now supports large PDFs up to 100MB!
          </div>
        </div>
      );
    }

    if (files.length === 1) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              1 file uploaded, need 1 more
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map((file, index) => {
              const isLargeFile = file.size > 25 * 1024 * 1024; // 25MB+
              const isVeryLargeFile = file.size > 75 * 1024 * 1024; // 75MB+
              
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isVeryLargeFile ? '#fef3c7' : isLargeFile ? '#fef7e6' : '#f9fafb',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${isVeryLargeFile ? '#f59e0b' : isLargeFile ? '#fed7aa' : '#e5e7eb'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.name)}</span>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          color: '#6b7280',
                          background: '#e5e7eb',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem'
                        }}>
                          {getFileTypeLabel(getFileType(file.name))}
                        </span>
                        <span style={{ color: '#6b7280' }}>
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                        {isVeryLargeFile && (
                          <span style={{ color: '#f59e0b', fontWeight: '600' }}>Very Large</span>
                        )}
                        {isLargeFile && !isVeryLargeFile && (
                          <span style={{ color: '#d97706', fontWeight: '600' }}>Large</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (files.length === 2) {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
      const isLargeProcessing = totalSize > 50 * 1024 * 1024; // 50MB+ total
      const estimatedTime = isLargeProcessing ? Math.ceil(totalSizeMB / 10) : null; // ~10MB per minute
      
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#059669', 
            marginBottom: '1rem' 
          }}>
            Ready to Compare!
          </div>
          
          {/* Large file warning */}
          {isLargeProcessing && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fed7aa',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.25rem' }}>
                ⚠️ Large Files Detected ({totalSizeMB}MB total)
              </div>
              <div style={{ color: '#92400e' }}>
                Processing may take {estimatedTime}-{estimatedTime * 2} minutes. Ensure stable connection and keep browser active.
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {files.map((file, index) => {
              const isLargeFile = file.size > 25 * 1024 * 1024;
              const isVeryLargeFile = file.size > 75 * 1024 * 1024;
              
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ecfdf5',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1fae5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.name)}</span>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>File {index + 1} ({getFileTypeLabel(getFileType(file.name))})</span>
                        <span>• {(file.size / 1024 / 1024).toFixed(1)}MB</span>
                        {isVeryLargeFile && (
                          <span style={{ color: '#f59e0b', fontWeight: '600' }}>Very Large</span>
                        )}
                        {isLargeFile && !isVeryLargeFile && (
                          <span style={{ color: '#d97706', fontWeight: '600' }}>Large</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {isProcessing ? 'Processing files...' : 'Starting comparison...'}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        style={{
          position: 'relative',
          border: `2px dashed ${
            dragActive 
              ? '#2563eb' 
              : files.length === 2 
                ? '#10b981'
                : '#d1d5db'
          }`,
          borderRadius: '0.75rem',
          padding: '2rem',
          transition: 'all 0.2s ease',
          cursor: files.length < 2 ? 'pointer' : 'default',
          background: dragActive 
            ? '#eff6ff' 
            : files.length === 2 
              ? '#ecfdf5'
              : '#f9fafb',
          opacity: isProcessing ? 0.75 : 1,
          pointerEvents: isProcessing ? 'none' : 'auto',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={files.length < 2 ? openFileDialog : undefined}
      >
        <input
          id="unified-file-input"
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {renderFileStatus()}

        {files.length < 2 && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={openFileDialog}
              style={{
                color: '#2563eb',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              or click to browse files
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div style={{
          marginTop: '1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          color: '#991b1b'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>❌</span>
            {errorMessage.title}
          </div>
          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
            {errorMessage.message}
          </div>
        </div>
      )}

      {/* Warning Message */}
      {warningMessage && (
        <div style={{
          marginTop: '1rem',
          background: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          color: '#92400e'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            {warningMessage.title}
          </div>
          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
            {warningMessage.message}
          </div>
        </div>
      )}

      {files.length > 0 && files.length < 2 && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <span>💡</span>
            <span>Files auto-arrange by type: Excel → CSV → PDF</span>
          </div>
          
          {/* Large file tip */}
          {files.some(file => file.size > 25 * 1024 * 1024) && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fef3c7',
              color: '#92400e',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <span>🔥</span>
              <span>Large PDF detected: Ensure stable internet & 8GB+ RAM for best performance</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
