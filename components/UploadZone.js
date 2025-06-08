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
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const showWarningMessage = (title, message) => {
    setWarningMessage({ title, message });
    setTimeout(() => setWarningMessage(null), 4000);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📄';
      default:
        return '📁';
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['xlsx', 'xls'].includes(extension) ? 'excel' : 'csv';
  };

  const arrangeFiles = (uploadedFiles) => {
    // Auto-arrange: Excel files first, CSV files second
    const excelFiles = uploadedFiles.filter(f => getFileType(f.name) === 'excel');
    const csvFiles = uploadedFiles.filter(f => getFileType(f.name) === 'csv');
    
    return [...excelFiles, ...csvFiles];
  };

  const handleFiles = async (newFiles) => {
    // Clear any previous messages
    setErrorMessage(null);
    setWarningMessage(null);
    
    if (files.length + newFiles.length > 2) {
      showErrorMessage('Too many files', 'Please upload only 2 files for comparison');
      return;
    }

    setIsProcessing(true);
    
    try {
      const updatedFiles = [...files, ...newFiles];
      const arrangedFiles = arrangeFiles(updatedFiles);
      setFiles(arrangedFiles);

      // If we have exactly 2 files, process them and auto-proceed
      if (arrangedFiles.length === 2) {
        setTimeout(() => {
          processAndProceed(arrangedFiles);
        }, 800); // Brief delay to show the "Ready to Compare" state
      }
    } catch (error) {
      console.error('Error processing files:', error);
      showErrorMessage('Processing error', 'Error processing files. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const processAndProceed = async (filesToProcess) => {
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
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      await Promise.all([
        storeFile(file1, 'veridiff_file1_data'),
        storeFile(file2, 'veridiff_file2_data')
      ]);

      // Call the callback to proceed
      onFilesReady({ file1, file2 });
      
    } catch (error) {
      console.error('Error processing files:', error);
      showErrorMessage('Processing error', 'Error processing files. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = [];
    const invalidFiles = [];
    
    droppedFiles.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    // Handle different scenarios
    if (validFiles.length === 0) {
      showErrorMessage('No supported files found', 
        `Please upload Excel (.xlsx, .xls) or CSV files only.\n\nRejected: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (invalidFiles.length > 0) {
      showWarningMessage('Some files ignored', 
        `Only processing supported files.\n\nIgnored: ${invalidFiles.map(f => f.name).join(', ')}\nProcessing: ${validFiles.map(f => f.name).join(', ')}`);
    }

    handleFiles(validFiles);
  };

  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];
    
    selectedFiles.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(extension)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    // Handle different scenarios
    if (validFiles.length === 0) {
      showErrorMessage('No supported files found', 
        `Please select Excel (.xlsx, .xls) or CSV files only.\n\nSelected: ${invalidFiles.map(f => f.name).join(', ')}`);
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
            Excel (.xlsx, .xls) and CSV files supported
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
            {files.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9fafb',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.name)}</span>
                  <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{file.name}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    background: '#e5e7eb',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {getFileType(file.name).toUpperCase()}
                  </span>
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
            ))}
          </div>
        </div>
      );
    }

    if (files.length === 2) {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {files.map((file, index) => (
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
                    <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                      File {index + 1} ({getFileType(file.name).toUpperCase()})
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
            ))}
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
          accept=".xlsx,.xls,.csv"
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
            fontSize: '0.75rem'
          }}>
            <span>💡</span>
            <span>Excel files will be arranged as File 1, CSV files as File 2</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
