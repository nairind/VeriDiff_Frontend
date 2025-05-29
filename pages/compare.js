// pages/compare.js - Complete Premium Solution with All Components

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

// Enhanced HeaderMapper Component (Inline)
const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm, onRun, sampleData1, sampleData2 }) => {
  const [mappings, setMappings] = useState([]);
  const [autoRerunEnabled, setAutoRerunEnabled] = useState(true);

  // Auto-detect amount fields based on name and sample data
  const isLikelyAmountField = (fieldName, sampleValues = []) => {
    const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill|salary|wage|revenue|profit|expense|budget/i;
    const hasNumericName = numericFieldNames.test(fieldName);
    
    const cleanNumericValues = sampleValues.filter(val => {
      if (!val && val !== 0) return false;
      const cleaned = String(val).replace(/[$,\s€£¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    });
    
    const percentNumeric = cleanNumericValues.length / Math.max(sampleValues.length, 1);
    return hasNumericName || percentNumeric > 0.7;
  };

  const getSampleValues = (fieldName, file2FieldName) => {
    const samples1 = sampleData1 ? sampleData1.slice(0, 10).map(row => row[fieldName]).filter(v => v != null) : [];
    const samples2 = sampleData2 ? sampleData2.slice(0, 10).map(row => row[file2FieldName]).filter(v => v != null) : [];
    return [...samples1, ...samples2];
  };

  useState(() => {
    const enriched = suggestedMappings.map(m => {
      const sampleValues = getSampleValues(m.file1Header, m.file2Header || m.file1Header);
      const isAutoDetectedAmount = isLikelyAmountField(m.file1Header, sampleValues);
      
      return {
        file1Header: m.file1Header,
        file2Header: m.file2Header || '',
        similarity: m.similarity,
        isAmountField: isAutoDetectedAmount,
        toleranceType: 'flat',
        toleranceValue: isAutoDetectedAmount ? '0.01' : '',
        isAutoDetected: isAutoDetectedAmount
      };
    });
    setMappings(enriched);
  }, [suggestedMappings]);

  useState(() => {
    if (autoRerunEnabled && mappings.length > 0) {
      const timer = setTimeout(() => {
        onConfirm(mappings);
        setTimeout(() => {
          onRun();
        }, 100);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mappings, autoRerunEnabled, onConfirm, onRun]);

  const updateMapping = (index, key, value) => {
    const updated = [...mappings];
    updated[index][key] = value;
    
    if (key === 'isAmountField') {
      updated[index].isAutoDetected = false;
    }
    
    if (key === 'isAmountField' && value && !updated[index].toleranceValue) {
      updated[index].toleranceValue = '0.01';
    }
    
    setMappings(updated);
  };

  const addMapping = () => {
    setMappings([
      ...mappings,
      { file1Header: '', file2Header: '', similarity: 0, isAmountField: false, toleranceType: 'flat', toleranceValue: '', isAutoDetected: false }
    ]);
  };

  const removeMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(mappings);
  };

  const handleManualRun = () => {
    setAutoRerunEnabled(false);
    onRun();
    setTimeout(() => setAutoRerunEnabled(true), 2000);
  };

  const autoDetectedCount = mappings.filter(m => m.isAutoDetected).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🔗 Confirm Header Mappings</h2>
          <p className="text-gray-600">Review and adjust how your file columns are matched</p>
        </div>
        
        {autoDetectedCount > 0 && (
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
              🤖 {autoDetectedCount} amount field{autoDetectedCount !== 1 ? 's' : ''} auto-detected
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-8">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={autoRerunEnabled}
              onChange={(e) => setAutoRerunEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
              autoRerunEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${
                autoRerunEnabled ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
          </div>
          <div className="ml-4">
            <span className="text-blue-900 font-medium flex items-center">
              ⚡ Auto-rerun comparison when settings change
            </span>
            {autoRerunEnabled && (
              <span className="text-blue-700 text-sm">Saves time by automatically running comparisons!</span>
            )}
          </div>
        </label>
      </div>

      <form onSubmit={handleConfirm}>
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File 1 Header
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  →
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File 2 Header
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Field?
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tolerance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappings.map((m, i) => (
                <tr key={i} className={`${m.isAutoDetected ? 'bg-green-50 border-l-4 border-green-400' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <select
                      value={m.file1Header}
                      onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Select Header --</option>
                      {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    →
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={m.file2Header}
                      onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Select Header --</option>
                      {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={m.isAmountField}
                        onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {m.isAutoDetected && (
                        <span className="ml-2 text-green-500" title="Auto-detected as amount field">🤖</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={m.toleranceType}
                      onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                      disabled={!m.isAmountField}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                        !m.isAmountField ? 'bg-gray-100 text-gray-400' : ''
                      }`}
                    >
                      <option value="flat">Flat</option>
                      <option value="%">%</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={m.toleranceValue}
                      onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                      step="any"
                      placeholder={m.isAmountField ? "0.01" : ""}
                      disabled={!m.isAmountField}
                      className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                        !m.isAmountField ? 'bg-gray-100 text-gray-400' : ''
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      type="button" 
                      onClick={() => removeMapping(i)}
                      className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-6">
          {mappings.map((m, i) => (
            <div key={i} className={`border rounded-xl p-6 ${m.isAutoDetected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              {m.isAutoDetected && (
                <div className="flex items-center mb-4 text-green-700">
                  🤖 <span className="ml-2 text-sm font-medium">Auto-detected amount field</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File 1 Header</label>
                  <select
                    value={m.file1Header}
                    onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">-- Select Header --</option>
                    {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                
                <div className="flex justify-center">
                  <span className="text-gray-400">→</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File 2 Header</label>
                  <select
                    value={m.file2Header}
                    onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">-- Select Header --</option>
                    {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={m.isAmountField}
                    onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Amount Field</label>
                </div>
                
                {m.isAmountField && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tolerance Type</label>
                      <select
                        value={m.toleranceType}
                        onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="flat">Flat</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tolerance Value</label>
                      <input
                        type="number"
                        value={m.toleranceValue}
                        onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                        step="any"
                        placeholder="0.01"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => removeMapping(i)}
                    className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <button 
            type="button" 
            onClick={addMapping}
            className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            ➕ Add Mapping
          </button>
          
          <button 
            type="submit"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            ⚙️ Confirm Mapping
          </button>
          
          <button 
            type="button" 
            onClick={handleManualRun}
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            ▶️ Run Comparison
          </button>
        </div>

        {autoRerunEnabled && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              ⚠️ <span className="ml-2 text-sm text-yellow-800">
                Comparison will auto-run when you change settings. Disable auto-rerun above if you prefer manual control.
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Enhanced SheetSelector Component (Inline)
const SheetSelector = ({ file1Info, file2Info, onSheetSelect, fileType }) => {
  const [selectedSheet1, setSelectedSheet1] = useState('');
  const [selectedSheet2, setSelectedSheet2] = useState('');

  useState(() => {
    if (file1Info?.defaultSheet) {
      setSelectedSheet1(file1Info.defaultSheet);
    }
    if (file2Info?.defaultSheet) {
      setSelectedSheet2(file2Info.defaultSheet);
    }
  }, [file1Info, file2Info]);

  useState(() => {
    if (selectedSheet1 && selectedSheet2) {
      onSheetSelect(selectedSheet1, selectedSheet2);
    }
  }, [selectedSheet1, selectedSheet2, onSheetSelect]);

  if (fileType !== 'excel' && fileType !== 'excel_csv') {
    return null;
  }

  const showFile1Selector = file1Info?.sheets?.length > 1;
  const showFile2Selector = file2Info?.sheets?.length > 1 && fileType === 'excel';

  if (!showFile1Selector && !showFile2Selector) {
    return null;
  }

  const SheetCard = ({ fileInfo, selectedSheet, onSheetChange, title }) => {
    const selectedSheetInfo = fileInfo.sheets.find(s => s.name === selectedSheet);
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            📊
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{fileInfo.fileName}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sheet to Compare
          </label>
          <div className="relative">
            <select
              value={selectedSheet}
              onChange={(e) => onSheetChange(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-10 py-3 text-sm appearance-none bg-white"
            >
              {fileInfo.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">⌄</span>
          </div>
        </div>

        {selectedSheetInfo && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                📈 Sheet Preview
              </h4>
              <div className="flex items-center text-sm text-gray-500">
                {selectedSheetInfo.isHidden ? '👁️‍🗨️' : '👁️'} {selectedSheetInfo.isHidden ? 'Hidden' : 'Visible'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">#</span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{selectedSheetInfo.rowCount}</span> rows
                </span>
              </div>
              <div className="flex items-center">
                {selectedSheetInfo.hasData ? (
                  <span className="text-green-500 mr-2">✅</span>
                ) : (
                  <span className="text-orange-500 mr-2">⚠️</span>
                )}
                <span className="text-sm text-gray-600">
                  {selectedSheetInfo.hasData ? 'Has data' : 'No data'}
                </span>
              </div>
            </div>

            {selectedSheetInfo.headers && selectedSheetInfo.headers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Column Headers:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSheetInfo.headers.slice(0, 6).map((header, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {header}
                    </span>
                  ))}
                  {selectedSheetInfo.headers.length > 6 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{selectedSheetInfo.headers.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          📊 Excel Sheet Selection
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Multiple Sheets Detected</h2>
        <p className="text-blue-700">
          Your Excel files contain multiple sheets. Please select which sheets to compare:
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {showFile1Selector && (
          <SheetCard
            fileInfo={file1Info}
            selectedSheet={selectedSheet1}
            onSheetChange={setSelectedSheet1}
            title="File 1"
          />
        )}

        {showFile2Selector && (
          <SheetCard
            fileInfo={file2Info}
            selectedSheet={selectedSheet2}
            onSheetChange={setSelectedSheet2}
            title="File 2"
          />
        )}
      </div>

      <div className="mt-8 bg-white/50 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-3 mt-0.5 flex-shrink-0">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sheet Selection Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Choose sheets that contain the data you want to compare</li>
              <li>• Hidden sheets are shown but may contain system data</li>
              <li>• Sheets with more rows typically contain more comprehensive data</li>
              <li>• Column headers preview helps you identify the right sheet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
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

  // File type mapping for icons and labels
  const fileTypeConfig = {
    excel: { icon: '📊', label: 'Excel–Excel', description: 'Compare Excel workbooks' },
    excel_csv: { icon: '📈', label: 'Excel–CSV', description: 'Smart cross-format comparison', featured: true },
    csv: { icon: '📋', label: 'CSV–CSV', description: 'Compare CSV files' },
    pdf: { icon: '📄', label: 'PDF–PDF', description: 'Compare PDF documents', badge: 'v1' },
    text: { icon: '📝', label: 'TXT–TXT', description: 'Compare text files' },
    json: { icon: '⚙️', label: 'JSON–JSON', description: 'Compare JSON data' },
    xml: { icon: '📋', label: 'XML–XML', description: 'Compare XML data' },
    pdf_ocr: { icon: '📄', label: 'PDF–PDF', description: 'OCR checks coming', disabled: true }
  };

  const getFileTypeLabel = (type, position) => {
    const config = fileTypeConfig[type];
    if (!config) return 'File';
    const parts = config.label.split('–');
    return position === 1 ? parts[0] : parts[1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
        <meta name="description" content="Compare Excel, CSV, PDF, JSON, XML files with smart mapping and tolerance settings. Built for business professionals." />
      </Head>

      {/* Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                  VeriDiff
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/about">
                <span className="flex items-center text-orange-500 hover:text-orange-600 cursor-pointer font-semibold">
                  📖 MUST READ - About
                </span>
              </Link>
              <span className="text-blue-600 font-medium">Compare Files</span>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="text-gray-700 hover:text-blue-600 cursor-pointer">
                  ← Back to Landing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-500/20 text-blue-100 px-3 py-1 rounded-full text-sm font-medium mb-4">
              ⚡ Smart File Comparison
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              VeriDiff
            </h1>
            <h2 className="text-xl md:text-2xl font-light mb-6 opacity-90">
              Compare documents with precision and confidence
            </h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              From Excel to PDFs, VeriDiff handles your most critical file comparisons with professional-grade accuracy.
            </p>
          </div>
        </section>

        {/* File Type Selection */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Comparison Type</h2>
            <p className="text-gray-600">Select the file formats you want to compare</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Object.entries(fileTypeConfig).map(([key, config]) => {
              const isSelected = fileType === key;
              const isDisabled = config.disabled;
              
              return (
                <label
                  key={key}
                  className={`
                    relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
                    ${config.featured ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300' : ''}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="fileType"
                    value={key}
                    checked={isSelected}
                    onChange={handleFileTypeChange}
                    disabled={isDisabled}
                    className="sr-only"
                  />
                  
                  <div className="flex items-center w-full">
                    <div className={`flex-shrink-0 p-2 rounded-lg text-2xl ${config.featured ? 'bg-orange-200' : 'bg-blue-100'}`}>
                      {config.icon}
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        {config.label}
                        {config.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {config.badge}
                          </span>
                        )}
                        {config.featured && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded font-semibold">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      ✅
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* File Order Guidance for Excel-CSV */}
        {fileType === 'excel_csv' && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-2xl">
                  📊
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-blue-900 mb-3">📋 File Upload Instructions</h3>
              <p className="text-blue-700 mb-4">Please upload your files in the correct order:</p>
              
              <div className="flex items-center justify-center space-x-4 mb-4 flex-wrap">
                <div className="flex items-center bg-white p-3 rounded-lg border-2 border-blue-300 m-2">
                  <span className="text-2xl mr-2">📊</span>
                  <span className="font-semibold text-gray-900">1. Excel File First</span>
                  <span className="text-sm text-gray-500 ml-2">(.xlsx, .xls, .xlsm)</span>
                </div>
                
                <span className="text-blue-600 text-2xl">→</span>
                
                <div className="flex items-center bg-white p-3 rounded-lg border-2 border-blue-300 m-2">
                  <span className="text-2xl mr-2">📋</span>
                  <span className="font-semibold text-gray-900">2. CSV File Second</span>
                  <span className="text-sm text-gray-500 ml-2">(.csv)</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="text-sm text-yellow-800">File order matters for accurate data mapping and comparison results.</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* File Upload */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📁 Upload Your Files</h2>
            <p className="text-gray-600">Select files to compare</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                File 1: {getFileTypeLabel(fileType, 1)}
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 1)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-dashed border-gray-300 rounded-lg p-4"
                />
                {file1 && (
                  <div className="mt-3 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-sm text-green-800 font-medium">{file1.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                File 2: {getFileTypeLabel(fileType, 2)}
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 2)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-dashed border-gray-300 rounded-lg p-4"
                />
                {file2 && (
                  <div className="mt-3 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-sm text-green-800 font-medium">{file2.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={handleLoadFiles} 
              disabled={loading || !file1 || !file2}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Files...
                </>
              ) : (
                <>
                  <span className="mr-3">▶️</span>
                  Load Files & Start Comparison
                </>
              )}
            </button>
          </div>
        </section>

        {/* Sheet Selector */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <section className="mb-8">
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
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Proceed with Selected Sheets'
                )}
              </button>
            </div>
          </section>
        )}

        {/* Header Mapper */}
        {showMapper && (
          <section className="mb-8">
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
          </section>
        )}

        {/* Error Display */}
        {error && (
          <section className="mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-400 mr-3 text-xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Processing</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    Loading and processing your files...
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {results && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Comparison Results</h2>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <span className="mr-2">✅</span>
                Analysis Complete
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Records</p>
                    <p className="text-2xl font-bold text-blue-900">{results.total_records}</p>
                  </div>
                  <span className="text-3xl">📋</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Matches Found</p>
                    <p className="text-2xl font-bold text-green-900">{results.matches_found}</p>
                  </div>
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Differences Found</p>
                    <p className="text-2xl font-bold text-orange-900">{results.differences_found}</p>
                  </div>
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
            </div>

            {/* Auto-detected Fields */}
            {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">🤖</span>
                  <span className="font-medium text-green-800">Auto-detected Amount Fields:</span>
                  <span className="text-green-700 ml-2">{results.autoDetectedFields.join(', ')}</span>
                </div>
              </div>
            )}
            
            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <button 
                onClick={handleDownloadExcel} 
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                <span className="mr-2">📊</span>
                Download Excel
              </button>
              <button 
                onClick={handleDownloadCSV} 
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="mr-2">📄</span>
                Download CSV
              </button>
            </div>
            
            {/* Results Table */}
            {results.results && results.results.length > 0 && (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          {Object.keys(results.results[0].fields).map((field, idx) => (
                            <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.results.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.ID}
                            </td>
                            {Object.entries(row.fields).map(([key, value], idx) => (
                              <td
                                key={idx}
                                className={`px-6 py-4 whitespace-nowrap text-sm ${
                                  value.status === 'difference' ? 'bg-red-50' :
                                  value.status === 'acceptable' ? 'bg-yellow-50' :
                                  value.status === 'match' ? 'bg-green-50' : ''
                                }`}
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900">
                                      {value.val1} / {value.val2}
                                    </span>
                                    {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                      <span className="ml-2 text-green-500" title="Auto-detected amount field">🤖</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      value.status === 'difference' ? 'bg-red-100 text-red-800' :
                                      value.status === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                                      value.status === 'match' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {value.status}
                                      {value.difference && ` (Δ ${value.difference})`}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Security Banner */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <span className="text-6xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Your Data Never Leaves Your Device</h2>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">
            VeriDiff processes everything locally in your browser using advanced client-side technology. 
            No uploads, no cloud storage, no data collection. What happens on your computer, stays on your computer.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">✨ Key Features</h2>
            <p className="text-xl text-gray-600">Professional-grade file comparison capabilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
              <p className="text-sm text-gray-600">All processing happens in your browser. No data leaves your device.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Mapping</h3>
              <p className="text-sm text-gray-600">Automatically detects similar fields across different file formats.</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 text-center">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Tolerance Settings</h3>
              <p className="text-sm text-gray-600">Set acceptable differences for financial data and accounting workflows.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Reports</h3>
              <p className="text-sm text-gray-600">Export detailed results with color-coded differences and statistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📁 Supported File Formats</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">📊 Excel (.xlsx)</span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">📋 CSV (.csv)</span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">📄 PDF (.pdf)</span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">⚙️ JSON (.json)</span>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">📋 XML (.xml)</span>
            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium">📝 Text (.txt)</span>
          </div>
          <p className="text-gray-600 mt-4">Mix and match formats - compare Excel files with CSV data, extract text from PDFs, and handle complex nested structures.</p>
        </div>
      </section>
    </div>
  );
}
