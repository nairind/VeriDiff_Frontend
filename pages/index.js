import { useState } from 'react';
import Head from 'next/head';
import { compareFiles } from '../utils/fileComparison';

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

    // Auto-detect file type ONLY if not already a multi-type comparison like 'excel_csv'
    if (!['excel_csv'].includes(fileType)) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.txt')) {
        setFileType('text');
      } else if (name.endsWith('.csv')) {
        setFileType('csv');
      } else if (name.endsWith('.json')) {
        setFileType('json');
      } else if (['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ext => name.endsWith(ext))) {
        setFileType('excel');
      }
    }
  }
};

 
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

    setLoading(true);
    setError(null);

    try {
      const comparisonResults = await compareFiles(file1, file2, fileType);
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
          {['csv', 'text', 'json', 'excel', 'excel_csv'].map(type => (
            <label key={type}>
              <input
                type="radio"
                name="fileType"
                value={type}
                checked={fileType === type}
                onChange={handleFileTypeChange}
              />
              {type.toUpperCase().replace('_', '–')} Files
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="file-inputs">
            {[file1, file2].map((file, i) => (
              <div className="file-input" key={i}>
                <label htmlFor={`file${i+1}`}>{`${fileType.toUpperCase().replace('_', '–')} File ${i+1}:`}</label>
                <input
                  type="file"
                  id={`file${i+1}`}
                  onChange={(e) => handleFileChange(e, i+1)}
                  accept={fileType === 'csv' ? '.csv' : fileType === 'text' ? '.txt' : fileType === 'json' ? '.json' : fileType === 'excel' ? '.xlsx,.xls,.xlsm,.xlsb' : '.xlsx,.xls,.csv'}
                />
                {file && <p className="file-info">Selected: {file.name}</p>}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading}>{loading ? 'Comparing...' : 'Compare Files'}</button>
          {error && <p className="error">{error}</p>}
        </form>

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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((row, index) => (
                  <tr key={index} className={row.STATUS === 'difference' ? 'difference' : ''}>
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
