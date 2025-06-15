// /components/ExportSection.js
import React from 'react';
import { useSession } from 'next-auth/react';

const ExportSection = ({ onDownloadExcel, onDownloadCSV, onDownloadHTMLDiff }) => {
  const { data: session, status } = useSession();

  // If not authenticated, show message to sign in from header
  if (status === 'unauthenticated') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '20px',
        padding: '30px',
        marginTop: '40px',
        textAlign: 'center',
        border: '1px solid #cbd5e1'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '15px'
        }}>
          🔒 Export Your Results
        </h3>
        <p style={{
          color: '#6b7280',
          marginBottom: '20px',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          Sign in from the header above to download detailed comparison results with all analysis data and advanced formatting
        </p>
        
        <div style={{
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#374151' }}>Export Features Available:</strong><br/>
            Excel Report • CSV Data • HTML Diff Report • Summary statistics • Side-by-side comparison • Color-coded differences
          </div>
        </div>
      </div>
    );
  }

  // If loading auth, show loading
  if (status === 'loading') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        borderRadius: '20px',
        padding: '30px',
        marginTop: '40px',
        textAlign: 'center',
        border: '1px solid #cbd5e1'
      }}>
        <p>Loading export options...</p>
      </div>
    );
  }

  // Authenticated users see the full export section
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      borderRadius: '20px',
      padding: '30px',
      marginTop: '40px',
      textAlign: 'center',
      border: '1px solid #cbd5e1'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '15px'
      }}>
        📥 Export Your Results
      </h3>
      <p style={{
        color: '#6b7280',
        marginBottom: '25px',
        fontSize: '1rem'
      }}>
        Download detailed comparison results with all analysis data and advanced formatting
      </p>
      
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={onDownloadExcel}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            minWidth: '180px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          📊 Excel Report
        </button>
        
        <button
          type="button"
          onClick={onDownloadCSV}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            minWidth: '180px',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
          }}
        >
          📄 CSV Data
        </button>

        <button
          type="button"
          onClick={onDownloadHTMLDiff}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            minWidth: '180px',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
          }}
        >
          🌐 HTML Diff Report
        </button>
      </div>
      
      <div style={{
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#6b7280'
      }}>
        <strong>Enhanced Features:</strong> Summary statistics • Side-by-side comparison • Color-coded differences • Character-level highlighting • Professional formatting
      </div>
    </div>
  );
};

export default ExportSection;
