import { useState } from 'react';
import Head from 'next/head';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile } from '../utils/excelFileComparison';
import { parseJSONFile } from '../utils/jsonFileComparison';
import HeaderMapper from '../components/HeaderMapper';
import { mapHeaders } from '../utils/mapHeaders';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('csv');

  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [pendingComparison, setPendingComparison] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const [showRunButton, setShowRunButton] = useState(false);

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (file) {
      if (fileNum === 1) {
        setFile1(file);
      } else {
        setFile2(file);
      }
    }
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
    setShowMapper(false);
    setShowRunButton(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setError('Please select two files to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (['excel_csv', 'csv', 'excel', 'json'].includes(fileType)) {
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
        setPendingComparison({ file1, file2 });
        setPendingType(fileType);
        setShowMapper(true);
        setShowRunButton(false);
        return;
      }

      const comparisonResults = await compareTextFiles_main(file1, file2);
      setResults(comparisonResults);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(`Failed to compare files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirm = (mappings) => {
    setFinalMappings(mappings);
    setShowRunButton(true);
  };

  const handleRunComparison = async () => {
    try {
      setLoading(true);
      const result = await compareExcelCSVFiles(
        pendingComparison.file1,
        pendingComparison.file2,
        finalMappings
      );
      setResults(result);
    } catch (err) {
      console.error('Run comparison error:', err);
      setError(`Failed to compare files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
        <meta name="description" content="Compare files with precision" />
      </Head>

      <main>
        <h1 className="title">VeriDiff</h1>
        <p className="description">Upload two files to compare their contents</p>

        <div className="file-type-selector">
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV Files</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON Files</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> EXCEL Files</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <form onSubmit={handleSubmit}>
          <input type="file" onChange={(e) => handleFileChange(e, 1)} />
          <input type="file" onChange={(e) => handleFileChange(e, 2)} />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Load Files'}</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        {showMapper && (
          <HeaderMapper
            file1Headers={headers1}
            file2Headers={headers2}
            suggestedMappings={suggestedMappings}
            onConfirm={handleMappingConfirm}
          />
        )}

        {showRunButton && (
          <button onClick={handleRunComparison} disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Comparing...' : 'Run Comparison'}
          </button>
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
                    <td>{row.DIFFERENCE ?? '0.00'}</td>
                    <td>{row.STATUS}</td>
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
