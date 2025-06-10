// /components/ExportSection.js - With Authentication Gate
import React from 'react';
import { useSession } from 'next-auth/react';

const ExportSection = ({ onDownloadExcel, onDownloadCSV, onDownloadHTMLDiff }) => {
  const { data: session, status } = useSession();

  // Enhanced Login CTA Component with Excel Report Preview
  const LoginCTA = () => (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '25px',
      textAlign: 'center',
      margin: '20px 0'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#92400e',
        margin: '0 0 10px 0'
      }}>
        Sign in to Download Professional Reports
      </h3>
      <p style={{
        color: '#92400e',
        fontSize: '0.95rem',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Get comprehensive Excel, CSV, and HTML diff reports with detailed data analysis
      </p>

      {/* Mini Excel Report Preview */}
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
        {/* Mini Header - Purple gradient like Excel report */}
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
        
        {/* Mini Stats Grid - 4 cards like Excel report */}
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
        fontSize: '0.85rem',
        marginBottom: '15px',
        fontStyle: 'italic'
      }}>
        ↑ Preview of your professional Excel/CSV downloads
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.location.href = '/auth/signup'}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
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
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.95rem',
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

      {/* Show Login CTA if not authenticated */}
      {!session && <LoginCTA />}
      
      {/* Show download buttons only if authenticated */}
      {session ? (
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
      ) : (
        /* Show Sign In button when not authenticated */
        <button
          onClick={() => window.location.href = '/auth/signin'}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            minWidth: '200px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
          }}
        >
          🔒 Sign In to Download Reports
        </button>
      )}
      
      <div style={{
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#6b7280'
      }}>
        <strong>Enhanced Features:</strong> Summary statistics • Side-by-side comparison • Color-coded differences • Delta calculations • Professional formatting
      </div>
    </div>
  );
};

export default ExportSection;
