import { useState } from 'react';
import Head from 'next/head';
import { compareFiles } from '../utils/simpleCSVComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareJSONFiles_main } from '../utils/jsonFileComparison';
import { compareExcelFiles } from '../utils/excelFileComparison';
import { compareExcelToCSV } from '../utils/excelCSVComparison';

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
      if (fileNum === 1) setFile1(file);
      else setFile2(file);

      const name = file.name.toLowerCase();
      if (name.endsWith('.txt')) setFileType('text');
      else if (name.endsWith('.csv')) setFileType('csv');
      else if (name.endsWith('.json')) setFileType('json');
      else if (['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ext => name.endsWith(ext))) setFileType('excel');
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

    const name1 = file1.name.toLowerCase();
    const name2 = file2.name.toLowerCase();

    if (fileType === 'csv' && (!name1.endsWith('.csv') || !name2.endsWith('.csv')))
      return setError('Select CSV files');

    if (fileType === 'text' && (!name1.endsWith('.txt') || !name2.endsWith('.txt')))
      return setError('Select text files');

    if (fileType === 'json' && (!name1.endsWith('.json') || !name2.endsWith('.json')))
      return setError('Select JSON files');

    const validExcelExts = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
    if (fileType === 'excel') {
      if (!(validExcelExts.some(ext => name1.endsWith(ext) || name2.endsWith(ext))))
        return setError('Select valid Excel or CSV files');
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
      } else if (
        fileType === 'excel' &&
        ((name1.endsWith('.xlsx') && name2.endsWith('.xlsx')) ||
         (name1.endsWith('.xls') && name2.endsWith('.xls')))
      ) {
        comparisonResults = await compareExcelFiles(file1, file2);
      } else if (
        fileType === 'excel' &&
        ((name1.endsWith('.xlsx') && name2.endsWith('.csv')) ||
         (name1.endsWith('.csv') && name2.endsWith('.xlsx')))
      ) {
        const excelFile = name1.endsWith('.xlsx') ? file1 : file2;
        const csvFile = name1.endsWith('.csv') ? file1 : file2;
        comparisonResults = await compareExcelToCSV(excelFile, csvFile);
      } else {
        return setError('Unsupported file types');
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
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">VeriDiff</h1>
        <p className="description">Upload two files to compare their contents</p>

        <div className="file-type-selector">
          {['csv', 'text', 'json', 'excel'].map(type => (
            <label key={type}>
              <input
                type="radio"
                name="fileType"
                value={type}
                checked={fileType === type}
                onChange={handleFileTypeChange}
              />
              {type.toUpperCase()} Files
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input type="file" onChange={e => handleFileChange(e, 1)} />
          <input type="file" onChange={e => handleFileChange(e, 2)} />
          <button type="submit" disabled={loading}>{loading ? 'Comparing...' : 'Compare Files'}</button>
          {error && <p className="error">{error}</p>}
        </form>

        {results && (
          <div className="results">
            <h2>Comparison Results</h2>
            <p>Total differences: {results.length}</p>
            <table className="results-table">
              <thead>
                <tr><th>Row</th><th>Column</th><th>Value 1</th><th>Value 2</th><th>Status</th></tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.status === 'mismatch' ? 'difference' : ''}>
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
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }
        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 1rem 0 0.5rem;
        }
        .file-type-selector {
          display: flex;
          gap: 2rem;
          margin: 1rem 0 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .form {
          width: 100%;
          max-width: 800px;
          margin-bottom: 2rem;
        }
        .results {
          width: 100%;
          max-width: 800px;
          margin-top: 2rem;
        }
        .results-table {
          width: 100%;
          border-collapse: collapse;
        }
        .results-table th,
        .results-table td {
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        .results-table th {
          background-color: #f2f2f2;
        }
        .results-table .difference {
          background-color: #ffebee;
        }
        .error {
          color: red;
          margin-top: 1rem;
        }
        button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:hover {
          background-color: #0051a2;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        @media (max-width: 600px) {
          .file-type-selector {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
