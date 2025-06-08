// /pages/comparison.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeaderMapper from '../components/HeaderMapper';
import { detectFileType } from '../utils/fileDetection';
import { comparePDFFiles } from '../utils/pdfFileComparison1';
// Import your existing Excel/CSV comparison functions
// import { compareExcelFiles, compareCSVFiles } from '../utils/fileComparison';

export default function Comparison() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonType, setComparisonType] = useState(null);
  const [error, setError] = useState(null);

  // For Excel/CSV comparisons (your existing state)
  const [showHeaderMapper, setShowHeaderMapper] = useState(false);
  const [sheets, setSheets] = useState({ file1: [], file2: [] });
  const [selectedSheets, setSelectedSheets] = useState({ file1: 0, file2: 0 });
  const [headers, setHeaders] = useState({ file1: [], file2: [] });
  const [toleranceSettings, setToleranceSettings] = useState({
    enableTolerance: false,
    toleranceValue: 0,
    toleranceType: 'percentage'
  });

  // For PDF comparisons
  const [pdfOptions, setPdfOptions] = useState({
    compareMode: 'text',
    ignoreFormatting: true,
    pageByPage: true,
    includeImages: false
  });

  useEffect(() => {
    loadFileData();
  }, []);

  const loadFileData = async () => {
    try {
      // Load file info from sessionStorage (your existing logic)
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');

      if (!file1Info || !file2Info) {
        router.push('/');
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Detect comparison type based on file extensions
      const file1Type = getFileTypeFromName(file1Info.name);
      const file2Type = getFileTypeFromName(file2Info.name);
      
      console.log('File types detected:', { file1Type, file2Type });

      // Determine comparison strategy
      if (file1Type === 'pdf' && file2Type === 'pdf') {
        setComparisonType('pdf');
        setFileType('pdf');
        setIsLoading(false);
      } else if (['excel', 'csv'].includes(file1Type) && ['excel', 'csv'].includes(file2Type)) {
        setComparisonType('tabular');
        // Use your existing file detection logic for Excel/CSV
        const detectedFileType = detectFileType(file1Info, file2Info);
        setFileType(detectedFileType);
        
        // Load sheets and headers for Excel/CSV files (your existing logic)
        await loadSheetsAndHeaders();
      } else {
        // This shouldn't happen with our validation, but just in case
        setError(`Incompatible file types: ${file1Type} and ${file2Type} cannot be compared together.`);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Error loading file data:', error);
      setError('Failed to load file data. Please try uploading again.');
      setIsLoading(false);
    }
  };

  const getFileTypeFromName = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['xlsx', 'xls'].includes(extension)) return 'excel';
    if (extension === 'csv') return 'csv';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const loadSheetsAndHeaders = async () => {
    // Your existing sheet and header loading logic for Excel/CSV files
    try {
      // This would be your existing implementation
      // For now, I'll show the structure you'd follow:
      
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');

      if (!file1Data || !file2Data) {
        throw new Error('File data not found');
      }

      // Use your existing file processing logic here
      // const file1Processed = await processFile(file1Data, fileInfo.file1.name);
      // const file2Processed = await processFile(file2Data, fileInfo.file2.name);
      
      // For demo purposes, setting basic structure:
      setSheets({ 
        file1: [{ name: 'Sheet1', index: 0 }], 
        file2: [{ name: 'Sheet1', index: 0 }] 
      });
      setHeaders({ 
        file1: ['Column1', 'Column2'], 
        file2: ['Column1', 'Column2'] 
      });
      
      setShowHeaderMapper(true);
      setIsLoading(false);

    } catch (error) {
      console.error('Error loading sheets and headers:', error);
      setError('Failed to process files. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTabularComparison = async (headerMappings) => {
    try {
      setIsLoading(true);

      // Store comparison settings
      sessionStorage.setItem('veridiff_header_mappings', JSON.stringify(headerMappings));
      sessionStorage.setItem('veridiff_selected_sheets', JSON.stringify(selectedSheets));
      sessionStorage.setItem('veridiff_tolerance_settings', JSON.stringify(toleranceSettings));
      sessionStorage.setItem('veridiff_file_type', fileType);

      // Navigate to results (your existing logic)
      router.push('/track-comparison');

    } catch (error) {
      console.error('Error in tabular comparison:', error);
      setError('Comparison failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePDFComparison = async () => {
    try {
      setIsLoading(true);
      console.log('Starting PDF comparison...');

      // Load PDF file data from sessionStorage
      const file1Data = sessionStorage.getItem('veridiff_file1_data');
      const file2Data = sessionStorage.getItem('veridiff_file2_data');

      if (!file1Data || !file2Data) {
        throw new Error('PDF file data not found in session storage');
      }

      // Convert base64 back to binary for PDF processing
      const file1Binary = Uint8Array.from(atob(file1Data), c => c.charCodeAt(0));
      const file2Binary = Uint8Array.from(atob(file2Data), c => c.charCodeAt(0));

      // Perform PDF comparison
      console.log('Calling PDF comparison engine...');
      const comparisonResults = await comparePDFFiles(
        file1Binary.buffer, 
        file2Binary.buffer, 
        pdfOptions
      );

      console.log('PDF comparison completed:', comparisonResults);

      // Store PDF results and metadata
      sessionStorage.setItem('veridiff_pdf_results', JSON.stringify(comparisonResults));
      sessionStorage.setItem('veridiff_comparison_type', 'pdf');
      sessionStorage.setItem('veridiff_pdf_options', JSON.stringify(pdfOptions));

      // Navigate to results
      router.push('/track-comparison');

    } catch (error) {
      console.error('PDF comparison error:', error);
      setError(`PDF comparison failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const renderPDFOptions = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#1f2937'
      }}>
        📕 PDF Comparison Options
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '15px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={pdfOptions.ignoreFormatting}
              onChange={(e) => setPdfOptions(prev => ({
                ...prev,
                ignoreFormatting: e.target.checked
              }))}
              style={{ transform: 'scale(1.2)' }}
            />
            Ignore Formatting Differences
          </label>
          <p style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            margin: '0 0 0 30px',
            lineHeight: '1.4'
          }}>
            Focus on content changes rather than formatting differences like spacing and fonts.
          </p>
        </div>

        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '15px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={pdfOptions.pageByPage}
              onChange={(e) => setPdfOptions(prev => ({
                ...prev,
                pageByPage: e.target.checked
              }))}
              style={{ transform: 'scale(1.2)' }}
            />
            Page-by-Page Analysis
          </label>
          <p style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            margin: '0 0 0 30px',
            lineHeight: '1.4'
          }}>
            Compare documents page-by-page for detailed analysis and better organization of results.
          </p>
        </div>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '10px',
          color: '#1f2937'
        }}>
          📄 Document Information
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong>File 1:</strong> {fileInfo.file1?.name}
            <br />
            <span style={{ color: '#6b7280' }}>
              Size: {fileInfo.file1 ? (fileInfo.file1.size / 1024 / 1024).toFixed(1) : 0}MB
            </span>
          </div>
          <div>
            <strong>File 2:</strong> {fileInfo.file2?.name}
            <br />
            <span style={{ color: '#6b7280' }}>
              Size: {fileInfo.file2 ? (fileInfo.file2.size / 1024 / 1024).toFixed(1) : 0}MB
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePDFComparison}
        disabled={isLoading}
        style={{
          background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '12px 30px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto'
        }}
      >
        {isLoading ? (
          <>
            <span>⏳</span>
            Processing PDFs...
          </>
        ) : (
          <>
            <span>📊</span>
            Compare PDF Documents
          </>
        )}
      </button>
    </div>
  );

  if (error) {
    return (
      <>
        <Head>
          <title>Error - VeriDiff</title>
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
                Comparison Error
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '25px',
                lineHeight: '1.6'
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
        <title>File Comparison Setup - VeriDiff</title>
        <meta name="description" content="Configure your file comparison settings and options" />
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
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔍 File Comparison Setup
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {comparisonType === 'pdf' 
                ? 'Configure your PDF document comparison settings'
                : 'Set up field mapping and comparison options for your data files'
              }
            </p>
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
                {comparisonType === 'pdf' ? 'Processing PDF Documents...' : 'Loading File Data...'}
              </h3>
              <p style={{ color: '#6b7280' }}>
                {comparisonType === 'pdf' 
                  ? 'Analyzing document structure and extracting text content'
                  : 'Reading file structure and preparing comparison options'
                }
              </p>
            </div>
          )}

          {/* PDF Comparison Interface */}
          {!isLoading && comparisonType === 'pdf' && renderPDFOptions()}

          {/* Excel/CSV Comparison Interface (Your existing HeaderMapper) */}
          {!isLoading && comparisonType === 'tabular' && showHeaderMapper && (
            <HeaderMapper
              fileType={fileType}
              sheets={sheets}
              selectedSheets={selectedSheets}
              setSelectedSheets={setSelectedSheets}
              headers={headers}
              toleranceSettings={toleranceSettings}
              setToleranceSettings={setToleranceSettings}
              onComparisonReady={handleTabularComparison}
              fileInfo={fileInfo}
            />
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
