import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles } from '../utils/excelFileComparison';
import { parseJSONFile, compareJSONFiles } from '../utils/jsonFileComparison';
import { parseXMLFile, compareXMLFiles } from '../utils/xmlFileComparison';
import { parsePDFFile, comparePDFFiles } from '../utils/pdfFileComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import HeaderMapper from '../components/HeaderMapper';
import { mapHeaders } from '../utils/mapHeaders';
import { downloadResultsAsExcel, downloadResultsAsCSV } from '../utils/downloadResults';

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
  const [sampleData1, setSampleData1] = useState(null);
  const [sampleData2, setSampleData2] = useState(null);

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
      } else if (fileType === 'pdf') {
        data1 = await parsePDFFile(file1);
        data2 = await parsePDFFile(file2);
      } else if (fileType === 'text') {
        // Text files don't use header mapping - skip to comparison
        const result = await compareTextFiles_main(file1, file2);
        setResults(result);
        setLoading(false);
        return; // Skip header mapping for text files
      } else {
        throw new Error('Unsupported file type.');
      }
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10)); // Store sample data for auto-detection
      setSampleData2(data2.slice(0, 10));
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
      } else if (fileType === 'pdf') {
        // PDF comparison (new functionality)
        result = await comparePDFFiles(file1, file2, finalMappings);
      } else if (fileType === 'text') {
        // Text comparison (line-by-line)
        result = await compareTextFiles_main(file1, file2);
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

      {/* Simple Navigation */}
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
              
              {/* Download Buttons */}
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

        /* Info Section Styles */
        .info-section {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .hero-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .hero-banner h2 {
          font-size: 2.5em;
          margin: 0 0 20px 0;
          font-weight: 700;
        }

        .hero-banner p {
          font-size: 1.2em;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          border-radius: 50%;
          color: white;
        }

        .feature-icon.security { background: linear-gradient(135deg, #667eea, #764ba2); }
        .feature-icon.formats { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .feature-icon.speed { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .feature-icon.accuracy { background: linear-gradient(135deg, #43e97b, #38f9d7); }

        .feature-card h3 {
          color: #1f2937;
          font-size: 1.3em;
          margin: 0 0 15px 0;
          text-align: center;
          font-weight: 600;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
          text-align: center;
        }

        .security-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin: 40px 0;
          text-align: center;
        }

        .security-banner h3 {
          font-size: 1.5em;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .security-banner p {
          margin: 0;
          font-size: 1.1em;
          opacity: 0.9;
          line-height: 1.6;
        }

        .restrictions-section {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 12px;
          padding: 30px;
          margin: 40px 0;
        }

        .restrictions-section h3 {
          color: #92400e;
          font-size: 1.3em;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .restrictions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .restrictions-list li {
          color: #78350f;
          margin: 12px 0;
          padding-left: 25px;
          position: relative;
          line-height: 1.5;
        }

        .restrictions-list li:before {
          content: "⚠️";
          position: absolute;
          left: 0;
          top: 0;
        }

        .formats-showcase {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          margin: 30px 0;
        }

        .format-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
        }

        .cta-section {
          text-align: center;
          padding: 40px;
          background: #f8fafc;
          border-radius: 12px;
          margin: 40px 0;
        }

        .cta-section h3 {
          color: #1f2937;
          font-size: 1.5em;
          margin: 0 0 15px 0;
        }

        .cta-section p {
          color: #6b7280;
          font-size: 1.1em;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-banner h2 {
            font-size: 2em;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .formats-showcase {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
