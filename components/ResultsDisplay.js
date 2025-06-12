import React from 'react';
import { getRecordStatus, getStatusConfig } from '../utils/statusUtils';
import { getCharacterDiff, renderCharacterDiff } from '../utils/characterDiff';
import { groupFields } from '../utils/filterUtils';

const ResultsDisplay = ({ 
  filteredResults, 
  viewMode, 
  file1, 
  file2, 
  focusMode, 
  fieldGrouping, 
  expandedGroups, 
  toggleGroupExpansion, 
  ignoreWhitespace, 
  showCharacterDiff, 
  sortField, 
  sortDirection, 
  setSortField, 
  setSortDirection, 
  preserveScroll, 
  results 
}) => {
  
  if (filteredResults.length === 0) {
    return (
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '60px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' }}>
          No Records Match Your Filter
        </h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
          Try adjusting your search terms or filter settings
        </p>
        <button
          type="button"
          onClick={() => {
            preserveScroll();
            // These would need to be passed as props or handled differently
          }}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  if (viewMode === 'side-by-side') {
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }} className="side-by-side-grid">
        {/* Table Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 1fr',
            gap: '20px',
            alignItems: 'center',
            fontWeight: '700',
            color: '#1f2937',
            fontSize: '1rem'
          }} className="side-by-side-row">
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'center', color: '#2563eb' }} className="file-column">
              📄 File 1 ({file1?.name || 'Original'})
            </div>
            <div style={{ textAlign: 'center', color: '#16a34a' }} className="file-column">
              📄 File 2 ({file2?.name || 'Comparison'})
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredResults.map((row, rowIndex) => {
            const status = getRecordStatus(row);
            const config = getStatusConfig(status);
            
            if (focusMode && status === 'match') {
              return null;
            }
            
            return (
              <div key={rowIndex} style={{
                borderBottom: '1px solid #f3f4f6',
                borderLeft: `4px solid ${config.border}`,
                background: config.bg,
                opacity: focusMode && status === 'match' ? 0.4 : 1
              }} className="focus-mode-row">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 1fr',
                  gap: '20px',
                  padding: '20px',
                  minHeight: '120px',
                  alignItems: 'center'
                }} className="side-by-side-row">
                  {/* Status Column */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{config.icon}</div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: config.color,
                      background: 'white',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: `2px solid ${config.border}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} className="status-badge">
                      {config.label}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#6b7280',
                      marginTop: '4px'
                    }}>
                      Record {row.ID}
                    </div>
                  </div>

                  {/* File 1 Column */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '15px',
                    minHeight: '80px'
                  }} className="file-column">
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px'
                    }} className="field-group-grid">
                      {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                        const isChanged = fieldData.status === 'difference';
                        const diffResult = getCharacterDiff(String(fieldData.val1), String(fieldData.val2), ignoreWhitespace);
                        
                        return (
                          <div key={fieldName} style={{
                            background: isChanged ? '#fee2e2' : '#f9fafb',
                            padding: '10px',
                            borderRadius: '8px',
                            border: isChanged ? '2px solid #fca5a5' : '1px solid #e5e7eb'
                          }} className="field-value">
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '4px',
                              fontWeight: '600'
                            }}>
                              {fieldName}
                            </div>
                            <div style={{
                              fontWeight: '500',
                              color: isChanged ? '#dc2626' : '#1f2937',
                              fontSize: '0.9rem'
                            }}>
                              {showCharacterDiff && isChanged ? 
                                renderCharacterDiff(diffResult, showCharacterDiff) : 
                                fieldData.val1
                              }
                            </div>
                            {fieldData.difference && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#ef4444',
                                marginTop: '4px',
                                fontWeight: '600'
                              }}>
                                Δ {fieldData.difference}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* File 2 Column */}
                  <div style={{
                    background: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '15px',
                    minHeight: '80px'
                  }} className="file-column">
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '10px'
                    }} className="field-group-grid">
                      {Object.entries(row.fields).map(([fieldName, fieldData]) => {
                        const isChanged = fieldData.status === 'difference';
                        
                        return (
                          <div key={fieldName} style={{
                            background: isChanged ? '#d1fae5' : '#f9fafb',
                            padding: '10px',
                            borderRadius: '8px',
                            border: isChanged ? '2px solid #86efac' : '1px solid #e5e7eb'
                          }} className="field-value">
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '4px',
                              fontWeight: '600'
                            }}>
                              {fieldName}
                            </div>
                            <div style={{
                              fontWeight: isChanged ? '600' : '500',
                              color: isChanged ? '#16a34a' : '#1f2937',
                              fontSize: '0.9rem'
                            }}>
                              {fieldData.val2}
                            </div>
                            {fieldData.difference && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#16a34a',
                                marginTop: '4px',
                                fontWeight: '600'
                              }}>
                                Δ {fieldData.difference}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Professional Unified Table View
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    }} className="unified-table">
      {/* Table Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        padding: '20px',
        borderBottom: '2px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          minWidth: fieldGrouping ? '800px' : `${Math.max(800, Object.keys(results.results[0].fields).length * 120)}px`,
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '1rem',
                borderRight: '1px solid #e5e7eb',
                minWidth: '100px'
              }}>
                Record ID
              </th>
              {fieldGrouping && Object.keys(results.results[0].fields).length >= 8 ? (
                // Grouped Headers
                groupFields(Object.keys(results.results[0].fields)).map((group) => (
                  <th key={group.name} style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#1f2937',
                    fontSize: '1rem',
                    borderRight: '1px solid #e5e7eb',
                    background: group.isDefault ? 'transparent' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    cursor: group.isDefault ? 'default' : 'pointer',
                    minWidth: `${Math.max(120, group.fields.length * 80)}px`
                  }}
                  onClick={(e) => {
                    if (!group.isDefault) {
                      e.preventDefault();
                      preserveScroll();
                      toggleGroupExpansion(group.name);
                    }
                  }}
                  className="field-group"
                  >
                    {group.isDefault ? (
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                        gap: '8px'
                      }} className="field-group-grid">
                        {group.fields.map(field => (
                          <div key={field} style={{ 
                            fontSize: '0.9rem',
                            padding: '4px'
                          }}>
                            {field}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>{group.name}</span>
                        <span style={{ fontSize: '0.8rem', opacity: '0.7' }}>
                          ({group.fields.length} fields)
                        </span>
                        <span style={{ fontSize: '0.8rem' }}>
                          {expandedGroups.has(group.name) ? '▼' : '▶'}
                        </span>
                      </div>
                    )}
                  </th>
                ))
              ) : (
                // Individual Field Headers
                Object.keys(results.results[0].fields).map((field, idx) => (
                  <th key={idx} style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: '700',
                    color: '#1f2937',
                    fontSize: '1rem',
                    borderRight: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    preserveScroll();
                    if (sortField === field) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field);
                      setSortDirection('asc');
                    }
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      {field}
                      {sortField === field && (
                        <span style={{ fontSize: '0.8rem' }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))
              )}
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '1rem',
                minWidth: '80px'
              }}>
                Status
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Table Body */}
      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        overflowX: 'auto'
      }}>
        <table style={{
          width: '100%',
          minWidth: fieldGrouping ? '800px' : `${Math.max(800, Object.keys(results.results[0].fields).length * 120)}px`,
          borderCollapse: 'collapse'
        }}>
          <tbody>
            {filteredResults.map((row, rowIndex) => {
              const hasAnyDifference = Object.values(row.fields).some(field => field.status === 'difference');
              const isHighlighted = focusMode ? hasAnyDifference : true;
              
              if (focusMode && !hasAnyDifference) {
                return null;
              }
              
              return (
                <tr key={rowIndex} style={{
                  background: hasAnyDifference 
                    ? 'linear-gradient(135deg, #fef2f2, #fefefe)' 
                    : (rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'),
                  borderLeft: hasAnyDifference ? '4px solid #ef4444' : '4px solid transparent',
                  opacity: focusMode && !hasAnyDifference ? 0.4 : 1,
                  transition: 'all 0.2s ease'
                }} className="focus-mode-row">
                  {/* Record ID */}
                  <td style={{
                    padding: '16px',
                    borderRight: '1px solid #e5e7eb',
                    borderBottom: '1px solid #f3f4f6',
                    fontWeight: '600',
                    color: '#1f2937',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}>
                    {row.ID}
                  </td>

                  {/* Field Values */}
                  {fieldGrouping && Object.keys(results.results[0].fields).length >= 8 ? (
                    // Grouped Field Display
                    groupFields(Object.keys(row.fields)).map((group) => (
                      <td key={group.name} style={{
                        padding: '12px',
                        borderRight: '1px solid #e5e7eb',
                        borderBottom: '1px solid #f3f4f6',
                        verticalAlign: 'top'
                      }}>
                        {group.isDefault || expandedGroups.has(group.name) ? (
                          // Show individual fields
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '8px'
                          }} className="field-group-grid">
                            {group.fields.map(fieldName => {
                              const fieldData = row.fields[fieldName];
                              const isMatch = fieldData.val1 === fieldData.val2;
                              const isDifference = fieldData.status === 'difference';
                              
                              return (
                                <div key={fieldName} style={{
                                  background: isDifference ? '#fee2e2' : (isMatch ? '#f9fafb' : '#fef3c7'),
                                  border: `1px solid ${isDifference ? '#fca5a5' : (isMatch ? '#e5e7eb' : '#fcd34d')}`,
                                  borderRadius: '6px',
                                  padding: '8px',
                                  fontSize: '0.9rem'
                                }} className="field-value">
                                  <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginBottom: '4px',
                                    fontWeight: '500'
                                  }}>
                                    {fieldName}
                                  </div>
                                  {isMatch ? (
                                    <div style={{
                                      color: '#374151',
                                      fontWeight: '500'
                                    }}>
                                      {fieldData.val1}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '0.85rem' }}>
                                      <div style={{
                                        color: '#dc2626',
                                        textDecoration: 'line-through',
                                        opacity: 0.7
                                      }}>
                                        {fieldData.val1}
                                      </div>
                                      <div style={{
                                        color: '#16a34a',
                                        fontWeight: '600',
                                        marginTop: '2px'
                                      }}>
                                        {fieldData.val2}
                                      </div>
                                      {fieldData.difference && (
                                        <div style={{
                                          fontSize: '0.7rem',
                                          color: '#f59e0b',
                                          marginTop: '2px',
                                          fontWeight: '600'
                                        }}>
                                          Δ {fieldData.difference}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Show group summary
                          <div style={{
                            textAlign: 'center',
                            padding: '12px',
                            color: '#6b7280',
                            fontSize: '0.9rem'
                          }}>
                            <div style={{ marginBottom: '4px', fontWeight: '600' }}>
                              {group.fields.filter(f => row.fields[f].status === 'difference').length} differences
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                preserveScroll();
                                toggleGroupExpansion(group.name);
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#374151'
                              }}
                            >
                              Show Details
                            </button>
                          </div>
                        )}
                      </td>
                    ))
                  ) : (
                    // Individual Field Display
                    Object.entries(row.fields).map(([fieldName, fieldData], idx) => {
                      const isMatch = fieldData.val1 === fieldData.val2;
                      const isDifference = fieldData.status === 'difference';
                      
                      return (
                        <td key={idx} style={{
                          padding: '12px 16px',
                          borderRight: '1px solid #e5e7eb',
                          borderBottom: '1px solid #f3f4f6',
                          fontSize: '0.95rem',
                          textAlign: 'center',
                          background: isDifference ? '#fef2f2' : 'transparent'
                        }} className="field-value">
                          {isMatch ? (
                            <div style={{
                              color: '#374151',
                              fontWeight: '500'
                            }}>
                              {fieldData.val1}
                            </div>
                          ) : (
                            <div>
                              <div style={{
                                color: '#dc2626',
                                fontSize: '0.85rem',
                                textDecoration: 'line-through',
                                opacity: 0.7,
                                marginBottom: '2px'
                              }}>
                                {fieldData.val1}
                              </div>
                              <div style={{
                                color: '#16a34a',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                {fieldData.val2}
                              </div>
                              {fieldData.difference && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#f59e0b',
                                  marginTop: '4px',
                                  fontWeight: '600'
                                }}>
                                  Δ {fieldData.difference}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })
                  )}

                  {/* Status */}
                  <td style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: hasAnyDifference ? '#fef2f2' : '#f0fdf4',
                      color: hasAnyDifference ? '#dc2626' : '#16a34a',
                      border: `1px solid ${hasAnyDifference ? '#fca5a5' : '#bbf7d0'}`
                    }} className="status-badge">
                      {hasAnyDifference ? '❌' : '✅'}
                      <span style={{ marginLeft: '2px' }}>
                        {hasAnyDifference ? 'Diff' : 'Match'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDisplay;
