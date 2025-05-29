<section style={{
          background: 'linear-gradient(to bottom right, #2563eb, #9333ea)',
          borderRadius: '16px',
          color: 'white',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#bfdbfe',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px'
            }}>
              ⚡ Smart File Comparison
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              VeriDiff
            </h1>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '300',
              marginBottom: '24px',
              opacity: 0.9
            }}>
              Compare documents with precision and confidence
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.8,
              maxWidth: '512px',
              margin: '0 auto'
            }}>
              From Excel to PDFs, VeriDiff handles your most critical file comparisons with professional-grade accuracy.
            </p>
          </div>
        </section>

        {/* File Type Selection */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '8px'
            }}>Choose Your Comparison Type</h2>
            <p style={{
              color: '#6b7280'
            }}>Select the file formats you want to compare</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            maxWidth: '1024px',
            margin: '0 auto'
          }}>
            {Object.entries(fileTypeConfig).map(([key, config]) => {
              const isSelected = fileType === key;
              const isDisabled = config.disabled;
              
              return (
                <label
                  key={key}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isSelected ? '#eff6ff' : 
                                   config.featured ? 'linear-gradient(to bottom right, #fefce8, #fed7aa)' : 'white',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.borderColor = '#93c5fd';
                      e.currentTarget.style.backgroundColor = 'rgba(239, 246, 255, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = config.featured ? 
                        'linear-gradient(to bottom right, #fefce8, #fed7aa)' : 'white';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="fileType"
                    value={key}
                    checked={isSelected}
                    onChange={handleFileTypeChange}
                    disabled={isDisabled}
                    style={{ display: 'none' }}
                  />
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <div style={{
                      flexShrink: 0,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '24px',
                      backgroundColor: config.featured ? '#fed7aa' : '#dbeafe'
                    }}>
                      {config.icon}
                    </div>
                    
                    <div style={{
                      marginLeft: '12px',
                      flex: 1
                    }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {config.label}
                        {config.badge && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '4px'
                          }}>
                            {config.badge}
                          </span>
                        )}
                        {config.featured && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            backgroundColor: '#fed7aa',
                            color: '#92400e',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            Featured
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>{config.description}</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px'
                    }}>
                      ✅
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* File Order Guidance for Excel-CSV */}
        {fileType === 'excel_csv' && (
          <section style={{
            background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
            border: '2px solid #c7d2fe',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  fontSize: '32px'
                }}>
                  📊
                </div>
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e3a8a',
                marginBottom: '12px'
              }}>📋 File Upload Instructions</h3>
              <p style={{
                color: '#1d4ed8',
                marginBottom: '16px'
              }}>Please upload your files in the correct order:</p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #2563eb',
                  margin: '8px'
                }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>📊</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>1. Excel File First</span>
                  <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>(.xlsx, .xls, .xlsm)</span>
                </div>
                
                <span style={{ color: '#2563eb', fontSize: '24px' }}>→</span>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #2563eb',
                  margin: '8px'
                }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>📋</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>2. CSV File Second</span>
                  <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>(.csv)</span>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#f59e0b', marginRight: '8px' }}>⚠️</span>
                  <span style={{ fontSize: '14px', color: '#92400e' }}>File order matters for accurate data mapping and comparison results.</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* File Upload */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '8px'
            }}>📁 Upload Your Files</h2>
            <p style={{
              color: '#6b7280'
            }}>Select files to compare</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                File 1: {getFileTypeLabel(fileType, 1)}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 1)}
                  style={{
                    display: 'block',
                    width: '100%',
                    fontSize: '14px',
                    color: '#6b7280',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                />
                {file1 && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#22c55e', marginRight: '8px' }}>✅</span>
                    <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>{file1.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                File 2: {getFileTypeLabel(fileType, 2)}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 2)}
                  style={{
                    display: 'block',
                    width: '100%',
                    fontSize: '14px',
                    color: '#6b7280',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                />
                {file2 && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#22c55e', marginRight: '8px' }}>✅</span>
                    <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>{file2.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleLoadFiles} 
              disabled={loading || !file1 || !file2}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: loading || !file1 || !file2 ? 
                  'linear-gradient(to right, #9ca3af, #6b7280)' :
                  'linear-gradient(to right, #2563eb, #9333ea)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '500',
                border: 'none',
                cursor: loading || !file1 || !file2 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transform: loading || !file1 || !file2 ? 'none' : 'translateY(0)'
              }}
              onMouseOver={(e) => {
                if (!loading && file1 && file2) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && file1 && file2) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    height: '20px',
                    width: '20px',
                    border: '2px solid transparent',
                    borderBottom: '2px solid white',
                    marginRight: '12px'
                  }}></div>
                  Processing Files...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '12px' }}>▶️</span>
                  Load Files & Start Comparison
                </>
              )}
            </button>
          </div>
        </section>

        {/* Sheet Selector */}
        {FEATURES.SHEET_SELECTION && showSheetSelector && (
          <section style={{ marginBottom: '32px' }}>
            <SheetSelector
              file1Info={file1Info}
              file2Info={file2Info}
              onSheetSelect={handleSheetSelect}
              fileType={fileType}
            />
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={handleProceedWithSheets} 
                disabled={loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) ?
                    'linear-gradient(to right, #9ca3af, #6b7280)' :
                    'linear-gradient(to right, #2563eb, #9333ea)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading || !selectedSheet1 || (fileType === 'excel' && !selectedSheet2) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '16px',
                      width: '16px',
                      border: '2px solid transparent',
                      borderBottom: '2px solid white',
                      marginRight: '8px'
                    }}></div>
                    Processing...
                  </>
                ) : (
                  'Proceed with Selected Sheets'
                )}
              </button>
            </div>
          </section>
        )}

        {/* Header Mapper */}
        {showMapper && (
          <section style={{ marginBottom: '32px' }}>
            <HeaderMapper
              file1Headers={headers1}
              file2Headers={headers2}
              suggestedMappings={suggestedMappings}
              sampleData1={sampleData1}
              sampleData2={sampleData2}
              onConfirm={handleMappingConfirmed}
              showRunButton={true}
              onRun={handleRunComparison}
            />
          </section>
        )}

        {/* Error Display */}
        {error && (
          <section style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #f87171',
              padding: '24px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#f87171', marginRight: '12px', fontSize: '20px' }}>⚠️</span>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>Error</h3>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#b91c1c',
                    whiteSpace: 'pre-line'
                  }}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: '#eff6ff',
              borderLeft: '4px solid #60a5fa',
              padding: '24px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  animation: 'spin 1s linear infinite',
                  borderRadius: '50%',
                  height: '20px',
                  width: '20px',
                  border: '2px solid transparent',
                  borderBottom: '2px solid #2563eb',
                  marginRight: '12px'
                }}></div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>Processing</h3>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#1d4ed8'
                  }}>
                    Loading and processing your files...
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {results && (
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '32px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px'
              }}>📊 Comparison Results</h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span style={{ marginRight: '8px' }}>✅</span>
                Analysis Complete
              </div>
            </div>
            
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #c7d2fe'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ color: '#2563eb', fontSize: '14px', fontWeight: '500' }}>Total Records</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>{results.total_records}</p>
                  </div>
                  <span style={{ fontSize: '32px' }}>📋</span>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ color: '#16a34a', fontSize: '14px', fontWeight: '500' }}>Matches Found</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>{results.matches_found}</p>
                  </div>
                  <span style={{ fontSize: '32px' }}>✅</span>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #fdba74'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ color: '#ea580c', fontSize: '14px', fontWeight: '500' }}>Differences Found</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2410c' }}>{results.differences_found}</p>
                  </div>
                  <span style={{ fontSize: '32px' }}>⚠️</span>
                </div>
              </div>
            </div>

            {/* Auto-detected Fields */}
            {FEATURES.AUTO_DETECTION && results.autoDetectedFields && results.autoDetectedFields.length > 0 && (
              <div style={{
                background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#16a34a', marginRight: '8px' }}>🤖</span>
                  <span style={{ fontWeight: '500', color: '#166534' }}>Auto-detected Amount Fields:</span>
                  <span style={{ color: '#15803d', marginLeft: '8px' }}>{results.autoDetectedFields.join(', ')}</span>
                </div>
              </div>
            )}
            
            {/* Download Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <button 
                onClick={handleDownloadExcel} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
              >
                <span style={{ marginRight: '8px' }}>📊</span>
                Download Excel
              </button>
              <button 
                onClick={handleDownloadCSV} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <span style={{ marginRight: '8px' }}>📄</span>
                Download CSV
              </button>
            </div>
            
            {/* Results Table */}
            {results.results && results.results.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <div style={{
                  display: 'inline-block',
                  minWidth: '100%',
                  verticalAlign: 'middle'
                }}>
                  <div style={{
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <table style={{
                      minWidth: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{
                            padding: '12px 24px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            ID
                          </th>
                          {Object.keys(results.results[0].fields).map((field, idx) => (
                            <th key={idx} style={{
                              padding: '12px 24px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#6b7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody style={{
                        backgroundColor: 'white',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        {results.results.map((row, rowIndex) => (
                          <tr key={rowIndex} style={{
                            ':hover': { backgroundColor: '#f9fafb' }
                          }}>
                            <td style={{
                              padding: '12px 24px',
                              whiteSpace: 'nowrap',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#111827'
                            }}>
                              {row.ID}
                            </td>
                            {Object.entries(row.fields).map(([key, value], idx) => (
                              <td
                                key={idx}
                                style={{
                                  padding: '12px 24px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '14px',
                                  backgroundColor: 
                                    value.status === 'difference' ? '#fef2f2' :
                                    value.status === 'acceptable' ? '#fefce8' :
                                    value.status === 'match' ? '#f0fdf4' : 'white'
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '500', color: '#111827' }}>
                                      {value.val1} / {value.val2}
                                    </span>
                                    {FEATURES.AUTO_DETECTION && value.isAutoDetectedAmount && (
                                      <span style={{
                                        marginLeft: '8px',
                                        color: '#22c55e'
                                      }} title="Auto-detected amount field">🤖</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      backgroundColor: 
                                        value.status === 'difference' ? '#fecaca' :
                                        value.status === 'acceptable' ? '#fde68a' :
                                        value.status === 'match' ? '#bbf7d0' : '#e5e7eb',
                                      color:
                                        value.status === 'difference' ? '#991b1b' :
                                        value.status === 'acceptable' ? '#92400e' :
                                        value.status === 'match' ? '#166534' : '#374151'
                                    }}>
                                      {value.status}
                                      {value.difference && ` (Δ ${value.difference})`}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Security Banner */}
      <section style={{
        background: 'linear-gradient(to right, #16a34a, #059669)',
        color: 'white',
        padding: '48px 0'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '0 16px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '48px' }}>🛡️</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>Your Data Never Leaves Your Device</h2>
          <p style={{
            fontSize: '18px',
            color: '#bbf7d0',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            VeriDiff processes everything locally in your browser using advanced client-side technology. 
            No uploads, no cloud storage, no data collection. What happens on your computer, stays on your computer.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px'
            }}>✨ Key Features</h2>
            <p style={{
              fontSize: '20px',
              color: '#6b7280'
            }}>Professional-grade file comparison capabilities</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #c7d2fe',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>100% Private</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>All processing happens in your browser. No data leaves your device.</p>
            </div>
            
            <div style={{
              background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Smart Mapping</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Automatically detects similar fields across different file formats.</p>
            </div>
            
            <div style={{
              background: 'linear-gradient(to bottom right, #faf5ff, #e9d5ff)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #c4b5fd',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Tolerance Settings</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Set acceptable differences for financial data and accounting workflows.</p>
            </div>
            
            <div style={{
              background: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #fdba74',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Professional Reports</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Export detailed results with color-coded differences and statistics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section style={{
        padding: '48px 0',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          padding: '0 16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '24px'
          }}>📁 Supported File Formats</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>📊 Excel (.xlsx)</span>
            <span style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>📋 CSV (.csv)</span>
            <span style={{
              backgroundColor: '#fecaca',
              color: '#991b1b',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>📄 PDF (.pdf)</span>
            <span style={{
              backgroundColor: '#e9d5ff',
              color: '#7c3aed',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>⚙️ JSON (.json)</span>
            <span style={{
              backgroundColor: '#fde68a',
              color: '#92400e',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>📋 XML (.xml)</span>
            <span style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontWeight: '500'
            }}>📝 Text (.txt)</span>
          </div>
          <p style={{
            color: '#6b7280',
            marginTop: '16px'
          }}>Mix and match formats - compare Excel files with CSV data, extract text from PDFs, and handle complex nested structures.</p>
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}          <div>
            <h3 style={{
              fontWeight: '600',
              color: '#111827'
            }}>{title}</h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>{fileInfo.fileName}</p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Select Sheet to Compare
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedSheet}
              onChange={(e) => onSheetChange(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                paddingLeft: '12px',
                paddingRight: '40px',
                paddingTop: '12px',
                paddingBottom: '12px',
                fontSize: '14px',
                appearance: 'none',
                backgroundColor: 'white'
              }}
            >
              {fileInfo.sheets.map(sheet => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  {sheet.isHidden ? ' (Hidden)' : ''}
                  {sheet.hasData ? ` • ${sheet.rowCount} rows` : ' • No data'}
                </option>
              ))}
            </select>
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }}>⌄</span>
          </div>
        </div>

        {selectedSheetInfo && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontWeight: '500',
                color: '#111827',
                display: 'flex',
                alignItems: 'center'
              }}>
                📈 Sheet Preview
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {selectedSheetInfo.isHidden ? '👁️‍🗨️' : '👁️'} {selectedSheetInfo.isHidden ? 'Hidden' : 'Visible'}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', marginRight: '8px' }}>#</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  <span style={{ fontWeight: '500' }}>{selectedSheetInfo.rowCount}</span> rows
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {selectedSheetInfo.hasData ? (
                  <span style={{ color: '#22c55e', marginRight: '8px' }}>✅</span>
                ) : (
                  <span style={{ color: '#f59e0b', marginRight: '8px' }}>⚠️</span>
                )}
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {selectedSheetInfo.hasData ? 'Has data' : 'No data'}
                </span>
              </div>
            </div>

            {selectedSheetInfo.headers && selectedSheetInfo.headers.length > 0 && (
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Column Headers:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedSheetInfo.headers.slice(0, 6).map((header, index) => (
                    <span 
                      key={index}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af'
                      }}
                    >
                      {header}
                    </span>
                  ))}
                  {selectedSheetInfo.headers.length > 6 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280'
                    }}>
                      +{selectedSheetInfo.headers.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
      border: '2px solid #c7d2fe',
      borderRadius: '16px',
      padding: '32px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '16px'
        }}>
          📊 Excel Sheet Selection
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1e3a8a',
          marginBottom: '8px'
        }}>Multiple Sheets Detected</h2>
        <p style={{
          color: '#1d4ed8'
        }}>
          Your Excel files contain multiple sheets. Please select which sheets to compare:
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '32px'
      }}>
        {showFile1Selector && (
          <SheetCard
            fileInfo={file1Info}
            selectedSheet={selectedSheet1}
            onSheetChange={setSelectedSheet1}
            title="File 1"
          />
        )}

        {showFile2Selector && (
          <SheetCard
            fileInfo={file2Info}
            selectedSheet={selectedSheet2}
            onSheetChange={setSelectedSheet2}
            title="File 2"
          />
        )}
      </div>

      <div style={{
        marginTop: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #c7d2fe',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{
            color: '#2563eb',
            marginRight: '12px',
            marginTop: '2px',
            flexShrink: 0
          }}>💡</span>
          <div style={{ fontSize: '14px', color: '#1e40af' }}>
            <p style={{ fontWeight: '500', marginBottom: '4px' }}>Sheet Selection Tips:</p>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#1d4ed8' }}>
              <li style={{ marginBottom: '2px' }}>• Choose sheets that contain the data you want to compare</li>
              <li style={{ marginBottom: '2px' }}>• Hidden sheets are shown but may contain system data</li>
              <li style={{ marginBottom: '2px' }}>• Sheets with more rows typically contain more comprehensive data</li>
              <li>• Column headers preview helps you identify the right sheet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Compare() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState('csv');

  // Core states (always present)
  const [showMapper, setShowMapper] = useState(false);
  const [headers1, setHeaders1] = useState([]);
  const [headers2, setHeaders2] = useState([]);
  const [suggestedMappings, setSuggestedMappings] = useState([]);
  const [finalMappings, setFinalMappings] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleData1, setSampleData1] = useState(null);
  const [sampleData2, setSampleData2] = useState(null);

  // Optional states (only used if features enabled)
  const [file1Info, setFile1Info] = useState(null);
  const [file2Info, setFile2Info] = useState(null);
  const [selectedSheet1, setSelectedSheet1] = useState(null);
  const [selectedSheet2, setSelectedSheet2] = useState(null);
  const [showSheetSelector, setShowSheetSelector] = useState(false);

  // INLINE FILE DETECTION (inside component)
  const detectFileTypeInline = (file) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.xlsm')) {
      return { type: 'excel', label: 'Excel' };
    }
    if (fileName.endsWith('.csv')) {
      return { type: 'csv', label: 'CSV' };
    }
    if (fileName.endsWith('.json')) {
      return { type: 'json', label: 'JSON' };
    }
    if (fileName.endsWith('.txt')) {
      return { type: 'text', label: 'Text' };
    }
    
    return { type: 'unknown', label: 'Unknown' };
  };

  // ENFORCED FILE ORDER VALIDATION - Simple and Clear
  const validateExcelCSVOrder = (file1, file2) => {
    const file1Type = detectFileTypeInline(file1);
    const file2Type = detectFileTypeInline(file2);
    
    console.log(`🔍 File 1 (${file1.name}) detected as: ${file1Type.type}`);
    console.log(`🔍 File 2 (${file2.name}) detected as: ${file2Type.type}`);
    
    // STRICT: File 1 must be Excel, File 2 must be CSV
    if (file1Type.type !== 'excel') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 1 must be an Excel file (.xlsx, .xls)\nYou uploaded: ${file1Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    if (file2Type.type !== 'csv') {
      return {
        valid: false,
        error: `❌ File Order Error!\n\nFile 2 must be a CSV file (.csv)\nYou uploaded: ${file2Type.label}\n\nPlease upload Excel file first, then CSV file.`
      };
    }
    
    console.log("✅ Correct file order: Excel → CSV");
    return {
      valid: true,
      excelFile: file1,
      csvFile: file2
    };
  };

  const handleFileChange = (e, fileNum) => {
    const file = e.target.files[0];
    if (!file) return;
    if (fileNum === 1) setFile1(file);
    else setFile2(file);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile1(null);
    setFile2(null);
    setResults(null);
    setError(null);
    setShowMapper(false);
    
    // Reset optional states
    if (FEATURES.SHEET_SELECTION) {
      setShowSheetSelector(false);
      setFile1Info(null);
      setFile2Info(null);
    }
  };

  // LEGACY EXCEL-CSV PARSING FUNCTION (fallback)
  const legacyExcelCSVParsing = async () => {
    console.log("Using legacy Excel-CSV parsing...");
    let data1 = [], data2 = [];
    
    try {
      if (FEATURES.SHEET_SELECTION) {
        const excelInfo = await getExcelFileInfo(file1);
        setFile1Info(excelInfo);
        
        if (excelInfo.sheets.length > 1) {
          setShowSheetSelector(true);
          setLoading(false);
          return { data1: [], data2: [] };
        }
        
        const result1 = await parseExcelFile(file1, excelInfo.defaultSheet);
        data1 = safeExtractExcelData(result1);
      } else {
        const result1 = await parseExcelFile(file1);
        data1 = safeExtractExcelData(result1);
      }
    } catch (excelError) {
      console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
      const result1 = await parseExcelFile(file1);
      data1 = Array.isArray(result1) ? result1 : (result1.data || []);
    }
    
    data2 = await parseCSVFile(file2);
    return { data1, data2 };
  };

  // MODULAR: Safe Excel data extraction
  const safeExtractExcelData = (result) => {
    if (FEATURES.ENHANCED_EXCEL_PARSING && result && typeof result === 'object' && result.data) {
      return result.data;
    }
    return Array.isArray(result) ? result : [];
  };

  // MODULAR: Safe data validation
  const validateDataFormat = (data1, data2) => {
    if (!FEATURES.ENHANCED_EXCEL_PARSING) return;
    
    if (!Array.isArray(data1) || data1.length === 0) {
      throw new Error('File 1 contains no valid data rows');
    }
    if (!Array.isArray(data2) || data2.length === 0) {
      throw new Error('File 2 contains no valid data rows');
    }
    
    if (typeof data1[0] !== 'object' || Array.isArray(data1[0])) {
      throw new Error('File 1 data format is not supported - expected object rows');
    }
    if (typeof data2[0] !== 'object' || Array.isArray(data2[0])) {
      throw new Error('File 2 data format is not supported - expected object rows');
    }
  };

  // MODULAR: Sheet selection handler
  const handleSheetSelect = (sheet1, sheet2) => {
    if (!FEATURES.SHEET_SELECTION) return;
    setSelectedSheet1(sheet1);
    setSelectedSheet2(sheet2);
  };

  const handleLoadFiles = async () => {
    console.log("🚀 handleLoadFiles started");
    console.log("📁 File 1:", file1?.name);
    console.log("📁 File 2:", file2?.name);
    console.log("🎯 File type:", fileType);
    
    if (!file1 || !file2) {
      setError('Please select two files.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        console.log("📊 Processing Excel-CSV combination");
        console.log("🔧 FLEXIBLE_CROSS_FORMAT feature:", FEATURES.FLEXIBLE_CROSS_FORMAT);
        
        if (FEATURES.FLEXIBLE_CROSS_FORMAT) {
          console.log("✅ Using flexible cross-format system");
          
          try {
            console.log("🔍 Starting file validation...");
            
            const validation = validateExcelCSVOrder(file1, file2);
            console.log("🔍 Validation result:", validation);
            
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            console.log("✅ File validation passed");
            
            console.log("📊 Parsing Excel file (File 1):", validation.excelFile.name);
            const excelResult = await parseExcelFile(validation.excelFile, selectedSheet1);
            data1 = safeExtractExcelData(excelResult);
            
            console.log("📊 Parsing CSV file (File 2):", validation.csvFile.name);
            data2 = await parseCSVFile(validation.csvFile);
            
            console.log("📊 Final data1 length:", data1?.length);
            console.log("📊 Final data2 length:", data2?.length);
            
          } catch (flexibleError) {
            console.warn("❌ Flexible cross-format failed:", flexibleError);
            console.log("🔄 Falling back to legacy approach");
            
            const legacyResult = await legacyExcelCSVParsing();
            data1 = legacyResult.data1;
            data2 = legacyResult.data2;
          }
        } else {
          console.log("🔄 Using legacy approach (feature disabled)");
          const legacyResult = await legacyExcelCSVParsing();
          data1 = legacyResult.data1;
          data2 = legacyResult.data2;
        }
        
      } else if (fileType === 'csv') {
        data1 = await parseCSVFile(file1);
        data2 = await parseCSVFile(file2);
        
      } else if (fileType === 'excel') {
        try {
          if (FEATURES.SHEET_SELECTION) {
            const [excelInfo1, excelInfo2] = await Promise.all([
              getExcelFileInfo(file1),
              getExcelFileInfo(file2)
            ]);
            setFile1Info(excelInfo1);
            setFile2Info(excelInfo2);
            
            if (excelInfo1.sheets.length > 1 || excelInfo2.sheets.length > 1) {
              setShowSheetSelector(true);
              setLoading(false);
              return;
            }
            
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1, excelInfo1.defaultSheet),
              parseExcelFile(file2, excelInfo2.defaultSheet)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          } else {
            const [result1, result2] = await Promise.all([
              parseExcelFile(file1),
              parseExcelFile(file2)
            ]);
            data1 = safeExtractExcelData(result1);
            data2 = safeExtractExcelData(result2);
          }
        } catch (excelError) {
          console.warn('Enhanced Excel parsing failed, using fallback:', excelError);
          const [result1, result2] = await Promise.all([
            parseExcelFile(file1),
            parseExcelFile(file2)
          ]);
          data1 = Array.isArray(result1) ? result1 : (result1.data || []);
          data2 = Array.isArray(result2) ? result2 : (result2.data || []);
        }
        
      } else if (fileType === 'json') {
        data1 = await parseJSONFile(file1);
        data2 = await parseJSONFile(file2);
      } else if (fileType === 'xml') {
        data1 = await parseXMLFile(file1);
        data2 = await parseXMLFile(file2);
      } else if (fileType === 'pdf') {
        data1 = await parsePDFFile(file1);
        data2 = await parsePDFFile(file2);
      } else if (fileType === 'text') {
        const result = await compareTextFiles_main(file1, file2);
        setResults(result);
        setLoading(false);
        return;
      } else {
        throw new Error('Unsupported file type.');
      }
      
      try {
        validateDataFormat(data1, data2);
      } catch (validationError) {
        console.warn('Data validation warning:', validationError.message);
      }
      
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      
    } catch (err) {
      console.error('File loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithSheets = async () => {
    if (!FEATURES.SHEET_SELECTION) return;
    
    if (!selectedSheet1 || (fileType === 'excel' && !selectedSheet2)) {
      setError('Please select sheets for both files.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let data1 = [], data2 = [];
      
      if (fileType === 'excel_csv') {
        const result1 = await parseExcelFile(file1, selectedSheet1);
        data1 = safeExtractExcelData(result1);
        data2 = await parseCSVFile(file2);
      } else if (fileType === 'excel') {
        const [result1, result2] = await Promise.all([
          parseExcelFile(file1, selectedSheet1),
          parseExcelFile(file2, selectedSheet2)
        ]);
        data1 = safeExtractExcelData(result1);
        data2 = safeExtractExcelData(result2);
      }
      
      const h1 = Object.keys(data1[0] || {});
      const h2 = Object.keys(data2[0] || {});
      const suggested = mapHeaders(h1, h2);
      
      setHeaders1(h1);
      setHeaders2(h2);
      setSuggestedMappings(suggested);
      setSampleData1(data1.slice(0, 10));
      setSampleData2(data2.slice(0, 10));
      setShowMapper(true);
      setShowSheetSelector(false);
      
    } catch (err) {
      console.error('Sheet processing error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingConfirmed = (mappings) => {
    setFinalMappings(mappings);
  };

  const handleDownloadExcel = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.xlsx`;
      downloadResultsAsExcel(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const timestamp = new Date().toISOString().slice(0,10);
      const filename = `comparison_results_${timestamp}.csv`;
      downloadResultsAsCSV(results, filename);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRunComparison = async () => {
    if (!file1 || !file2 || finalMappings.length === 0) {
      setError('Missing files or mappings.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      const options = {};
      if (FEATURES.SHEET_SELECTION) {
        options.sheet1 = selectedSheet1;
        options.sheet2 = selectedSheet2;
      }
      if (FEATURES.AUTO_DETECTION) {
        options.autoDetectAmounts = true;
      }
      
      if (fileType === 'excel_csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else if (fileType === 'excel') {
        result = await compareExcelFiles(file1, file2, finalMappings, options);
      } else if (fileType === 'json') {
        result = await compareJSONFiles(file1, file2, finalMappings);
      } else if (fileType === 'xml') {
        result = await compareXMLFiles(file1, file2, finalMappings);
      } else if (fileType === 'pdf') {
        result = await comparePDFFiles(file1, file2, finalMappings);
      } else if (fileType === 'text') {
        result = await compareTextFiles_main(file1, file2);
      } else if (fileType === 'csv') {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      } else {
        result = await compareExcelCSVFiles(file1, file2, finalMappings);
      }
      
      setResults(result);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // File type mapping for icons and labels
  const fileTypeConfig = {
    excel: { icon: '📊', label: 'Excel–Excel', description: 'Compare Excel workbooks' },
    excel_csv: { icon: '📈', label: 'Excel–CSV', description: 'Smart cross-format comparison', featured: true },
    csv: { icon: '📋', label: 'CSV–CSV', description: 'Compare CSV files' },
    pdf: { icon: '📄', label: 'PDF–PDF', description: 'Compare PDF documents', badge: 'v1' },
    text: { icon: '📝', label: 'TXT–TXT', description: 'Compare text files' },
    json: { icon: '⚙️', label: 'JSON–JSON', description: 'Compare JSON data' },
    xml: { icon: '📋', label: 'XML–XML', description: 'Compare XML data' },
    pdf_ocr: { icon: '📄', label: 'PDF–PDF', description: 'OCR checks coming', disabled: true }
  };

  const getFileTypeLabel = (type, position) => {
    const config = fileTypeConfig[type];
    if (!config) return 'File';
    const parts = config.label.split('–');
    return position === 1 ? parts[0] : parts[1];
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)'
    }}>
      <Head>
        <title>VeriDiff - File Comparison Tool</title>
        <meta name="description" content="Compare Excel, CSV, PDF, JSON, XML files with smart mapping and tolerance settings. Built for business professionals." />
      </Head>

      {/* Navigation */}
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/">
                <span style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #2563eb, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  cursor: 'pointer'
                }}>
                  VeriDiff
                </span>
              </Link>
            </div>
            <nav style={{ display: 'flex', gap: '32px' }}>
              <Link href="/about">
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#f97316',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📖 MUST READ - About
                </span>
              </Link>
              <span style={{
                color: '#2563eb',
                fontWeight: '500'
              }}>Compare Files</span>
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/">
                <button style={{
                  color: '#374151',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  ← Back to Landing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(to bottom right, #2563eb, #9333ea)',
          // pages/compare.js - Complete Premium Solution with Inline Styles

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { parseCSVFile } from '../utils/simpleCSVComparison';
import { parseExcelFile, compareExcelFiles, getExcelFileInfo } from '../utils/excelFileComparison';
import { parseJSONFile, compareJSONFiles } from '../utils/jsonFileComparison';
import { parseXMLFile, compareXMLFiles } from '../utils/xmlFileComparison';
import { parsePDFFile, comparePDFFiles } from '../utils/pdfFileComparison';
import { compareTextFiles_main } from '../utils/textFileComparison';
import { compareExcelCSVFiles } from '../utils/excelCSVComparison';
import { mapHeaders } from '../utils/mapHeaders';
import { downloadResultsAsExcel, downloadResultsAsCSV } from '../utils/downloadResults';

// FEATURE FLAGS - easily disable problematic features
const FEATURES = {
  SHEET_SELECTION: true,         // ENABLED: SheetSelector is ready to test
  AUTO_DETECTION: true,          // Auto-detection of amount fields
  AUTO_RERUN: true,             // Auto-rerun functionality
  ENHANCED_EXCEL_PARSING: true,  // Use enhanced Excel parsing with data extraction
  FLEXIBLE_CROSS_FORMAT: true   // NEW: Use flexible cross-format comparison
};

// Enhanced HeaderMapper Component (Inline)
const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm, onRun, sampleData1, sampleData2 }) => {
  const [mappings, setMappings] = useState([]);
  const [autoRerunEnabled, setAutoRerunEnabled] = useState(true);

  // Auto-detect amount fields based on name and sample data
  const isLikelyAmountField = (fieldName, sampleValues = []) => {
    const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill|salary|wage|revenue|profit|expense|budget/i;
    const hasNumericName = numericFieldNames.test(fieldName);
    
    const cleanNumericValues = sampleValues.filter(val => {
      if (!val && val !== 0) return false;
      const cleaned = String(val).replace(/[$,\s€£¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    });
    
    const percentNumeric = cleanNumericValues.length / Math.max(sampleValues.length, 1);
    return hasNumericName || percentNumeric > 0.7;
  };

  const getSampleValues = (fieldName, file2FieldName) => {
    const samples1 = sampleData1 ? sampleData1.slice(0, 10).map(row => row[fieldName]).filter(v => v != null) : [];
    const samples2 = sampleData2 ? sampleData2.slice(0, 10).map(row => row[file2FieldName]).filter(v => v != null) : [];
    return [...samples1, ...samples2];
  };

  useState(() => {
    const enriched = suggestedMappings.map(m => {
      const sampleValues = getSampleValues(m.file1Header, m.file2Header || m.file1Header);
      const isAutoDetectedAmount = isLikelyAmountField(m.file1Header, sampleValues);
      
      return {
        file1Header: m.file1Header,
        file2Header: m.file2Header || '',
        similarity: m.similarity,
        isAmountField: isAutoDetectedAmount,
        toleranceType: 'flat',
        toleranceValue: isAutoDetectedAmount ? '0.01' : '',
        isAutoDetected: isAutoDetectedAmount
      };
    });
    setMappings(enriched);
  }, [suggestedMappings]);

  useState(() => {
    if (autoRerunEnabled && mappings.length > 0) {
      const timer = setTimeout(() => {
        onConfirm(mappings);
        setTimeout(() => {
          onRun();
        }, 100);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mappings, autoRerunEnabled, onConfirm, onRun]);

  const updateMapping = (index, key, value) => {
    const updated = [...mappings];
    updated[index][key] = value;
    
    if (key === 'isAmountField') {
      updated[index].isAutoDetected = false;
    }
    
    if (key === 'isAmountField' && value && !updated[index].toleranceValue) {
      updated[index].toleranceValue = '0.01';
    }
    
    setMappings(updated);
  };

  const addMapping = () => {
    setMappings([
      ...mappings,
      { file1Header: '', file2Header: '', similarity: 0, isAmountField: false, toleranceType: 'flat', toleranceValue: '', isAutoDetected: false }
    ]);
  };

  const removeMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(mappings);
  };

  const handleManualRun = () => {
    setAutoRerunEnabled(false);
    onRun();
    setTimeout(() => setAutoRerunEnabled(true), 2000);
  };

  const autoDetectedCount = mappings.filter(m => m.isAutoDetected).length;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '32px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>🔗 Confirm Header Mappings</h2>
          <p style={{
            color: '#6b7280'
          }}>Review and adjust how your file columns are matched</p>
        </div>
        
        {autoDetectedCount > 0 && (
          <div style={{
            marginTop: '16px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'linear-gradient(to right, #dcfce7, #d1fae5)',
              color: '#166534',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #bbf7d0'
            }}>
              🤖 {autoDetectedCount} amount field{autoDetectedCount !== 1 ? 's' : ''} auto-detected
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        border: '1px solid #c7d2fe',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '32px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="checkbox"
              checked={autoRerunEnabled}
              onChange={(e) => setAutoRerunEnabled(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div style={{
              display: 'block',
              width: '56px',
              height: '32px',
              borderRadius: '9999px',
              transition: 'background-color 0.2s',
              backgroundColor: autoRerunEnabled ? '#2563eb' : '#d1d5db'
            }}>
              <div style={{
                position: 'absolute',
                left: '4px',
                top: '4px',
                backgroundColor: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                transition: 'transform 0.2s',
                transform: autoRerunEnabled ? 'translateX(24px)' : 'translateX(0)'
              }}></div>
            </div>
          </div>
          <div style={{ marginLeft: '16px' }}>
            <span style={{
              color: '#1e3a8a',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center'
            }}>
              ⚡ Auto-rerun comparison when settings change
            </span>
            {autoRerunEnabled && (
              <span style={{
                color: '#1d4ed8',
                fontSize: '14px'
              }}>Saves time by automatically running comparisons!</span>
            )}
          </div>
        </label>
      </div>

      <form onSubmit={handleConfirm}>
        <div style={{
          overflowX: 'auto',
          display: window.innerWidth >= 1024 ? 'block' : 'none'
        }}>
          <table style={{
            minWidth: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  File 1 Header
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  →
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  File 2 Header
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Amount Field?
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Tolerance
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Value
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb'
            }}>
              {mappings.map((m, i) => (
                <tr key={i} style={{
                  backgroundColor: m.isAutoDetected ? '#f0fdf4' : 'white',
                  borderLeft: m.isAutoDetected ? '4px solid #22c55e' : 'none'
                }}>
                  <td style={{ padding: '16px 24px' }}>
                    <select
                      value={m.file1Header}
                      onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        padding: '8px 12px'
                      }}
                    >
                      <option value="">-- Select Header --</option>
                      {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    →
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select
                      value={m.file2Header}
                      onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        padding: '8px 12px'
                      }}
                    >
                      <option value="">-- Select Header --</option>
                      {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={m.isAmountField}
                        onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                        style={{
                          height: '16px',
                          width: '16px',
                          color: '#2563eb',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                      {m.isAutoDetected && (
                        <span style={{
                          marginLeft: '8px',
                          color: '#22c55e'
                        }} title="Auto-detected as amount field">🤖</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select
                      value={m.toleranceType}
                      onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                      disabled={!m.isAmountField}
                      style={{
                        display: 'block',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        padding: '8px 12px',
                        backgroundColor: !m.isAmountField ? '#f9fafb' : 'white',
                        color: !m.isAmountField ? '#9ca3af' : '#111827'
                      }}
                    >
                      <option value="flat">Flat</option>
                      <option value="%">%</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <input
                      type="number"
                      value={m.toleranceValue}
                      onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                      step="any"
                      placeholder={m.isAmountField ? "0.01" : ""}
                      disabled={!m.isAmountField}
                      style={{
                        display: 'block',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        padding: '8px 12px',
                        backgroundColor: !m.isAmountField ? '#f9fafb' : 'white',
                        color: !m.isAmountField ? '#9ca3af' : '#111827'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => removeMapping(i)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '8px',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div style={{
          display: window.innerWidth < 1024 ? 'block' : 'none'
        }}>
          {mappings.map((m, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              backgroundColor: m.isAutoDetected ? '#f0fdf4' : 'white',
              borderColor: m.isAutoDetected ? '#bbf7d0' : '#e5e7eb'
            }}>
              {m.isAutoDetected && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  color: '#166534'
                }}>
                  🤖 <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>Auto-detected amount field</span>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>File 1 Header</label>
                  <select
                    value={m.file1Header}
                    onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      padding: '12px'
                    }}
                  >
                    <option value="">-- Select Header --</option>
                    {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ color: '#9ca3af' }}>→</span>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>File 2 Header</label>
                  <select
                    value={m.file2Header}
                    onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      padding: '12px'
                    }}
                  >
                    <option value="">-- Select Header --</option>
                    {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={m.isAmountField}
                    onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                    style={{
                      height: '16px',
                      width: '16px',
                      color: '#2563eb',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                  <label style={{ marginLeft: '8px', fontSize: '14px', color: '#374151' }}>Amount Field</label>
                </div>
                
                {m.isAmountField && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>Tolerance Type</label>
                      <select
                        value={m.toleranceType}
                        onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                        style={{
                          display: 'block',
                          width: '100%',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          padding: '12px'
                        }}
                      >
                        <option value="flat">Flat</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>Tolerance Value</label>
                      <input
                        type="number"
                        value={m.toleranceValue}
                        onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                        step="any"
                        placeholder="0.01"
                        style={{
                          display: 'block',
                          width: '100%',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          padding: '12px'
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => removeMapping(i)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '32px',
          justifyContent: 'center'
        }}>
          <button 
            type="button" 
            onClick={addMapping}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          >
            ➕ Add Mapping
          </button>
          
          <button 
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            ⚙️ Confirm Mapping
          </button>
          
          <button 
            type="button" 
            onClick={handleManualRun}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'linear-gradient(to right, #059669, #047857)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ▶️ Run Comparison
          </button>
        </div>

        {autoRerunEnabled && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              ⚠️ <span style={{
                marginLeft: '8px',
                fontSize: '14px',
                color: '#92400e'
              }}>
                Comparison will auto-run when you change settings. Disable auto-rerun above if you prefer manual control.
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Enhanced SheetSelector Component (Inline)
const SheetSelector = ({ file1Info, file2Info, onSheetSelect, fileType }) => {
  const [selectedSheet1, setSelectedSheet1] = useState('');
  const [selectedSheet2, setSelectedSheet2] = useState('');

  useState(() => {
    if (file1Info?.defaultSheet) {
      setSelectedSheet1(file1Info.defaultSheet);
    }
    if (file2Info?.defaultSheet) {
      setSelectedSheet2(file2Info.defaultSheet);
    }
  }, [file1Info, file2Info]);

  useState(() => {
    if (selectedSheet1 && selectedSheet2) {
      onSheetSelect(selectedSheet1, selectedSheet2);
    }
  }, [selectedSheet1, selectedSheet2, onSheetSelect]);

  if (fileType !== 'excel' && fileType !== 'excel_csv') {
    return null;
  }

  const showFile1Selector = file1Info?.sheets?.length > 1;
  const showFile2Selector = file2Info?.sheets?.length > 1 && fileType === 'excel';

  if (!showFile1Selector && !showFile2Selector) {
    return null;
  }

  const SheetCard = ({ fileInfo, selectedSheet, onSheetChange, title }) => {
    const selectedSheetInfo = fileInfo.sheets.find(s => s.name === selectedSheet);
    
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '8px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            marginRight: '12px',
            fontSize: '20px'
          }}>
            📊
          </div>
