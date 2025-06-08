// /components/FeatureSection.js
import React from 'react';

const FeatureSection = () => {
  return (
    <section id="features" style={{
      padding: '4rem 0',
      background: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Enterprise-Grade Features
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
            Professional file comparison with advanced analysis capabilities
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🎯
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Smart Header Mapping
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Automatically matches similar column headers across files, even with different naming conventions.
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              ⚖️
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Tolerance Settings
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Set acceptable variance levels for financial data and amounts with flat or percentage tolerances.
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🔒
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Complete Privacy
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              All processing happens locally in your browser. Your sensitive data never leaves your device.
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🔄
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Cross-Format Support
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Compare Excel to Excel, CSV to CSV, or mixed Excel-CSV files with intelligent format handling.
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🤖
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              AI Auto-Detection
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Automatically identifies amount fields and applies smart tolerance settings for financial data.
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Advanced Analytics
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
              Detailed comparison results with filtering, search, character-level diff, and professional reporting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
