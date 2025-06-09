// /components/HeaderMapper.js
import React, { useState, useEffect, useCallback, useRef } from 'react';

const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm, onRun, sampleData1, sampleData2, isProcessing }) => {
  const [mappings, setMappings] = useState([]);
  const [autoRerunEnabled, setAutoRerunEnabled] = useState(false); // Start disabled for stable UI
  const [hasInitialized, setHasInitialized] = useState(false);
  const lastAutoRunRef = useRef(0);

  // Auto-detect amount fields based on name and sample data
  const isLikelyAmountField = useCallback((fieldName, sampleValues = []) => {
    const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill|salary|wage|revenue|profit|expense|budget/i;
    const hasNumericName = numericFieldNames.test(fieldName);
    
    const cleanNumericValues = sampleValues.filter(val => {
      if (!val && val !== 0) return false;
      const cleaned = String(val).replace(/[$,\s€£¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    });
    
    const percentNumeric = cleanNumericValues.length / Math.max(sampleValues.length, 1);
    return hasNumericName || percentNumeric > 0.7;
  }, []);

  const getSampleValues = useCallback((fieldName, file2FieldName) => {
    const samples1 = sampleData1 ? sampleData1.slice(0, 10).map(row => row[fieldName]).filter(v => v != null) : [];
    const samples2 = sampleData2 ? sampleData2.slice(0, 10).map(row => row[file2FieldName]).filter(v => v != null) : [];
    return [...samples1, ...samples2];
  }, [sampleData1, sampleData2]);

  useEffect(() => {
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
    
    setTimeout(() => {
      setHasInitialized(true);
      console.log('🎯 HeaderMapper initialized with', enriched.length, 'mappings');
    }, 500);
  }, [suggestedMappings, isLikelyAmountField, getSampleValues]);

  useEffect(() => {
    if (!hasInitialized || isProcessing || !autoRerunEnabled || mappings.length === 0) {
      return;
    }

    const now = Date.now();
    if (now - lastAutoRunRef.current < 2000) {
      console.log('🚫 Auto-run skipped - too soon after last run');
      return;
    }

    console.log('⚡ Auto-rerun triggered by mapping change');
    
    const timer = setTimeout(() => {
      console.log('🚀 Executing auto-rerun...');
      lastAutoRunRef.current = Date.now();
      
      onConfirm(mappings);
      setTimeout(() => {
        if (!isProcessing) {
          onRun(mappings);  // 🔧 FIXED: Now passing mappings
        }
      }, 100);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [mappings, autoRerunEnabled, onConfirm, onRun, hasInitialized, isProcessing]);

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
    if (isProcessing) {
      console.log('🚫 Manual run blocked - already processing');
      return;
    }
    
    console.log('🔄 Manual run triggered');
    setAutoRerunEnabled(false);
    lastAutoRunRef.current = Date.now();
    onRun(mappings);  // 🔧 FIXED: Now passing mappings
    
    setTimeout(() => {
      setAutoRerunEnabled(true);
      console.log('✅ Auto-rerun re-enabled');
    }, 3000);
  };

  const autoDetectedCount = mappings.filter(m => m.isAutoDetected).length;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      margin: '30px 0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          margin: '0',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem',
          fontWeight: '700'
        }}>
          Confirm Header Mappings
        </h2>
        
        {autoDetectedCount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
          }}>
            🤖 {autoDetectedCount} amount field{autoDetectedCount !== 1 ? 's' : ''} auto-detected
          </div>
        )}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)',
        border: '2px solid #2563eb',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '25px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          color: '#1f2937'
        }}>
          <input
            type="checkbox"
            checked={autoRerunEnabled}
            onChange={(e) => setAutoRerunEnabled(e.target.checked)}
            disabled={isProcessing}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#2563eb'
            }}
          />
          <span>
            ⚡ Auto-rerun comparison when settings change
            {autoRerunEnabled && !isProcessing && <small style={{ color: '#6b7280', marginLeft: '8px' }}>(saves time!)</small>}
            {isProcessing && <small style={{ color: '#f59e0b', marginLeft: '8px' }}>(processing...)</small>}
          </span>
        </label>
      </div>

      <form onSubmit={handleConfirm}>
        <div style={{
          overflowX: 'auto',
          margin: '25px 0',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px',
            background: 'white'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
              }}>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>File 1 Header</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>File 2 Header</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>Amount Field?</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>Tolerance Type</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>Tolerance Value</th>
                <th style={{
                  border: '1px solid #e5e7eb',
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontSize: '0.95rem'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m, i) => (
                <tr key={i} style={{
                  background: m.isAutoDetected ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : 'white',
                  borderLeft: m.isAutoDetected ? '4px solid #22c55e' : 'none'
                }}>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <select
                      value={m.file1Header}
                      onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: 'white',
                        color: '#374151',
                        opacity: isProcessing ? 0.7 : 1
                      }}
                    >
                      <option value="">-- None --</option>
                      {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <select
                      value={m.file2Header}
                      onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: 'white',
                        color: '#374151',
                        opacity: isProcessing ? 0.7 : 1
                      }}
                    >
                      <option value="">-- None --</option>
                      {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <input
                        type="checkbox"
                        checked={m.isAmountField}
                        onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                        disabled={isProcessing}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#2563eb',
                          opacity: isProcessing ? 0.7 : 1
                        }}
                      />
                      {m.isAutoDetected && (
                        <span style={{
                          fontSize: '0.9rem',
                          opacity: '0.8'
                        }} title="Auto-detected as amount field">
                          🤖
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <select
                      value={m.toleranceType}
                      onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                      disabled={!m.isAmountField || isProcessing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: m.isAmountField && !isProcessing ? 'white' : '#f9fafb',
                        color: m.isAmountField && !isProcessing ? '#374151' : '#9ca3af',
                        opacity: (m.isAmountField && !isProcessing) ? 1 : 0.7
                      }}
                    >
                      <option value="flat">Flat</option>
                      <option value="%">%</option>
                    </select>
                  </td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <input
                      type="number"
                      value={m.toleranceValue}
                      onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                      step="any"
                      placeholder={m.isAmountField ? "0.01" : ""}
                      disabled={!m.isAmountField || isProcessing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: m.isAmountField && !isProcessing ? 'white' : '#f9fafb',
                        color: m.isAmountField && !isProcessing ? '#374151' : '#9ca3af',
                        opacity: (m.isAmountField && !isProcessing) ? 1 : 0.7
                      }}
                    />
                  </td>
                  <td style={{
                    border: '1px solid #e5e7eb',
                    padding: '12px'
                  }}>
                    <button 
                      type="button" 
                      onClick={() => removeMapping(i)}
                      disabled={isProcessing}
                      style={{
                        background: isProcessing ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        opacity: isProcessing ? 0.7 : 1
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            type="button" 
            onClick={addMapping}
            disabled={isProcessing}
            style={{
              background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            Add Mapping
          </button>
          
          <button 
            type="submit"
            disabled={isProcessing}
            style={{
              background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            Confirm Mapping
          </button>
          
          <button 
            type="button" 
            onClick={handleManualRun}
            disabled={isProcessing}
            style={{
              background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing ? '⏳ Processing...' : '🔄 Run Comparison'}
          </button>
        </div>

        {autoRerunEnabled && !isProcessing && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            💡 Comparison will auto-run when you change settings. Disable auto-rerun above if you prefer manual control.
          </div>
        )}
      </form>
    </div>
  );
};

export default HeaderMapper;
