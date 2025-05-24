import { useState } from 'react';
import Head from 'next/head';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile } from '../utils/excelFileComparison';
import HeaderMapper from '../components/HeaderMapper';
import { mapHeaders } from '../utils/mapHeaders';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [results, setResults] = useState(null);
  const [fileType, setFileType] = useState('excel_csv');
  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);

  const handleFileChange = async (e, fileNum) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileNum === 1) setFile1(file);
    else setFile2(file);

    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) setFileType('csv');
    else if ([".xlsx", ".xls", ".xlsm", ".xlsb"].some(ext => name.endsWith(ext))) setFileType('excel');

    if (file1 && file2) {
      let data1 = [], data2 = [];
      if (fileType === 'excel_csv') {
        data1 = await parseExcelFile(file1);
        data2 = await parseCSVFile(file2);
      }
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setShowMapper(true);
    }
  };

  const handleMappingConfirm = (mappings) => {
    setFinalMappings(mappings);
  };

  const handleCompare = async () => {
    if (!file1 || !file2 || !finalMappings.length) return;
    const result = await compareExcelCSVFiles(file1, file2, finalMappings);
    setResults(result);
  };

  const generateTableHeaders = (records) => {
    if (!records || records.length === 0) return [];
    return Object.keys(records[0]);
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
          <label><input type="radio" name="fileType" value="csv" checked={fileType === 'csv'} onChange={() => setFileType('csv')} /> CSV Files</label>
          <label><input type="radio" name="fileType" value="excel" checked={fileType === 'excel'} onChange={() => setFileType('excel')} /> EXCEL Files</label>
          <label><input type="radio" name="fileType" value="excel_csv" checked={fileType === 'excel_csv'} onChange={() => setFileType('excel_csv')} /> Excel–CSV</label>
        </div>

        <input type="file" onChange={(e) => handleFileChange(e, 1)} />
        <input type="file" onChange={(e) => handleFileChange(e, 2)} />

        {showMapper && (
          <>
            <HeaderMapper
              file1Headers={headers1}
              file2Headers={headers2}
              suggestedMappings={suggestedMappings}
              onConfirm={handleMappingConfirm}
            />
            <button onClick={handleCompare}>Run Comparison</button>
          </>
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
                  {generateTableHeaders(results.results).map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([key, val]) => {
                      const status = row.STATUS;
                      const diff = row.DIFFERENCE ?? 0;
                      let className = '';
                      if (key === 'DIFFERENCE' && status === 'acceptable') className = 'acceptable';
                      else if (key === 'DIFFERENCE' && status === 'difference') className = 'difference';
                      return <td key={key} className={className}>{val}</td>;
                    })}
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
