import { useState } from 'react';
import Head from 'next/head';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles } from '../utils/excelFileComparison'; // Added compareExcelFiles import
import { parseJSONFile, compareJSONFiles } from '../utils/jsonFileComparison';
import { parseXMLFile, compareXMLFiles } from '../utils/xmlFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import HeaderMapper from '../components/HeaderMapper';
import { mapHeaders } from '../utils/mapHeaders';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('csv');

  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  };

  const handleLoadFiles = async () => {
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data1 = [], data2 = [];
      if (fileType === 'excel_csv') {
        data1 = await parseExcelFile(file1);
        data2 = await parseCSVFile(file2);
      } else if (fileType === 'csv') {
        data1 = await parseCSVFile(file1);
        data2 = await parseCSVFile(file2);
      } else if (fileType === 'excel') {
        data1 = await parseExcelFile(file1);
        data2 = await parseExcelFile(file2);
      } else if (fileType === 'json') {
        data1 = await parseJSONFile(file1);
        data2 = await parseJSONFile(file2);
      } else if (fileType === 'xml') {
        data1 = await parseXMLFile(file1);
        data2 = await parseXMLFile(file2);
      } else {
        throw new Error('Unsupported file type.');
      }
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setShowMapper(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  // UPDATED: Fixed comparison function routing
  const handleRunComparison = async () => {
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Missing files or mappings.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let result;
      
      // Call the appropriate comparison function based on file type
      if (fileType === 'excel_csv') {
        // Excel-CSV comparison (your working functionality)
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else if (fileType === 'excel') {
        // Excel-Excel comparison (now fixed)
        result = await compareExcelFiles(file1, file2, finalMappings);
      } else if (fileType === 'json') {
        // JSON comparison (now fixed)
        result = await compareJSONFiles(file1, file2, finalMappings);
      } else if (fileType === 'xml') {
        // XML comparison (new functionality)
        result = await compareXMLFiles(file1, file2, finalMappings);
      } else if (fileType === 'csv') {
        // CSV comparison - you may need to create a compareCSVFiles function
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else {
        // For other file types, fallback
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      }
      
      setResults(result);
    } catch (err) {
      console.error(err);
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
      <main>
        <h1 className="title">VeriDiff</h1>
        <p>Upload two files to compare their contents</p>

        <div className="file-type-selector">
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON</label>
          <label><input type="radio" name="fileType" value="xml" checked={fileType === 'xml'} onChange={handleFileTypeChange} /> XML</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> Excel</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <input type="file" onChange={(e) => handleFileChange(e, 1)} />
        <input type="file" onChange={(e) => handleFileChange(e, 2)} />

        <button onClick={handleLoadFiles} disabled={loading}>
          {loading ? 'Loading...' : 'Load Files'}
        </button>

        {showMapper && (
          <HeaderMapper
            file1Headers={headers1}
            file2Headers={headers2}
            suggestedMappings={suggestedMappings}
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
                                ? '#fdd'  // Light red for differences
                                : value.status === 'acceptable'
                                ? '#ffd'  // Light yellow for acceptable (within tolerance)
                                : '#dfd'  // Light green for matches
                          }}
                        >
                          <div>
                            <strong>{value.val1} / {value.val2}</strong>
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
