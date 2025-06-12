// /components/ExportSection.js
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const ExportSection = ({ onDownloadExcel, onDownloadCSV, onDownloadHTMLDiff }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If not authenticated, show auth prompt
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
          marginBottom: '25px',
          fontSize: '1rem'
        }}>
          Sign in to download detailed comparison results with all analysis data and advanced formatting
        </p>
        
        <button
          onClick={() => router.push('/auth/signin')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            minWidth: '180px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        >
          🚀 Sign In to Export
        </button>
        
        <div style={{
          marginTop: '20px',
          fontSize: '0.9rem',
          color: '#6b7280'
        }}>
          <strong>Export Features:</strong> Excel Report • CSV Data • HTML Diff Report • Summary statistics • Side-by-side comparison • Color-coded differences
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
