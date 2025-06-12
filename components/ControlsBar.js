// /components/ControlsBar.js
import React from 'react';

const ControlsBar = ({
  viewMode,
  onViewModeChange,
  resultsFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  focusMode,
  onFocusModeToggle,
  fieldGrouping,
  onFieldGroupingToggle,
  ignoreWhitespace,
  onIgnoreWhitespaceToggle,
  showCharacterDiff,
  onCharacterDiffToggle,
  filteredResultsLength
}) => {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '25px',
      marginBottom: '30px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        alignItems: 'center'
      }} className="results-controls">
        
        {/* View Mode Toggle */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            👁️ View Mode
          </label>
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '10px',
            padding: '4px'
          }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onViewModeChange('unified');
              }}
              style={{
                background: viewMode === 'unified' ? '#2563eb' : 'transparent',
                color: viewMode === 'unified' ? 'white' : '#6b7280',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
            >
              📋 Unified
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onViewModeChange('side-by-side');
              }}
              style={{
                background: viewMode === 'side-by-side' ? '#2563eb' : 'transparent',
                color: viewMode === 'side-by-side' ? 'white' : '#6b7280',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
            >
              ⚖️ Side-by-Side
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📋 Filter Results
          </label>
          <select
            value={resultsFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '500',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">Show All Records</option>
            <option value="differences">Differences Only</option>
            <option value="matches">Matches Only</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            🔍 Search Records
          </label>
          <input
            type="text"
            placeholder="Search values, IDs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>

        {/* Advanced Options */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            ⚙️ Advanced Options
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}>
              <input
                type="checkbox"
                checked={focusMode}
                onChange={(e) => onFocusModeToggle(e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              Focus Mode (highlight changes only)
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}>
              <input
                type="checkbox"
                checked={fieldGrouping}
                onChange={(e) => onFieldGroupingToggle(e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              Group Similar Fields
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}>
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => onIgnoreWhitespaceToggle(e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              Ignore Whitespace
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#4b5563'
            }}>
              <input
                type="checkbox"
                checked={showCharacterDiff}
                onChange={(e) => onCharacterDiffToggle(e.target.checked)}
                style={{ accentColor: '#2563eb' }}
              />
              Character-Level Diff
            </label>
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
          {filteredResultsLength}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: '500' }}>
          Records Shown ({viewMode === 'side-by-side' ? 'Side-by-Side' : 'Unified'} View)
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
