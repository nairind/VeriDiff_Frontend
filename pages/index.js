import { useState } from 'react';
import Head from 'next/head';
import { compareFiles } from '../utils/simpleCSVComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareJSONFiles_main } from '../utils/jsonFileComparison';
import { compareExcelFiles } from '../utils/excelFileComparison';
import { compareExcelToCSV } from '../utils/fileComparison';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('csv');

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileNum === 1) setFile1(file);
    else setFile2(file);

    const ext = file.name.toLowerCase();

    if (ext.endsWith('.txt')) setFileType('text');
    else if (ext.endsWith('.csv')) setFileType('csv');
    else if (ext.endsWith('.json')) setFileType('json');
    else if (['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ex => ext.endsWith(ex))) setFileType('excel');
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file1 || !file2) {
      setError('Please select two files to compare');
      return;
    }

    const ext1 = file1.name.toLowerCase();
    const ext2 = file2.name.toLowerCase();

    const isCSV = (name) => name.endsWith('.csv');
    const isExcel = (name) => ['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ext => name.endsWith(ext));

    if (fileType === 'csv' && (!isCSV(ext1) || !isCSV(ext2))) {
      setError('Please select two CSV files');
      return;
    }

    if (fileType === 'text' && (!ext1.endsWith('.txt') || !ext2.endsWith('.txt'))) {
      setError('Please select two text files');
      return;
    }

    if (fileType === 'json' && (!ext1.endsWith('.json') || !ext2.endsWith('.json'))) {
      setError('Please select two JSON files');
      return;
    }

    if (fileType === 'excel' && (!isExcel(ext1) || !isExcel(ext2))) {
      setError('Please select two Excel files');
      return;
    }

    if (fileType === 'excel_csv' && !(isExcel(ext1) && isCSV(ext2) || isCSV(ext1) && isExcel(ext2))) {
      setError('Please select one Excel and one CSV file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let comparisonResults;
      if (fileType === 'csv') comparisonResults = await compareFiles(file1, file2);
      else if (fileType === 'text') comparisonResults = await compareTextFiles_main(file1, file2);
      else if (fileType === 'json') comparisonResults = await compareJSONFiles_main(file1, file2);
      else if (fileType === 'excel') comparisonResults = await compareExcelFiles(file1, file2);
      else if (fileType === 'excel_csv') comparisonResults = await compareExcelToCSV(file1, file2);

      setResults(comparisonResults);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Comparison failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
        <meta name="description" content="Compare files with precision" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">VeriDiff</h1>
        <p className="description">Upload two files to compare their contents</p>

        <div className="file-type-selector">
          <label><input type="radio" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV Files</label>
          <label><input type="radio" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON Files</label>
          <label><input type="radio" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> EXCEL Files</label>
          <label><input type="radio" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input type="file" onChange={(e) => handleFileChange(e, 1)} />
          <input type="file" onChange={(e) => handleFileChange(e, 2)} />
          <button type="submit" disabled={loading}>{loading ? 'Comparing...' : 'Compare Files'}</button>
          {error && <p className="error">{error}</p>}
        </form>

        {results && (
          <div className="results">
            <h2>Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Column</th>
                  <th>Value 1</th>
                  <th>Value 2</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.row}</td>
                    <td>{r.column}</td>
                    <td>{r.value1}</td>
                    <td>{r.value2}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .title {
          font-size: 3rem;
          font-weight: bold;
        }
        .description {
          margin-top: 1rem;
          font-size: 1.25rem;
        }
        .file-type-selector {
          margin: 2rem 0;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .form {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }
        .results {
          max-width: 800px;
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.5rem;
          border: 1px solid #ccc;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
}
