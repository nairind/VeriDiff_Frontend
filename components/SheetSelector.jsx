// File: components/SheetSelector.jsx

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
    <div className="sheet-selector">
      <h3>📊 Excel Sheet Selection</h3>
      <p>Your Excel files contain multiple sheets. Please select which sheets to compare:</p>
      
      <div className="sheet-selection-grid">
        {showFile1Selector && (
          <div className="sheet-selection">
            <label>
              <strong>File 1: {file1Info.fileName}</strong>
            </label>
            <select
              value={selectedSheet1}
              onChange={(e) => setSelectedSheet1(e.target.value)}
              className="sheet-dropdown"
            >
              {file1Info.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name} 
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            <div className="sheet-preview">
              {file1Info.sheets.find(s => s.name === selectedSheet1)?.headers.length > 0 && (
                <div>
                  <small><strong>Headers:</strong> {
                    file1Info.sheets.find(s => s.name === selectedSheet1)?.headers.join(', ')
                  }</small>
                </div>
              )}
            </div>
          </div>
        )}

        {showFile2Selector && (
          <div className="sheet-selection">
            <label>
              <strong>File 2: {file2Info.fileName}</strong>
            </label>
            <select
              value={selectedSheet2}
              onChange={(e) => setSelectedSheet2(e.target.value)}
              className="sheet-dropdown"
            >
              {file2Info.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            <div className="sheet-preview">
              {file2Info.sheets.find(s => s.name === selectedSheet2)?.headers.length > 0 && (
                <div>
                  <small><strong>Headers:</strong> {
                    file2Info.sheets.find(s => s.name === selectedSheet2)?.headers.join(', ')
                  }</small>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .sheet-selector {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .sheet-selector h3 {
          color: #0369a1;
          margin: 0 0 10px 0;
          font-size: 1.1em;
        }

        .sheet-selector p {
          color: #0369a1;
          margin: 0 0 15px 0;
          font-size: 0.9em;
        }

        .sheet-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .sheet-selection {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e7ff;
        }

        .sheet-selection label {
          display: block;
          color: #1e40af;
          font-size: 0.9em;
          margin-bottom: 8px;
        }

        .sheet-dropdown {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9em;
          background: white;
        }

        .sheet-dropdown:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .sheet-preview {
          margin-top: 8px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 4px;
          min-height: 20px;
        }

        .sheet-preview small {
          color: #64748b;
          font-size: 0.75em;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default SheetSelector;
