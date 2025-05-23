import { useState } from 'react';
import Head from 'next/head';
import { compareFiles } from '../utils/simpleCSVComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareJSONFiles_main } from '../utils/jsonFileComparison';
import { compareExcelFiles } from '../utils/excelFileComparison';
import { compareExcelCSVFiles } from '../utils/fileComparison';

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

    // Only auto-detect if user hasn’t explicitly selected a type
    if (!fileType || fileType === 'csv' || fileType === 'excel' || fileType === 'text' || fileType === 'json') {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.txt')) {
        setFileType('text');
      } else if (lowerName.endsWith('.csv')) {
        setFileType('csv');
      } else if (['.xlsx', '.xls', '.xlsm', '.xlsb'].some(ext => lowerName.endsWith(ext))) {
        setFileType('excel');
      } else if (lowerName.endsWith('.json')) {
        setFileType('json');
      }
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

  const lowerFile1 = file1.name.toLowerCase();
  const lowerFile2 = file2.name.toLowerCase();

  const isExcel = ext => ['.xlsx', '.xls', '.xlsm', '.xlsb'].some(x => ext.endsWith(x));

  // File validation
  if (fileType === 'csv' && (!lowerFile1.endsWith('.csv') || !lowerFile2.endsWith('.csv'))) {
    setError('Please select CSV files');
    return;
  }
  if (fileType === 'text' && (!lowerFile1.endsWith('.txt') || !lowerFile2.endsWith('.txt'))) {
    setError('Please select TXT files');
    return;
  }
  if (fileType === 'json' && (!lowerFile1.endsWith('.json') || !lowerFile2.endsWith('.json'))) {
    setError('Please select JSON files');
    return;
  }
  if (fileType === 'excel' && (!isExcel(lowerFile1) || !isExcel(lowerFile2))) {
    setError('Please select Excel files');
    return;
  }
  if (fileType === 'excel_csv' && (
    !(isExcel(lowerFile1) && lowerFile2.endsWith('.csv')) &&
    !(isExcel(lowerFile2) && lowerFile1.endsWith('.csv'))
  )) {
    setError('Please select one Excel and one CSV file for Excel–CSV comparison');
    return;
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
      comparisonResults = await compareExcelFiles(file1, file2);
    } else if (fileType === 'excel_csv') {
      comparisonResults = await compareExcelCSVFiles(file1, file2); // make sure this import exists
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
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={handleFileTypeChange} /> CSV Files</label>
          <label><input type="radio" name="fileType" value="text" checked={fileType === 'text'} onChange={handleFileTypeChange} /> TEXT Files</label>
          <label><input type="radio" name="fileType" value="json" checked={fileType === 'json'} onChange={handleFileTypeChange} /> JSON Files</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={handleFileTypeChange} /> EXCEL Files</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={handleFileTypeChange} /> Excel–CSV</label>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="file-inputs">
            <input type="file" onChange={(e) => handleFileChange(e, 1)} />
            <input type="file" onChange={(e) => handleFileChange(e, 2)} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Files'}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        {results && (
          <div className="results">
            <h2>Comparison Results</h2>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
        }
        .title {
          font-size: 3rem;
          text-align: center;
        }
        .description {
          text-align: center;
          margin-bottom: 1rem;
        }
        .file-type-selector {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .file-inputs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .error {
          color: red;
          text-align: center;
        }
        .results {
          margin-top: 2rem;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
