// /pages/excel-csv-results.js - EXCEL/CSV RESULTS ONLY (Clean Split)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// Import your existing Excel/CSV results components here
// import ExcelCSVResults from '../components/ExcelCSVResults';

export default function ExcelCSVResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [fileType, setFileType] = useState(null);
  const [tabularResults, setTabularResults] = useState(null);
  const [headerMappings, setHeaderMappings] = useState(null);
  const [toleranceSettings, setToleranceSettings] = useState(null);

  useEffect(() => {
    loadExcelCSVResults();
  }, []);

  const loadExcelCSVResults = async () => {
    try {
      console.log('📊 Loading Excel/CSV comparison results...');
      
      // Load file info
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');
      
      if (!file1Info || !file2Info) {
        console.error('❌ File info not found, redirecting to home');
        router.push('/');
        return;
      }

      // Verify these are Excel/CSV files
      const getFileType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['xlsx', 'xls', 'xlsm'].includes(extension)) return 'excel';
        if (extension === 'csv') return 'csv';
        return 'unknown';
      };

      const file1Type = getFileType(file1Info.name);
      const file2Type = getFileType(file2Info.name);

      if (!['excel', 'csv'].includes(file1Type) || !['excel', 'csv'].includes(file2Type)) {
        setError('This page is for Excel and CSV results only. Invalid file types detected.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Load stored data
      const comparisonResultsData = sessionStorage.getItem('veridiff_comparison_results');
      const storedFileType = sessionStorage.getItem('veridiff_file_type');
      const headerMappingsData = sessionStorage.getItem('veridiff_header_mappings');
      const toleranceSettingsData = sessionStorage.getItem('veridiff_tolerance_settings');

      console.log('🔍 DEBUG - Excel/CSV data availability:', {
        hasComparisonResults: !!comparisonResultsData,
        comparisonResultsLength: comparisonResultsData?.length,
        fileType: storedFileType,
        hasHeaderMappings: !!headerMappingsData,
        hasToleranceSettings: !!toleranceSettingsData
      });

      if (!comparisonResultsData) {
        throw new Error('Excel/CSV comparison results not found in sessionStorage. Please run the comparison again.');
      }

      if (!storedFileType) {
        throw new Error('File type information not found. Please run the comparison again.');
      }

      setFileType(storedFileType);

      // Parse comparison results
      console.log('🔍 DEBUG - Parsing Excel/CSV results...');
      const parsedResults = JSON.parse(comparisonResultsData);
      
      console.log('🔍 DEBUG - Parsed Excel/CSV results structure:', {
        type: typeof parsedResults,
        keys: parsedResults ? Object.keys(parsedResults) : 'null',
        hasResults: !!parsedResults.results,
        resultsLength: parsedResults.results?.length,
        totalRecords: parsedResults.total_records,
        differencesFound: parsedResults.differences_found,
        matchesFound: parsedResults.matches_found
      });

      // Validate the parsed results
      if (!parsedResults || typeof parsedResults !== 'object') {
        throw new Error('Invalid Excel/CSV results format');
      }

      if (!parsedResults.results || !Array.isArray(parsedResults.results)) {
        throw new Error('Excel/CSV results missing results array');
      }

      // Parse metadata
      const parsedHeaderMappings = headerMappingsData ? JSON.parse(headerMappingsData) : [];
      const parsedToleranceSettings = toleranceSettingsData ? JSON.parse(toleranceSettingsData) : {};
      
      console.log('✅ All Excel/CSV data parsed successfully');

      // Set state
      setTabularResults(parsedResults);
      setHeaderMappings(parsedHeaderMappings);
      setToleranceSettings(parsedToleranceSettings);
      setIsLoading(false);

      console.log('✅ Excel/CSV results loaded successfully:', {
        totalRecords: parsedResults.total_records,
        differences: parsedResults.differences_found,
        matches: parsedResults.matches_found,
        resultsCount: parsedResults.results.length,
        fileType: storedFileType
      });

    } catch (error) {
      console.error('❌ Error loading Excel/CSV results:', error);
      setError(`Failed to load Excel/CSV results: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleStartNewComparison = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/');
  };

  const handleBackToSetup = () => {
    // Keep file data but go back to Excel/CSV setup
    sessionStorage.removeItem('veridiff_comparison_results');
    sessionStorage.removeItem('veridiff_header_mappings');
    sessionStorage.removeItem('veridiff_tolerance_settings');
    router.push('/excel-csv-comparison');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const renderTabularResults = () => {
    if (!tabularResults) {
      return (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>❌</div>
          <p style={{ color: '#dc2626', fontSize: '1.1rem', fontWeight: '600' }}>
            No comparison results available
          </p>
        </div>
      );
    }

    // Progressive disclosure: limit records for non-authenticated users
    const maxRecordsToShow = isAuthenticated ? tabularResults.results.length : 3;
    const visibleResults = tabularResults.results.slice(0, maxRecordsToShow);
    const hasMoreRecords = tabularResults.results.length > maxRecordsToShow;

    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 Data Comparison Results
        </h2>

        {/* File Type Badge */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <span style={{
            background: fileType === 'csv' ? '#dcfce7' : 
                       fileType === 'excel' ? '#dbeafe' : '#fef3c7',
            color: fileType === 'csv' ? '#166534' : 
                   fileType === 'excel' ? '#1e40af' : '#92400e',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: `1px solid ${fileType === 'csv' ? '#bbf7d0' : 
                                 fileType === 'excel' ? '#c7d2fe' : '#fef08a'}`
          }}>
            {fileType === 'csv' ? '📄 CSV ↔ CSV' :
             fileType === 'excel' ? '📊 Excel ↔ Excel' :
             fileType === 'mixed' ? '🔄 Mixed Format' : `📊 ${fileType?.toUpperCase()}`}
          </span>
        </div>

        {/* Summary Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {tabularResults.total_records}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Total Records
            </div>
          </div>

          <div style={{
            background: '#fef2f2',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #fecaca',
            position: 'relative'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
              {tabularResults.differences_found}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Records with Differences
            </div>
            {!isAuthenticated && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#3b82f6',
                color: 'white',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Pro
              </div>
            )}
          </div>

          <div style={{
            background: '#f0fdf4',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>
              {tabularResults.matches_found}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Perfect Matches
            </div>
          </div>

          {/* Success Rate */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #c7d2fe'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📈</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
              {((tabularResults.matches_found / (tabularResults.matches_found + tabularResults.differences_found)) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Match Rate
            </div>
          </div>
        </div>

        {/* Header Mappings Summary */}
        {headerMappings && headerMappings.length > 0 && (
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#1f2937'
            }}>
              📋 Field Mappings Used
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              {headerMappings.slice(0, 6).map((mapping, index) => (
                <div key={index} style={{
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontWeight: '500' }}>{mapping.file1Header}</span>
                  <span style={{ color: '#10b981' }}>→</span>
                  <span style={{ color: '#6b7280' }}>{mapping.file2Header}</span>
                  {mapping.isAmountField && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: '#fef3c7', 
                      color: '#92400e',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      $
                    </span>
                  )}
                </div>
              ))}
              {headerMappings.length > 6 && (
                <div style={{
                  padding: '8px 12px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  +{headerMappings.length - 6} more fields...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Preview */}
        <div style={{ marginTop: '30px', position: 'relative' }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            🔍 Results Preview
          </h3>
          
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              padding: '15px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: '#374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Showing {Math.min(maxRecordsToShow, tabularResults.results.length)} of {tabularResults.results.length} records
              </span>
              {!isAuthenticated && hasMoreRecords && (
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  Preview Mode
                </span>
              )}
            </div>
            
            {visibleResults.map((record, index) => (
              <div key={index} style={{
                padding: '12px 15px',
                borderBottom: index < visibleResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                fontSize: '0.9rem'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Record {record.ID}</span>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: Object.values(record.fields).some(f => f.status === 'difference') 
                      ? '#fef2f2' : '#f0fdf4',
                    color: Object.values(record.fields).some(f => f.status === 'difference') 
                      ? '#dc2626' : '#16a34a'
                  }}>
                    {Object.values(record.fields).some(f => f.status === 'difference') 
                      ? 'Has Differences' : 'All Match'}
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '10px',
                  fontSize: '0.85rem'
                }}>
                  {Object.entries(record.fields).slice(0, 3).map(([field, data]) => (
                    <div key={field} style={{
                      padding: '8px',
                      background: data.status === 'match' ? '#f0fdf4' : 
                                 data.status === 'acceptable' ? '#fffbeb' : '#fef2f2',
                      borderRadius: '4px',
                      border: `1px solid ${data.status === 'match' ? '#bbf7d0' : 
                                           data.status === 'acceptable' ? '#fef08a' : '#fecaca'}`
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{field}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '500' }}>File 1:</span> {data.val1 || '(empty)'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '500' }}>File 2:</span> {data.val2 || '(empty)'}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: data.status === 'match' ? '#16a34a' : 
                               data.status === 'acceptable' ? '#f59e0b' : '#dc2626',
                        fontWeight: '500',
                        marginTop: '4px'
                      }}>
                        {data.status === 'match' ? '✅ Exact Match' :
                         data.status === 'acceptable' ? '⚠️ Within Tolerance' : '❌ Different'}
                        {data.difference && data.difference !== '0.00' && (
                          <span style={{ marginLeft: '4px' }}>
                            (Δ {data.difference})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {Object.keys(record.fields).length > 3 && (
                    <div style={{
                      padding: '8px',
                      background: '#f9fafb',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}>
                      +{Object.keys(record.fields).length - 3} more fields...
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Upgrade prompt for non-authenticated users */}
            {!isAuthenticated && hasMoreRecords && (
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '120px',
                background: 'linear-gradient(transparent, rgba(248, 250, 252, 0.95))',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                paddingBottom: '20px'
              }}>
                <button 
                  onClick={handleSignUp}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🔓 Unlock All {tabularResults.results.length} Records
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade CTA for non-authenticated users */}
        {!isAuthenticated && hasMoreRecords && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f0f9ff, #ecfdf5)',
            borderRadius: '8px',
            border: '1px solid #e0f2fe',
            textAlign: 'center'
          }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1f2937'
            }}>
              🎯 Get Complete Analysis & More
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: '#374151'
            }}>
              <div>✅ View all {tabularResults.results.length} detailed records</div>
              <div>📊 Export to Excel/CSV</div>
              <div>🔍 Advanced filtering & search</div>
              <div>📈 Custom tolerance settings</div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleSignUp}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🚀 Sign Up Free
              </button>
              <button 
                onClick={() => router.push('/auth/signin')}
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📧 Already have an account?
              </button>
            </div>
          </div>
        )}

        {/* Your existing ExcelCSVResults component would replace this section */}
        {/* <ExcelCSVResults 
          results={tabularResults}
          fileInfo={fileInfo}
          headerMappings={headerMappings}
          toleranceSettings={toleranceSettings}
        /> */}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#1f2937'
      }}>
        Loading Excel/CSV Results
      </h3>
      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
        Processing your data comparison analysis and generating detailed results...
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
          📊 {fileInfo.file1?.name} vs {fileInfo.file2?.name}
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#dc2626'
      }}>
        Excel/CSV Results Error
      </h3>
      <p style={{
        color: '#6b7280',
        fontSize: '1.1rem',
        marginBottom: '25px',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto 25px'
      }}>
        {error}
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleBackToSetup}
          style={{
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔧 Back to Excel/CSV Setup
        </button>
        <button
          onClick={handleStartNewComparison}
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
          🏠 New Comparison
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {isLoading 
            ? 'Loading Excel/CSV Results - VeriDiff'
            : error 
              ? 'Excel/CSV Results Error - VeriDiff'
              : `Excel/CSV Comparison Results - VeriDiff`
          }
        </title>
        <meta name="description" content="View your detailed Excel and CSV data comparison results and analysis" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Page Header */}
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
              {isLoading 
                ? '⏳ Processing Data Analysis'
                : error 
                  ? '❌ Excel/CSV Results Error'
                  : '📊 Excel & CSV Analysis'
              }
            </h1>
            
            {!isLoading && !error && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                margin: '0 auto',
                maxWidth: '600px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span>📊 <strong>{fileInfo.file1?.name}</strong></span>
                  <span style={{ color: '#10b981' }}>vs</span>
                  <span>📊 <strong>{fileInfo.file2?.name}</strong></span>
                  {!isAuthenticated && (
                    <span style={{
                      background: '#3b82f6',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      Preview
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (when not loading and no error) */}
          {!isLoading && !error && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBackToSetup}
                style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔧 Modify Data Settings
              </button>
              <button
                onClick={handleStartNewComparison}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 New Comparison
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading && renderLoadingState()}
          
          {error && renderErrorState()}
          
          {!isLoading && !error && renderTabularResults()}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
