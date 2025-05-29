// File: components/SheetSelector.jsx
// Updated to match landing page professional aesthetic

import React, { useState, useEffect } from 'react';

const SheetSelector = ({ file1Info, file2Info, onSheetSelect, fileType }) => {
  const [selectedSheet1, setSelectedSheet1] = useState('');
  const [selectedSheet2, setSelectedSheet2] = useState('');

  useEffect(() => {
    // Set default selections
    if (file1Info?.defaultSheet) {
      setSelectedSheet1(file1Info.defaultSheet);
    }
    if (file2Info?.defaultSheet) {
      setSelectedSheet2(file2Info.defaultSheet);
    }
  }, [file1Info, file2Info]);

  useEffect(() => {
    // Notify parent of sheet selections
    if (selectedSheet1 && selectedSheet2) {
      onSheetSelect(selectedSheet1, selectedSheet2);
    }
  }, [selectedSheet1, selectedSheet2, onSheetSelect]);

  // Only show for Excel files
  if (fileType !== 'excel' && fileType !== 'excel_csv') {
    return null;
  }

  // Only show if we have sheet info and multiple sheets
  const showFile1Selector = file1Info?.sheets?.length > 1;
  const showFile2Selector = file2Info?.sheets?.length > 1 && fileType === 'excel';

  if (!showFile1Selector && !showFile2Selector) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
      border: '2px solid #2563eb',
      borderRadius: '16px',
      padding: '30px',
      margin: '30px 0',
      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)'
    }}>
      <h3 style={{
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: '0 0 15px 0',
        fontSize: '1.5rem',
        fontWeight: '700',
        textAlign: 'center'
      }}>
        📊 Excel Sheet Selection
      </h3>
      
      <p style={{
        color: '#6b7280',
        margin: '0 0 25px 0',
        fontSize: '1.1rem',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        Your Excel files contain multiple sheets. Please select which sheets to compare:
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {showFile1Selector && (
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <label style={{
              display: 'block',
              color: '#1f2937',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              <strong>File 1: {file1Info.fileName}</strong>
            </label>
            
            <select
              value={selectedSheet1}
              onChange={(e) => setSelectedSheet1(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                color: '#374151',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              {file1Info.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name} 
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              minHeight: '20px'
            }}>
              {file1Info.sheets.find(s => s.name === selectedSheet1)?.headers.length > 0 && (
                <div>
                  <small style={{
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    <strong>Headers:</strong> {
                      file1Info.sheets.find(s => s.name === selectedSheet1)?.headers.join(', ')
                    }
                  </small>
                </div>
              )}
            </div>
          </div>
        )}

        {showFile2Selector && (
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <label style={{
              display: 'block',
              color: '#1f2937',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              <strong>File 2: {file2Info.fileName}</strong>
            </label>
            
            <select
              value={selectedSheet2}
              onChange={(e) => setSelectedSheet2(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                color: '#374151',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              {file2Info.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              minHeight: '20px'
            }}>
              {file2Info.sheets.find(s => s.name === selectedSheet2)?.headers.length > 0 && (
                <div>
                  <small style={{
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    <strong>Headers:</strong> {
                      file2Info.sheets.find(s => s.name === selectedSheet2)?.headers.join(', ')
                    }
                  </small>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SheetSelector;
