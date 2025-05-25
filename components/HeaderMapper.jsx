// File: components/HeaderMapper.jsx - Enhanced Version

import React, { useState, useEffect, useCallback } from 'react';

const HeaderMapper = ({ file1Headers, file2Headers, suggestedMappings, onConfirm, onRun, sampleData1, sampleData2 }) => {
  const [mappings, setMappings] = useState([]);
  const [autoRerunEnabled, setAutoRerunEnabled] = useState(true);

  // Auto-detect amount fields based on name and sample data
  const isLikelyAmountField = useCallback((fieldName, sampleValues = []) => {
    // Check field name patterns
    const numericFieldNames = /amount|price|cost|total|sum|value|balance|fee|qty|quantity|rate|charge|payment|invoice|bill|salary|wage|revenue|profit|expense|budget/i;
    const hasNumericName = numericFieldNames.test(fieldName);
    
    // Check if values look like numbers (even as text)
    const cleanNumericValues = sampleValues.filter(val => {
      if (!val && val !== 0) return false;
      // Clean common formatting
      const cleaned = String(val).replace(/[$,\s€£¥]/g, '');
      return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    });
    
    const percentNumeric = cleanNumericValues.length / Math.max(sampleValues.length, 1);
    
    // Auto-detect if field name suggests numbers OR >70% of values are numeric
    return hasNumericName || percentNumeric > 0.7;
  }, []);

  // Get sample values for a field from both datasets
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
        isAmountField: isAutoDetectedAmount, // Auto-detect instead of false
        toleranceType: 'flat',
        toleranceValue: isAutoDetectedAmount ? '0.01' : '', // Auto-set small tolerance
        isAutoDetected: isAutoDetectedAmount
      };
    });
    setMappings(enriched);
  }, [suggestedMappings, isLikelyAmountField, getSampleValues]);

  // Auto-rerun comparison when mappings change (with debounce)
  useEffect(() => {
    if (autoRerunEnabled && mappings.length > 0) {
      const timer = setTimeout(() => {
        onConfirm(mappings);
        // Auto-run comparison after confirming mappings
        setTimeout(() => {
          onRun();
        }, 100);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timer);
    }
  }, [mappings, autoRerunEnabled, onConfirm, onRun]);

  const updateMapping = (index, key, value) => {
    const updated = [...mappings];
    updated[index][key] = value;
    
    // If user manually changes amount field setting, remove auto-detected flag
    if (key === 'isAmountField') {
      updated[index].isAutoDetected = false;
    }
    
    // If enabling amount field without tolerance, set default
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
    setAutoRerunEnabled(false); // Disable auto-rerun temporarily
    onRun();
    setTimeout(() => setAutoRerunEnabled(true), 2000); // Re-enable after 2 seconds
  };

  const autoDetectedCount = mappings.filter(m => m.isAutoDetected).length;

  return (
    <div className="header-mapper">
      <div className="mapper-header">
        <h2>Confirm Header Mappings</h2>
        {autoDetectedCount > 0 && (
          <div className="auto-detect-info">
            <span className="auto-detect-badge">
              🤖 {autoDetectedCount} amount field{autoDetectedCount !== 1 ? 's' : ''} auto-detected
            </span>
          </div>
        )}
      </div>

      <div className="auto-rerun-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoRerunEnabled}
            onChange={(e) => setAutoRerunEnabled(e.target.checked)}
          />
          <span className="toggle-text">
            ⚡ Auto-rerun comparison when settings change
            {autoRerunEnabled && <small> (saves time!)</small>}
          </span>
        </label>
      </div>

      <form onSubmit={handleConfirm}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File 1 Header</th>
                <th>File 2 Header</th>
                <th>Amount Field?</th>
                <th>Tolerance Type</th>
                <th>Tolerance Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m, i) => (
                <tr key={i} className={m.isAutoDetected ? 'auto-detected-row' : ''}>
                  <td>
                    <select
                      value={m.file1Header}
                      onChange={(e) => updateMapping(i, 'file1Header', e.target.value)}
                    >
                      <option value="">-- None --</option>
                      {file1Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={m.file2Header}
                      onChange={(e) => updateMapping(i, 'file2Header', e.target.value)}
                    >
                      <option value="">-- None --</option>
                      {file2Headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="amount-field-cell">
                      <input
                        type="checkbox"
                        checked={m.isAmountField}
                        onChange={(e) => updateMapping(i, 'isAmountField', e.target.checked)}
                      />
                      {m.isAutoDetected && (
                        <span className="auto-detected-indicator" title="Auto-detected as amount field">
                          🤖
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={m.toleranceType}
                      onChange={(e) => updateMapping(i, 'toleranceType', e.target.value)}
                      disabled={!m.isAmountField}
                      className={!m.isAmountField ? 'disabled-input' : ''}
                    >
                      <option value="flat">Flat</option>
                      <option value="%">%</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.toleranceValue}
                      onChange={(e) => updateMapping(i, 'toleranceValue', e.target.value)}
                      step="any"
                      placeholder={m.isAmountField ? "0.01" : ""}
                      disabled={!m.isAmountField}
                      className={!m.isAmountField ? 'disabled-input' : ''}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeMapping(i)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-group">
          <button type="button" onClick={addMapping}>Add Mapping</button>
          <button type="submit">Confirm Mapping</button>
          <button type="button" onClick={handleManualRun} className="manual-run-btn">
            🔄 Run Comparison
          </button>
        </div>

        {autoRerunEnabled && (
          <div className="auto-rerun-note">
            <small>💡 Comparison will auto-run when you change settings. Disable auto-rerun above if you prefer manual control.</small>
          </div>
        )}
      </form>

      <style jsx>{`
        .header-mapper {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .mapper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mapper-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .auto-detect-info {
          display: flex;
          align-items: center;
        }

        .auto-detect-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
        }

        .auto-rerun-toggle {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.95em;
        }

        .toggle-text {
          color: #0369a1;
          font-weight: 500;
        }

        .toggle-text small {
          color: #0284c7;
          font-weight: normal;
        }

        .table-container {
          overflow-x: auto;
          margin: 20px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th, td {
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: left;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .auto-detected-row {
          background: #f0fdf4;
          border-left: 3px solid #22c55e;
        }

        .amount-field-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auto-detected-indicator {
          font-size: 0.9em;
          opacity: 0.8;
        }

        select, input[type="number"] {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .disabled-input {
          background: #f9fafb;
          color: #9ca3af;
          opacity: 0.7;
        }

        .button-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 500;
        }

        button:hover {
          background: #2563eb;
        }

        .manual-run-btn {
          background: #059669;
        }

        .manual-run-btn:hover {
          background: #047857;
        }

        .auto-rerun-note {
          margin-top: 15px;
          padding: 10px;
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 4px;
          color: #92400e;
        }

        @media (max-width: 768px) {
          .mapper-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default HeaderMapper;
