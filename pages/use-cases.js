import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function UseCases() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('veridiff_token');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('veridiff_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/api/auth/signin';
  };

  const handleSignUp = () => {
    window.location.href = '/api/auth/signup';
  };

  return (
    <>
      <Head>
        <title>Use Cases - Professional File Comparison Examples | VeriDiff</title>
        <meta name="description" content="Real-world use cases for VeriDiff file comparison: Excel financial reports, CSV data validation, document version control, and cross-format analysis for business professionals." />
        <meta name="keywords" content="excel comparison use cases, csv file comparison, financial report analysis, data validation, document comparison, spreadsheet comparison examples" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        color: '#1f2937',
        background: '#f8fafc'
      }}>
        <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />

        {/* Trust Banner */}
        <div style={{
          background: '#dcfce7',
          borderBottom: '1px solid #bbf7d0',
          padding: '0.75rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#166534',
              fontWeight: '500'
            }}>
              🔒 All file processing happens locally in your browser - your data never leaves your device
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          padding: '3rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              Real-World Use Cases
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.7',
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              See how professionals use VeriDiff to solve real business problems across different file formats and industries.
            </p>
          </div>
        </section>

        {/* Quick Navigation */}
        <section style={{
          padding: '2rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              Browse by File Type
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <a href="#excel-excel" style={{
                display: 'block',
                padding: '1rem',
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '0.75rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#1e40af',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                📊 Excel ↔ Excel
              </a>
              <a href="#excel-csv" style={{
                display: 'block',
                padding: '1rem',
                background: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '0.75rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#047857',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                🔄 Excel ↔ CSV
              </a>
              <a href="#csv-csv" style={{
                display: 'block',
                padding: '1rem',
                background: '#fefce8',
                border: '2px solid #f59e0b',
                borderRadius: '0.75rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#d97706',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                📝 CSV ↔ CSV
              </a>
              <a href="#document-comparison" style={{
                display: 'block',
                padding: '1rem',
                background: '#faf5ff',
                border: '2px solid #8b5cf6',
                borderRadius: '0.75rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#7c3aed',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                📄 Documents
              </a>
            </div>
          </div>
        </section>

        {/* Excel ↔ Excel Use Cases */}
        <section id="excel-excel" style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '1.1rem' }}>Excel ↔ Excel Comparison</span>
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Spreadsheet-to-Spreadsheet Analysis
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Perfect for comparing financial reports, budgets, data exports, and any Excel files with similar structures.
              </p>
            </div>

            {/* Use Case 1: Monthly Financial Reports */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>💼</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Monthly Financial Reports Comparison</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>Finance & Accounting Teams</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '1rem'
                  }}>❌ The Problem</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Finance teams waste 2-3 hours monthly comparing P&L reports, balance sheets, and budget variance reports. 
                    Manual comparison misses subtle changes that could indicate errors, fraud, or important trends. 
                    Different account numbering or naming between months causes alignment issues.
                  </p>

                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '1rem'
                  }}>✅ VeriDiff Solution</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    Smart header mapping automatically aligns account names even when they change slightly. 
                    Numerical tolerance settings catch meaningful variances while ignoring rounding differences. 
                    Side-by-side highlighting shows exactly what changed between months.
                  </p>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    marginBottom: '1rem'
                  }}>🔄 Step-by-Step Workflow</h4>
                  <ol style={{
                    fontSize: '0.95rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    paddingLeft: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <li>Upload current month P&L and previous month P&L</li>
                    <li>VeriDiff maps account names automatically</li>
                    <li>Set 0.01% tolerance for meaningful variance detection</li>
                    <li>Review highlighted differences in variance column</li>
                    <li>Export annotated report for audit trail</li>
                  </ol>

                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#047857',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      💰 <strong>Time Savings:</strong> 3 hours → 15 minutes<br/>
                      🔒 <strong>Privacy:</strong> SOX-compliant, no upload to servers<br/>
                      📊 <strong>Accuracy:</strong> Catches 100% of variances over threshold
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 2: Budget vs Actual Analysis */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>📈</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Budget vs Actual Variance Analysis</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>Corporate Planning & FP&A</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '1rem'
                  }}>❌ The Problem</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    FP&A teams need to compare budgeted vs actual spending across hundreds of cost centers. 
                    Budget categories don't always match GL account names exactly. Manual variance analysis 
                    takes hours and risks missing significant budget overruns that need immediate attention.
                  </p>

                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '1rem'
                  }}>✅ VeriDiff Solution</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    Fuzzy matching aligns similar account names between budget and actuals. 
                    Percentage-based tolerance highlights meaningful variances. Automatic variance 
                    calculation shows over/under spending with visual color coding.
                  </p>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    marginBottom: '1rem'
                  }}>🎯 Key Benefits</h4>
                  <ul style={{
                    fontSize: '0.95rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    paddingLeft: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <li>Instant variance percentage calculations</li>
                    <li>Visual highlighting of budget overruns</li>
                    <li>Export variance reports for executive dashboards</li>
                    <li>Historical comparison for trend analysis</li>
                  </ul>

                  <div style={{
                    background: '#eff6ff',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #dbeafe'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#1e40af',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      📊 <strong>Impact:</strong> Identify budget risks 90% faster<br/>
                      💼 <strong>Use Case:</strong> Monthly/quarterly budget reviews<br/>
                      🔍 <strong>Detail Level:</strong> Department, project, or GL account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 3: Inventory Reconciliation */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>📦</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Inventory Count Reconciliation</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>Operations & Supply Chain</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '1rem'
                  }}>❌ The Problem</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Physical inventory counts must be reconciled against system inventory records. 
                    SKU naming inconsistencies and manual counting errors create discrepancies. 
                    Warehouse teams spend days manually comparing thousands of items to identify variances.
                  </p>

                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '1rem'
                  }}>✅ VeriDiff Solution</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    SKU matching handles variations in product codes and descriptions. 
                    Quantity tolerance settings focus attention on significant variances. 
                    Automatic variance calculation shows count differences requiring investigation.
                  </p>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    marginBottom: '1rem'
                  }}>📋 Typical Workflow</h4>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>1. Upload:</strong> System inventory export + physical count spreadsheet</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>2. Map:</strong> SKU columns and quantity columns align automatically</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>3. Set:</strong> 5% tolerance to focus on significant variances</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>4. Review:</strong> Items requiring cycle count investigation</p>
                    <p style={{ margin: '0' }}><strong>5. Export:</strong> Adjustment journal entries for ERP system</p>
                  </div>

                  <div style={{
                    background: '#fefce8',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fde68a'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#d97706',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      ⚡ <strong>Speed:</strong> Process 10,000+ SKUs in minutes<br/>
                      🎯 <strong>Accuracy:</strong> Zero manual calculation errors<br/>
                      📊 <strong>Output:</strong> Exception reports and journal entries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Excel ↔ CSV Use Cases */}
        <section id="excel-csv" style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span>
                <span style={{ fontWeight: '700', color: '#047857', fontSize: '1.1rem' }}>Excel ↔ CSV Cross-Format</span>
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Cross-Format Comparison
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Essential for comparing Excel reports with system exports, validating data migrations, and integrating data from different sources.
              </p>
            </div>

            {/* Use Case 1: System Export Validation */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>🔍</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>System Export Validation</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>IT & Data Management</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '1rem'
                  }}>❌ The Problem</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    ERP systems export data as CSV files, but business users work with Excel reports. 
                    When discrepancies arise, teams need to compare the raw system export against 
                    the formatted Excel report to identify data transformation errors or missing records.
                  </p>

                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '1rem'
                  }}>✅ VeriDiff Solution</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    Cross-format comparison handles CSV and Excel natively. Column mapping manages 
                    different field names and orders. Data type detection ensures proper number 
                    and date comparisons between formats.
                  </p>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    marginBottom: '1rem'
                  }}>💡 Common Scenarios</h4>
                  <ul style={{
                    fontSize: '0.95rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    paddingLeft: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <li>Customer database CSV vs formatted contact Excel list</li>
                    <li>Sales data export vs Excel dashboard source</li>
                    <li>Payroll system CSV vs Excel benefits calculation</li>
                    <li>Inventory system export vs Excel reporting template</li>
                  </ul>

                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bbf7d0'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#047857',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      🎯 <strong>Benefit:</strong> Spot data integrity issues instantly<br/>
                      ⚡ <strong>Speed:</strong> Minutes vs hours of manual checking<br/>
                      🔧 <strong>Flexibility:</strong> Works with any CSV/Excel combination
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 2: Data Migration Verification */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>🚀</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Data Migration Verification</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>IT Projects & System Implementations</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1.5rem'
              }}>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    margin: '0 0 1rem 0'
                  }}>
                    <strong>Migration Challenge:</strong> When moving from legacy systems to new platforms, 
                    exported data needs verification. Source system exports CSV files, while the new system 
                    may use Excel templates for data import validation.
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{
                      background: '#fef2f2',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #fecaca'
                    }}>
                      <h5 style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#dc2626',
                        margin: '0 0 0.5rem 0'
                      }}>Without VeriDiff</h5>
                      <ul style={{
                        fontSize: '0.85rem',
                        color: '#7f1d1d',
                        margin: '0',
                        paddingLeft: '1rem'
                      }}>
                        <li>Manual spot-checking samples</li>
                        <li>Risk of migration errors</li>
                        <li>Days of validation work</li>
                        <li>Post-go-live data fixes</li>
                      </ul>
                    </div>
                    
                    <div style={{
                      background: '#f0fdf4',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <h5 style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#059669',
                        margin: '0 0 0.5rem 0'
                      }}>With VeriDiff</h5>
                      <ul style={{
                        fontSize: '0.85rem',
                        color: '#047857',
                        margin: '0',
                        paddingLeft: '1rem'
                      }}>
                        <li>100% record comparison</li>
                        <li>Field-by-field validation</li>
                        <li>Exception reports for fixes</li>
                        <li>Confident go-live decisions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CSV ↔ CSV Use Cases */}
        <section id="csv-csv" style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#fefce8',
                border: '2px solid #f59e0b',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <span style={{ fontWeight: '700', color: '#d97706', fontSize: '1.1rem' }}>CSV ↔ CSV Comparison</span>
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                Data-to-Data Analysis
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Perfect for comparing database exports, survey data, sales reports, and any structured data files.
              </p>
            </div>

            {/* Use Case 1: Survey Data Analysis */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>📊</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Survey Data Time-Series Analysis</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>Market Research & Analytics</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    marginBottom: '1rem'
                  }}>❌ The Problem</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    Research teams need to compare survey results across different time periods or 
                    demographic segments. Manual comparison of response data is time-consuming and 
                    prone to missing significant trends or changes in customer sentiment.
                  </p>

                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '1rem'
                  }}>✅ VeriDiff Solution</h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4b5563',
                    lineHeight: '1.6'
                  }}>
                    Automated respondent matching by ID or demographics. Statistical comparison 
                    of response patterns. Highlight changes in satisfaction scores, NPS ratings, 
                    or preference rankings between survey periods.
                  </p>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    marginBottom: '1rem'
                  }}>📈 Analysis Types</h4>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#4b5563',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Longitudinal:</strong> Same respondents over time</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Cross-Sectional:</strong> Different segments same period</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>A/B Testing:</strong> Control vs test group responses</p>
                    <p style={{ margin: '0' }}><strong>Trend Analysis:</strong> Quarterly or annual comparisons</p>
                  </div>

                  <div style={{
                    background: '#fefce8',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fde68a'
                  }}>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#d97706',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      📊 <strong>Insight Speed:</strong> Hours to minutes for trend identification<br/>
                      🎯 <strong>Accuracy:</strong> Statistical significance testing built-in<br/>
                      📱 <strong>Output:</strong> Executive summary of key changes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 2: Sales Performance Comparison */}
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ec4899, #be185d)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>💰</div>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>Territory Sales Performance Analysis</h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>Sales Operations & Management</p>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: '0 0 1rem 0'
                }}>
                  <strong>Scenario:</strong> Compare Q3 vs Q4 sales performance across regions, products, 
                  and sales reps to identify trends, top performers, and areas needing attention.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌍</div>
                    <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Territory Analysis</strong>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Regional performance gaps
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Rep Performance</strong>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Individual quota attainment
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦</div>
                    <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>Product Mix</strong>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Category growth/decline
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Document Comparison Use Cases */}
        <section id="document-comparison" style={{
          padding: '3rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#faf5ff',
                border: '2px solid #8b5cf6',
                borderRadius: '50px',
                padding: '0.75rem 1.5rem',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <span style={{ fontWeight: '700', color: '#7c3aed', fontSize: '1.1rem' }}>Document Comparison</span>
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#1f2937'
              }}>
                PDF & Word Document Analysis
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                Essential for legal document review, contract analysis, policy updates, and version control.
              </p>
            </div>

            {/* Document Use Cases Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '2rem'
            }}>
              {/* Contract Review */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>⚖️</div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0'
                    }}>Contract Version Control</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      margin: '0'
                    }}>Legal & Compliance</p>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.95rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  Compare contract versions to identify all changes, additions, and deletions. 
                  Essential for legal review, redline analysis, and compliance verification.
                </p>

                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#7c3aed',
                    margin: '0 0 0.5rem 0'
                  }}>Key Features:</h4>
                  <ul style={{
                    fontSize: '0.85rem',
                    color: '#4b5563',
                    margin: '0',
                    paddingLeft: '1rem',
                    lineHeight: '1.5'
                  }}>
                    <li>Paragraph-level change tracking</li>
                    <li>Formatting preservation</li>
                    <li>Legal terminology recognition</li>
                    <li>Side-by-side comparison view</li>
                  </ul>
                </div>
              </div>

              {/* Policy Updates */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>📋</div>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0'
                    }}>Policy & Procedure Updates</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      margin: '0'
                    }}>HR & Operations</p>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.95rem',
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  Track changes in employee handbooks, compliance policies, and operational procedures. 
                  Ensure all stakeholders understand what changed between versions.
                </p>

                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#1e40af',
                    margin: '0 0 0.5rem 0'
                  }}>Benefits:</h4>
                  <ul style={{
                    fontSize: '0.85rem',
                    color: '#4b5563',
                    margin: '0',
                    paddingLeft: '1rem',
                    lineHeight: '1.5'
                  }}>
                    <li>Change summary reports</li>
                    <li>Version audit trails</li>
                    <li>Stakeholder communication prep</li>
                    <li>Compliance documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security for All Use Cases */}
        <section style={{
          padding: '3rem 0',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1f2937'
            }}>
              Privacy & Security Across All Use Cases
            </h2>
            
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>🔒</div>
              </div>

              <p style={{
                fontSize: '1.2rem',
                color: '#6b7280',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                Every use case benefits from VeriDiff's <strong>browser-based processing architecture</strong>. 
                Whether you're comparing financial data, contracts, or survey results, your sensitive 
                information never leaves your device.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
              }}>
                <div style={{
                  background: '#f0fdf4',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#047857', marginBottom: '0.5rem' }}>
                    GDPR Compliant
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#047857', lineHeight: '1.5', margin: '0' }}>
                    No data transfer or storage
                  </p>
                </div>
                
                <div style={{
                  background: '#eff6ff',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #dbeafe'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                    Enterprise Ready
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.5', margin: '0' }}>
                    Passes corporate security reviews
                  </p>
                </div>
                
                <div style={{
                  background: '#fefce8',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #fde68a'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#d97706', marginBottom: '0.5rem' }}>
                    Fast & Efficient
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#d97706', lineHeight: '1.5', margin: '0' }}>
                    No upload delays or size limits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
