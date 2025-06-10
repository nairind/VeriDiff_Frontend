// Updated excel-csv-results.js section with Early Authentication Gate
import { useSession } from 'next-auth/react';

// Add this to your existing renderTabularResults function:

const renderTabularResults = () => {
  const { data: session } = useSession();

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

  // Enhanced Login CTA Component (same as ExportSection)
  const LoginCTA = () => (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '25px',
      textAlign: 'center',
      margin: '30px 0'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#92400e',
        margin: '0 0 10px 0'
      }}>
        Sign Up to See Detailed Results & Download Reports
      </h3>
      <p style={{
        color: '#92400e',
        fontSize: '1rem',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Get comprehensive Excel reports with full record breakdowns, field-by-field analysis, and professional formatting
      </p>

      {/* Mini Excel Report Preview - Same as ExportSection */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        margin: '15px 0 20px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
        maxWidth: '550px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {/* Mini Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          📊 VeriDiff Comparison Report
        </div>
        
        {/* Mini Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '12px'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: '600', color: '#2563eb' }}>15</div>
            <div style={{ color: '#6b7280' }}>Records</div>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: '600', color: '#dc2626' }}>2</div>
            <div style={{ color: '#6b7280' }}>Differences</div>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: '600', color: '#16a34a' }}>13</div>
            <div style={{ color: '#6b7280' }}>Matches</div>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: '600', color: '#f59e0b' }}>86.7%</div>
            <div style={{ color: '#6b7280' }}>Match Rate</div>
          </div>
        </div>

        {/* Mini Side-by-Side Data Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          fontSize: '0.6rem'
        }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '6px',
            background: '#fafafa'
          }}>
            <div style={{
              background: '#6366f1',
              color: 'white',
              padding: '2px 4px',
              borderRadius: '2px',
              marginBottom: '4px',
              fontWeight: '600',
              fontSize: '0.55rem',
              textAlign: 'center'
            }}>
              📊 File 1 (Excel)
            </div>
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '3px',
              padding: '3px',
              marginBottom: '2px',
              fontSize: '0.55rem'
            }}>
              <div style={{ fontWeight: '600' }}>Joe Bloggs 1</div>
              <div style={{ color: '#6b7280' }}>ID: 230 | London</div>
            </div>
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #d97706', 
              borderRadius: '3px',
              padding: '3px',
              fontSize: '0.55rem'
            }}>
              <div style={{ fontWeight: '600' }}>Joe Bloggs 2</div>
              <div style={{ color: '#6b7280' }}>Cost: -1237 → Δ 2.00</div>
              <div style={{ 
                background: '#fed7aa', 
                color: '#92400e',
                padding: '1px 3px',
                borderRadius: '2px',
                display: 'inline-block',
                fontSize: '0.5rem',
                fontWeight: '600'
              }}>
                Modified
              </div>
            </div>
          </div>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '6px',
            background: '#fafafa'
          }}>
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '2px 4px',
              borderRadius: '2px',
              marginBottom: '4px',
              fontWeight: '600',
              fontSize: '0.55rem',
              textAlign: 'center'
            }}>
              📊 File 2 (Excel)
            </div>
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '3px',
              padding: '3px',
              marginBottom: '2px',
              fontSize: '0.55rem'
            }}>
              <div style={{ fontWeight: '600' }}>Joe Bloggs 1</div>
              <div style={{ color: '#6b7280' }}>ID: 230 | London</div>
            </div>
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #d97706', 
              borderRadius: '3px',
              padding: '3px',
              fontSize: '0.55rem'
            }}>
              <div style={{ fontWeight: '600' }}>Joe Bloggs 2</div>
              <div style={{ color: '#6b7280' }}>Cost: -1235 → Δ 2.00</div>
              <div style={{ 
                background: '#fed7aa', 
                color: '#92400e',
                padding: '1px 3px',
                borderRadius: '2px',
                display: 'inline-block',
                fontSize: '0.5rem',
                fontWeight: '600'
              }}>
                Modified
              </div>
            </div>
          </div>
        </div>

        {/* Mini Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '8px',
          fontSize: '0.55rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '2px'
            }}></div>
            <span style={{ color: '#6b7280' }}>Perfect Match</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              background: '#fef3c7',
              border: '1px solid #d97706',
              borderRadius: '2px'
            }}></div>
            <span style={{ color: '#6b7280' }}>Modified</span>
          </div>
        </div>
      </div>

      <p style={{
        color: '#92400e',
        fontSize: '0.9rem',
        marginBottom: '15px',
        fontStyle: 'italic'
      }}>
        ↑ See full record breakdowns, export to Excel/CSV/HTML
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/auth/signup'}
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
          📝 Sign Up Free
        </button>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          style={{
            background: 'white',
            color: '#2563eb',
            border: '2px solid #2563eb',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔑 Sign In
        </button>
      </div>
    </div>
  );

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

      {/* File Type Badge - ALWAYS SHOW */}
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

      {/* Summary Section - ALWAYS SHOW (Free Preview) */}
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
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
            {tabularResults.differences_found}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Differences Found
          </div>
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
            Matches Found
          </div>
        </div>

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

      {/* AUTHENTICATION GATE - Show if not authenticated */}
      {!session && <LoginCTA />}

      {/* DETAILED RESULTS - Only show if authenticated */}
      {session && (
        <>
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

          {/* Results Preview - Full details for authenticated users */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#1f2937'
            }}>
              🔍 Detailed Results
            </h3>
            
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '15px',
                background: '#f1f5f9',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '0.9rem',
                color: '#374151'
              }}>
                Showing all {tabularResults.results.length} records with detailed field analysis
              </div>
              
              {tabularResults.results.slice(0, 10).map((record, index) => (
                <div key={index} style={{
                  padding: '12px 15px',
                  borderBottom: index < 9 ? '1px solid #f1f5f9' : 'none',
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
                    {Object.entries(record.fields).map(([field, data]) => (
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
