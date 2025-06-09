// /pages/excel-csv-comparison.js - EXCEL/CSV ONLY (FRESH START)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeaderMapper from '../components/HeaderMapper';

// Import Excel/CSV utilities
import { compareFiles, parseCSVFile } from '../utils/simpleCSVComparison';
import { compareExcelFiles, parseExcelFile } from '../utils/excelFileComparison';

export default function ExcelCSVComparison() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Excel/CSV specific state
  const [showHeaderMapper, setShowHeaderMapper] = useState(false);
  const [headers, setHeaders] = useState({ file1: [], file2: [] });
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [sampleData1, setSampleData1] = useState([]);
  const [sampleData2, setSampleData2] = useState([]);

  useEffect(() => {
    loadFileData();
  }, []);

  const base64ToFile = (base64Data, fileName, mimeType) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new File([byteArray], fileName, { type: mimeType });
    } catch (error) {
      console.error('Error converting base64 to File:', error);
      throw new Error(`Failed to convert ${fileName} data`);
    }
  };

  const getMimeType = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypes = {
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'csv': 'text/csv'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    if (extension === 'csv') return 'csv';
    return 'unknown';
  };

  const loadFileData = async () => {
    try {
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');

      if (!file1Info || !file2Info) {
        router.push('/');
        return;
      }

      // Verify these are Excel/CSV files
      const file1Type = getFileType(file1Info.name);
      const file2Type = getFileType(file2Info.name);

      if (!['excel', 'csv'].includes(file1Type) || !['excel', 'csv'].includes(file2Type)) {
        setError('This page is for Excel and CSV comparison only. Please upload Excel or CSV files.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Determine comparison type
      if (file1Type === file2Type) {
        setFileType(file1Type); // 'csv' or 'excel'
      } else {
        setFileType('mixed'); // Excel + CSV
      }

      console.log('✅ File types detected:', { file1Type, file2Type, finalType: fileType || 'mixed' });

      // Start loading headers
      await loadHeaders(file1Type, file2Type);

    } catch (error) {
      console.error('Error loading Excel/CSV file data:', error);
      setError('Failed to load file data. Please try uploading again.');
      setIsLoading(false);
    }
  };

  const loadHeaders = async (file1Type, file2Type) => {
    try {
      console.log('📁 Loading headers for Excel/CSV files...');
      
      // Get file data from sessionStorage
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');
      const fileInfo1 = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || '{}');
      const fileInfo2 = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || '{}');

      if (!file1Data || !file2Data) {
        throw new Error('File data not found in sessionStorage');
      }

      // Convert base64 to File objects
      const file1 = base64ToFile(file1Data, fileInfo1.name, getMimeType(fileInfo1.name));
      const file2 = base64ToFile(file2Data, fileInfo2.name, getMimeType(fileInfo2.name));

      console.log('📁 Files converted for processing:', { 
        file1: file1.name, 
        file2: file2.name,
        file1Type,
        file2Type
      });

      let headersData = { file1: [], file2: [] };
      let sampleData1 = [];
      let sampleData2 = [];

      // Parse File 1
      if (file1Type === 'csv') {
        console.log('📄 Processing File 1 as CSV...');
        const data1 = await parseCSVFile(file1);
        console.log('📄 CSV File 1 parsed:', { length: data1?.length, firstRow: data1?.[0] });
        
        if (Array.isArray(data1) && data1.length > 0) {
          headersData.file1 = Object.keys(data1[0]);
          sampleData1 = data1.slice(0, 5);
          console.log('✅ CSV File 1 headers extracted:', headersData.file1);
        }
      } else if (file1Type === 'excel') {
        console.log('📊 Processing File 1 as Excel...');
        const result1 = await parseExcelFile(file1);
        console.log('📊 Excel File 1 parsed:', { result: result1 });
        
        const data1 = result1?.data || result1;
        if (Array.isArray(data1) && data1.length > 0) {
          headersData.file1 = Object.keys(data1[0]);
          sampleData1 = data1.slice(0, 5);
          console.log('✅ Excel File 1 headers extracted:', headersData.file1);
        }
      }

      // Parse File 2
      if (file2Type === 'csv') {
        console.log('📄 Processing File 2 as CSV...');
        const data2 = await parseCSVFile(file2);
        console.log('📄 CSV File 2 parsed:', { length: data2?.length, firstRow: data2?.[0] });
        
        if (Array.isArray(data2) && data2.length > 0) {
          headersData.file2 = Object.keys(data2[0]);
          sampleData2 = data2.slice(0, 5);
          console.log('✅ CSV File 2 headers extracted:', headersData.file2);
        }
      } else if (file2Type === 'excel') {
        console.log('📊 Processing File 2 as Excel...');
        const result2 = await parseExcelFile(file2);
        console.log('📊 Excel File 2 parsed:', { result: result2 });
        
        const data2 = result2?.data || result2;
        if (Array.isArray(data2) && data2.length > 0) {
          headersData.file2 = Object.keys(data2[0]);
          sampleData2 = data2.slice(0, 5);
          console.log('✅ Excel File 2 headers extracted:', headersData.file2);
        }
      }

      // Create suggested mappings based on exact matches first, then similarity
      const mappings = [];
      headersData.file1.forEach(header1 => {
        // First try exact match (case-insensitive)
        let bestMatch = headersData.file2.find(header2 => 
          header1.toLowerCase().trim() === header2.toLowerCase().trim()
        );
        
        let similarity = 0;
        if (bestMatch) {
          similarity = 1.0;
        } else {
          // Try partial matches
          headersData.file2.forEach(header2 => {
            const score = calculateSimilarity(header1, header2);
            if (score > 0.5 && score > similarity) {
              similarity = score;
              bestMatch = header2;
            }
          });
        }

        mappings.push({
          file1Header: header1,
          file2Header: bestMatch || '',
          similarity: similarity
        });
      });

      console.log('✅ Headers and mappings loaded successfully:', {
        file1Headers: headersData.file1.length,
        file2Headers: headersData.file2.length,
        mappings: mappings.length
      });

      // Set the state
      setHeaders(headersData);
      setSuggestedMappings(mappings);
      setSampleData1(sampleData1);
      setSampleData2(sampleData2);
      setShowHeaderMapper(true);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error loading headers:', error);
      setError(`Failed to process files: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Simple similarity calculation
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Simple character overlap
    const chars1 = new Set(s1.split(''));
    const chars2 = new Set(s2.split(''));
    const intersection = new Set([...chars1].filter(x => chars2.has(x)));
    
    return intersection.size / Math.max(chars1.size, chars2.size);
  };

  const handleComparison = async (headerMappings) => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting Excel/CSV comparison with mappings:', headerMappings.length);

      // Get file data again
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');
      const fileInfo1 = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || '{}');
      const fileInfo2 = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || '{}');

      if (!file1Data || !file2Data) {
        throw new Error('File data not found');
      }

      // Convert to files
      const file1 = base64ToFile(file1Data, fileInfo1.name, getMimeType(fileInfo1.name));
      const file2 = base64ToFile(file2Data, fileInfo2.name, getMimeType(fileInfo2.name));

      let comparisonResults;

      // Determine comparison method based on file types
      const file1Type = getFileType(fileInfo1.name);
      const file2Type = getFileType(fileInfo2.name);

      if (file1Type === 'csv' && file2Type === 'csv') {
        console.log('📄 Performing CSV ↔ CSV comparison...');
        comparisonResults = await compareFiles(file1, file2, headerMappings);
        
      } else if (file1Type === 'excel' && file2Type === 'excel') {
        console.log('📊 Performing Excel ↔ Excel comparison...');
        comparisonResults = await compareExcelFiles(file1, file2, headerMappings);
        
      } else {
        // Mixed comparison - use CSV comparison logic for now (simpler)
        console.log('🔄 Performing mixed Excel/CSV comparison...');
        comparisonResults = await compareFiles(file1, file2, headerMappings);
      }

      // DEBUG: Check what the comparison actually returned
      console.log('🔍 DEBUG - Raw comparison results:', comparisonResults);
      console.log('🔍 DEBUG - Results type:', typeof comparisonResults);
      console.log('🔍 DEBUG - Results keys:', comparisonResults ? Object.keys(comparisonResults) : 'null');
      console.log('🔍 DEBUG - Results structure:', {
        hasResults: !!comparisonResults,
        hasTotalRecords: comparisonResults?.total_records !== undefined,
        hasDifferencesFound: comparisonResults?.differences_found !== undefined,
        hasMatchesFound: comparisonResults?.matches_found !== undefined,
        hasResultsArray: !!comparisonResults?.results,
        resultsArrayType: Array.isArray(comparisonResults?.results) ? 'array' : typeof comparisonResults?.results,
        resultsArrayLength: comparisonResults?.results?.length
      });

      // Validate results before using them
      if (!comparisonResults) {
        throw new Error('Comparison returned no results (null/undefined)');
      }
      
      if (typeof comparisonResults !== 'object') {
        throw new Error(`Comparison returned invalid type: ${typeof comparisonResults}`);
      }
      
      if (comparisonResults.total_records === undefined) {
        throw new Error('Comparison results missing total_records property');
      }
      
      if (comparisonResults.results === undefined) {
        throw new Error('Comparison results missing results array');
      }
      
      if (!Array.isArray(comparisonResults.results)) {
        throw new Error(`Comparison results.results is not an array: ${typeof comparisonResults.results}`);
      }

      console.log('✅ Comparison completed and validated:', {
        total_records: comparisonResults.total_records,
        differences_found: comparisonResults.differences_found,
        matches_found: comparisonResults.matches_found,
        results_count: comparisonResults.results.length
      });

      // Store results in sessionStorage with error handling
      console.log('💾 Starting sessionStorage operations...');
      
      try {
        console.log('🔍 DEBUG - About to stringify comparison results...');
        const resultsJson = JSON.stringify(comparisonResults);
        console.log('✅ Comparison results JSON.stringify successful, length:', resultsJson.length);
        sessionStorage.setItem('veridiff_comparison_results', resultsJson);
        
        console.log('🔍 DEBUG - Setting comparison type...');
        sessionStorage.setItem('veridiff_comparison_type', 'tabular');
        
        console.log('🔍 DEBUG - Setting file type:', fileType);
        sessionStorage.setItem('veridiff_file_type', fileType || 'mixed');
        
        console.log('🔍 DEBUG - About to stringify header mappings...');
        console.log('🔍 DEBUG - Header mappings:', headerMappings);
        const mappingsJson = JSON.stringify(headerMappings);
        console.log('✅ Header mappings JSON.stringify successful, length:', mappingsJson.length);
        sessionStorage.setItem('veridiff_header_mappings', mappingsJson);
        
        console.log('✅ All sessionStorage operations completed successfully');
        
      } catch (storageError) {
        console.error('❌ SessionStorage error:', storageError);
        throw new Error(`Failed to store results: ${storageError.message}`);
      }

      console.log('💾 Results stored in sessionStorage, navigating to results...');

      // Navigate to results page
      try {
        console.log('🔍 DEBUG - About to navigate to /track-comparison...');
        await router.push('/track-comparison');
        console.log('✅ Navigation completed successfully');
      } catch (navigationError) {
        console.error('❌ Navigation error:', navigationError);
        throw new Error(`Failed to navigate: ${navigationError.message}`);
      }

    } catch (error) {
      console.error('❌ Excel/CSV comparison error:', error);
      setError(`Comparison failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <>
        <Head>
          <title>Excel/CSV Comparison Error - VeriDiff</title>
        </Head>
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
          <Header />
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '15px'
              }}>
                Excel/CSV Comparison Error
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '25px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🏠 Return Home
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Excel/CSV Comparison Setup - VeriDiff</title>
        <meta name="description" content="Configure your Excel and CSV comparison settings and options" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📊 Excel & CSV Comparison Setup
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Map headers and configure comparison settings for your data files
            </p>
            
            {fileInfo.file1 && fileInfo.file2 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#166534' }}>
                  <strong>Files:</strong> {fileInfo.file1.name} ↔ {fileInfo.file2.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '5px' }}>
                  Type: {fileType === 'mixed' ? 'Excel + CSV' : fileType?.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#1f2937'
              }}>
                Loading Excel/CSV Data...
              </h3>
              <p style={{ color: '#6b7280' }}>
                Reading file structure and extracting headers for comparison setup
              </p>
            </div>
          )}

          {/* Header Mapper */}
          {!isLoading && showHeaderMapper && (
            <HeaderMapper
              file1Headers={headers.file1}
              file2Headers={headers.file2}
              suggestedMappings={suggestedMappings}
              onConfirm={handleComparison}
              onRun={handleComparison}
              sampleData1={sampleData1}
              sampleData2={sampleData2}
              isProcessing={isLoading}
            />
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
