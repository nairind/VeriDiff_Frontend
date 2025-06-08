// /components/SummaryCards.js
import React from 'react';

const SummaryCards = ({ results }) => {
  const matchRate = (((results.total_records - results.differences_found) / results.total_records) * 100).toFixed(1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '25px',
      marginBottom: '40px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        border: '2px solid #0ea5e9',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: '#0369a1',
          marginBottom: '8px'
        }}>
          {results.total_records}
        </div>
        <div style={{ 
          color: '#0369a1', 
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Total Records
        </div>
      </div>

      <div style={{
        background: results.differences_found > 0 
          ? 'linear-gradient(135deg, #fef2f2, #fee2e2)' 
          : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        border: results.differences_found > 0 
          ? '2px solid #ef4444' 
          : '2px solid #22c55e',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
          {results.differences_found > 0 ? '⚠️' : '✅'}
        </div>
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: results.differences_found > 0 ? '#dc2626' : '#16a34a',
          marginBottom: '8px'
        }}>
          {results.differences_found}
        </div>
        <div style={{ 
          color: results.differences_found > 0 ? '#dc2626' : '#16a34a', 
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Differences Found
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        border: '2px solid #22c55e',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✨</div>
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: '#16a34a',
          marginBottom: '8px'
        }}>
          {results.total_records - results.differences_found}
        </div>
        <div style={{ 
          color: '#16a34a', 
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Perfect Matches
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
        border: '2px solid #f59e0b',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: '#d97706',
          marginBottom: '8px'
        }}>
          {matchRate}%
        </div>
        <div style={{ 
          color: '#d97706', 
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Match Rate
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
