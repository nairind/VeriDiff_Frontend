// File: pages/index.js

import { useState } from 'react';
import Head from 'next/head';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile } from '../utils/excelFileComparison';
import { parseJSONFile } from '../utils/jsonFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import HeaderMapper from '../components/HeaderMapper';
import { mapHeaders } from '../utils/mapHeaders';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('csv');
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMapper, setShowMapper] = useState(false);

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (fileNum === 1) setFile1(file);
    if (fileNum === 2) setFile2(file);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setShowMapper(false);
    setFinalMappings([]);
  };

  const handleLoadFiles = async () => {
    setError(null);
    if (!file1 || !file2) {
      setError('Please select both files.');
      return;
    }

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
      } else {
        setError('Unsupported file type');
        return;
      }

      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setShowMapper(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  const handleRunComparison = async () => {
    setError(null);
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Ensure both files are selected and mappings are confirmed.');
      return;
    }
    setLoading(true);
    try {
      const result = await compareExcelCSVFiles(file1, file2, finalMappings);
      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>VeriDiff</title>
      </Head>

      <h1>VeriDiff</h1>
      <p>Upload two files to compare their contents</p>

      <div>
        <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV</label>
        <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT</label>
        <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON</label>
        <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> EXCEL</label>
        <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
      </div>

      <input type="file" onChange={(e) => handleFileChange(e, 1)} />
      <input type="file" onChange={(e) => handleFileChange(e, 2)} />
      <button onClick={handleLoadFiles}>Load Files</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

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

      {results && (
        <div className="results">
          <h2>Comparison Results</h2>
          <p>Total Records: {results.total_records}</p>
          <p>Matches: {results.matches_found} | Differences: {results.differences_found}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                {Object.keys(results.results[0].fields).map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.results.map((row, i) => (
                <tr key={i}>
                  <td>{row.ID}</td>
                  {Object.entries(row.fields).map(([key, val], j) => (
                    <td key={j} className={
                      val.status === 'difference' ? 'difference' :
                      val.status === 'acceptable' ? 'acceptable' : 'match'
                    }>
                      {val.val1} vs {val.val2} ({val.difference})
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
