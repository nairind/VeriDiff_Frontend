// /components/PricingSection.js
import React from 'react';

const PricingSection = ({ file1, file2, onCompare }) => {
  return (
    <section id="pricing" style={{
      padding: '4rem 0',
      background: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '3rem' }}>
          Professional file comparison tools, completely free
        </p>

        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#10b981',
            marginBottom: '1rem'
          }}>
            FREE
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '2rem'
          }}>
            Complete File Comparison Suite
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <div style={{ color: '#374151' }}>
              ✅ Excel ↔ Excel comparison<br/>
              ✅ CSV ↔ CSV comparison<br/>
              ✅ Excel ↔ CSV cross-format
            </div>
            <div style={{ color: '#374151' }}>
              ✅ Smart header mapping<br/>
              ✅ Tolerance settings<br/>
              ✅ AI auto-detection
            </div>
            <div style={{ color: '#374151' }}>
              ✅ Advanced analytics<br/>
              ✅ Multiple export formats<br/>
              ✅ Complete privacy protection
            </div>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '0.5rem'
            }}>
              🎉 Launch Special - Everything Free
            </div>
            <div style={{ color: '#15803d', fontSize: '0.95rem' }}>
              No usage limits • No feature restrictions • No credit card required
            </div>
          </div>

          <button
            type="button"
            onClick={onCompare}
            disabled={!file1 || !file2}
            style={{
              background: (!file1 || !file2) 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '1rem 3rem',
              borderRadius: '0.75rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: (!file1 || !file2) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {!file1 || !file2 ? 'Upload Files Above to Start' : '🚀 Start Comparing Now'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
