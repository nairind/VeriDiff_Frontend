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

  const handleRunComparison = async () => {
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Missing files or mappings.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await compareExcelCSVFiles(file1, file2, finalMappings);
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
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV Files</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON Files</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> EXCEL Files</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <input type="file" onChange={(e) => handleFileChange(e, 1)} />
        <input type="file" onChange={(e) => handleFileChange(e, 2)} />

        <button onClick={handleLoadFiles}>Load Files</button>

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
            <div className="summary">
              <p>Total Records: {results.total_records}</p>
              <p>Differences Found: {results.differences_found}</p>
              <p>Matches Found: {results.matches_found}</p>
            </div>
            <table className="results-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Column</th>
                  <th>Source 1 Value</th>
                  <th>Source 2 Value</th>
                  <th>Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((row, index) => (
                  <tr key={index} className={row.STATUS === 'difference' ? 'difference' : row.STATUS === 'acceptable' ? 'acceptable' : ''}>
                    <td>{row.ID}</td>
                    <td>{row.COLUMN}</td>
                    <td>{row.SOURCE_1_VALUE}</td>
                    <td>{row.SOURCE_2_VALUE}</td>
                    <td>{row.DIFFERENCE ?? ''}</td>
                    <td>{row.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </main>
    </div>
  );
}
