// File: pages/index.js

import { useState } from 'react';
import Head from 'next/head';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile } from '../utils/excelFileComparison';
import { parseJSONFile } from '../utils/jsonFileComparison';
import { parseTextFile, compareTextFiles_main } from '../utils/textFileComparison';
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
      } else if (fileType === 'text') {
        const result = await compareTextFiles_main(file1, file2);
        setResults(result);
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
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> Excel</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <div className="file-inputs">
          <input type="file" onChange={(e) => handleFileChange(e, 1)} />
          <input type="file" onChange={(e) => handleFileChange(e, 2)} />
        </div>

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
                  {Object.keys(results.results[0]?.fields || {}).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ID}</td>
                    {Object.entries(row.fields).map(([key, field]) => (
                      <td
                        key={key}
                        className={
                          field.status === 'difference'
                            ? 'diff-cell'
                            : field.status === 'acceptable'
                            ? 'acceptable-cell'
                            : 'match-cell'
                        }
                      >
                        {field.val1} / {field.val2}
                        <br />
                        {field.status}
                        {field.difference && ` (Δ ${field.difference})`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
