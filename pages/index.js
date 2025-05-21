import { useState } from 'react';
import Head from 'next/head';
import { compareFiles } from '../utils/simpleCSVComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareJSONFiles_main } from '../utils/jsonFileComparison';
import { compareExcelFiles } from '../utils/excelFileComparison'; // ✅ Updated here

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('csv');

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (file) {
      if (fileNum === 1) {
        setFile1(file);
      } else {
        setFile2(file);
      }

      if (file.name.toLowerCase().endsWith('.txt')) {
        setFileType('text');
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        setFileType('csv');
      } else if (file.name.toLowerCase().endsWith('.json')) {
        setFileType('json');
      } else if (['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ext => file.name.toLowerCase().endsWith(ext))) {
        setFileType('excel');
      }
    }
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

    if (fileType === 'csv' && (!file1.name.endsWith('.csv') || !file2.name.endsWith('.csv'))) {
      setError('Please select CSV files for CSV comparison');
      return;
    } else if (fileType === 'text' && (!file1.name.endsWith('.txt') || !file2.name.endsWith('.txt'))) {
      setError('Please select text files');
      return;
    } else if (fileType === 'json' && (!file1.name.endsWith('.json') || !file2.name.endsWith('.json'))) {
      setError('Please select JSON files');
      return;
    } else if (fileType === 'excel') {
      const validExts = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
      const ext1 = file1.name.slice(file1.name.lastIndexOf('.')).toLowerCase();
      const ext2 = file2.name.slice(file2.name.lastIndexOf('.')).toLowerCase();
      if (!validExts.includes(ext1) || !validExts.includes(ext2)) {
        setError('Please select Excel files');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let comparisonResults;
      if (fileType === 'csv') {
        comparisonResults = await compareFiles(file1, file2);
      } else if (fileType === 'text') {
        comparisonResults = await compareTextFiles_main(file1, file2);
      } else if (fileType === 'json') {
        comparisonResults = await compareJSONFiles_main(file1, file2);
      } else if (fileType === 'excel') {
        comparisonResults = await compareExcelFiles(file1, file2); // ✅ Updated call
      }

      setResults(comparisonResults);
    } catch (err) {
      console.error('Comparison error:', err);
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
          {['csv', 'text', 'json', 'excel'].map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="fileType"
                value={type}
                checked={fileType === type}
                onChange={handleFileTypeChange}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)} Files
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {[1, 2].map((num) => (
            <div key={num} className="file-input">
              <label htmlFor={`file${num}`}>
                {fileType.toUpperCase()} File {num}:
              </label>
              <input
                type="file"
                id={`file${num}`}
                onChange={(e) => handleFileChange(e, num)}
                accept={
                  fileType === 'csv'
                    ? '.csv'
                    : fileType === 'text'
                    ? '.txt'
                    : fileType === 'json'
                    ? '.json'
                    : '.xlsx,.xls,.xlsm,.xlsb'
                }
              />
            </div>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Files'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        {results && (
          <div className="results">
            <h2>Results</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Column</th>
                  <th>Source 1</th>
                  <th>Source 2</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((row, index) => (
                  <tr key={index}>
                    <td>{row.ID}</td>
                    <td>{row.COLUMN}</td>
                    <td>{row.SOURCE_1_VALUE}</td>
                    <td>{row.SOURCE_2_VALUE}</td>
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
