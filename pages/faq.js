import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function FAQ() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleHome = () => {
    router.push('/');
  };

  const faqSections = [
    {
      id: 'general',
      title: 'General Questions',
      questions: [
        {
          q: 'What is VeriDiff and how does it work?',
          a: 'VeriDiff is a browser-based file comparison tool that allows you to compare different types of files (Excel, CSV, PDF, JSON, XML, TXT) with intelligent field mapping and tolerance settings. All processing happens in your browser for complete privacy.'
        },
        {
          q: 'Do I need to install anything to use VeriDiff?',
          a: 'No installation required! VeriDiff runs entirely in your web browser. Simply navigate to the application and start comparing files immediately.'
        },
        {
          q: 'Is VeriDiff free to use?',
          a: 'VeriDiff offers a free Starter tier with 5 comparisons per month. For unlimited comparisons and advanced features, check our pricing page for Professional (£19/month) and Business (£79/month) plans.'
        },
        {
          q: 'Can I use VeriDiff offline?',
          a: 'VeriDiff requires an internet connection for the initial loading of the application. Once loaded, file processing happens locally in your browser, but you\'ll need to stay connected to the web application.'
        },
        {
          q: 'What browsers work best with VeriDiff?',
          a: 'Recommended: Chrome (best performance), Firefox, Safari, Edge. Minimum versions: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+. Not supported: Internet Explorer.'
        }
      ]
    },
    {
      id: 'formats',
      title: 'File Format Support',
      questions: [
        {
          q: 'What file formats can VeriDiff compare?',
          a: 'Supported formats: Excel (.xlsx, .xls, .xlsm), CSV (.csv), PDF (.pdf) - text-based only, JSON (.json), XML (.xml), Text (.txt). Cross-format combinations: Excel ↔ CSV (featured). More combinations planned for future releases.'
        },
        {
          q: 'Can VeriDiff handle Excel files with multiple sheets?',
          a: 'Yes! VeriDiff automatically detects all worksheets in Excel files and lets you: Select specific sheets to compare, Preview headers and row counts for each sheet, Handle hidden sheets appropriately, Compare different sheets from the same workbook.'
        },
        {
          q: 'Does VeriDiff work with password-protected files?',
          a: 'No, VeriDiff cannot process password-protected or encrypted files. You\'ll need to remove password protection before uploading.'
        },
        {
          q: 'What about scanned PDFs or image-based documents?',
          a: 'Currently, VeriDiff only works with text-based PDFs where text can be extracted. Scanned PDFs (images) require OCR processing, which is planned for future releases.'
        },
        {
          q: 'Can I compare files in different languages or character encodings?',
          a: 'VeriDiff handles UTF-8 encoded files well, which covers most international characters. If you\'re having issues with special characters, try saving your files with UTF-8 encoding.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      questions: [
        {
          q: 'Is my data safe? Where are my files stored?',
          a: 'Your files are completely private and secure: No server upload (Files never leave your device), Browser-only processing (All comparison logic runs locally), No data storage (No information is saved on external servers), Session-only (Data is cleared when you close the browser tab).'
        },
        {
          q: 'Can VeriDiff see or access my file contents?',
          a: 'No, VeriDiff processes files entirely within your browser. The developers and servers cannot see your file contents, comparison results, or any data you process.'
        },
        {
          q: 'Is VeriDiff compliant with data protection regulations?',
          a: 'Yes, VeriDiff\'s client-side processing model supports compliance with: GDPR (No personal data processing on servers), HIPAA (Suitable for healthcare data with proper organizational controls), SOX (Maintains audit trail integrity), Industry standards (Meets most corporate security requirements).'
        },
        {
          q: 'What happens to my data when I close the browser?',
          a: 'All data is immediately cleared from memory when you: Close the browser tab, Navigate away from VeriDiff, Refresh the page, Close your browser.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      questions: [
        {
          q: 'Why is my file upload failing?',
          a: 'Common causes and solutions: File too large (Keep files under 10MB for best performance), Corrupted file (Try opening the file in its native application first), Wrong format (Ensure file extension matches actual file type), Browser memory (Close other tabs and try again), Network issues (Check your internet connection).'
        },
        {
          q: 'The comparison is taking too long or browser is freezing',
          a: 'Optimization steps: Reduce file size (Remove unnecessary rows/columns), Close other browser tabs (Free up memory), Use Chrome (Generally provides best performance), Limit field mappings (Only map fields you need to compare), Split large files (Process in smaller chunks).'
        },
        {
          q: 'I\'m getting "File Order Error" for Excel-CSV comparison',
          a: 'This happens when files are uploaded in the wrong order: File 1 must be Excel (.xlsx, .xls, .xlsm), File 2 must be CSV (.csv), Clear both files and re-upload in the correct order.'
        },
        {
          q: 'VeriDiff isn\'t detecting field mappings automatically',
          a: 'Possible reasons: Field names are too different between files, Files have inconsistent header formats, Data quality issues in source files. Solutions: Use manual mapping by clicking "Add Mapping", Standardize header names in source files if possible, Focus on mapping only the most important fields.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Feature-Specific Questions',
      questions: [
        {
          q: 'How does the auto-detection of amount fields work?',
          a: 'VeriDiff uses two methods to identify amount fields: 1. Field name analysis (Looks for keywords like "amount", "price", "cost", "total", "sum", "value"), 2. Data content analysis (Examines actual values to confirm >70% are numeric). Fields are marked with a 🤖 robot icon when auto-detected.'
        },
        {
          q: 'What\'s the difference between flat and percentage tolerances?',
          a: 'Flat tolerance: Fixed amount difference (e.g., ±$0.01) - Best for: Invoice matching, payment reconciliation - Example: $100.00 vs $100.01 = acceptable with ±$0.01 tolerance. Percentage tolerance: Relative difference (e.g., ±2%) - Best for: Budget analysis, variance reporting - Example: $1,000 vs $1,020 = acceptable with ±2% tolerance.'
        },
        {
          q: 'Can I save my mapping settings for reuse?',
          a: 'Currently, VeriDiff doesn\'t save mapping settings between sessions. However, you can: Document successful mapping patterns for manual reuse, Use consistent file naming and structure to improve auto-mapping, Export results to keep a record of settings used.'
        },
        {
          q: 'What does the auto-rerun feature do?',
          a: 'Auto-rerun automatically processes your comparison whenever you change mapping or tolerance settings, with a 1-second delay to prevent excessive processing. You can disable this feature if you prefer manual control.'
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance & Limitations',
      questions: [
        {
          q: 'What\'s the maximum file size VeriDiff can handle?',
          a: 'Recommended limit: 10MB per file for optimal performance. Technical limit: Depends on your browser\'s memory capacity. Large file tips: Remove unnecessary columns/rows, Split very large datasets into smaller chunks, Use CSV format for faster processing of large datasets.'
        },
        {
          q: 'How many rows can VeriDiff compare?',
          a: 'There\'s no hard limit, but performance considerations: Up to 10,000 rows (Excellent performance), 10,000-50,000 rows (Good performance with optimization), 50,000+ rows (May require file splitting or optimization).'
        },
        {
          q: 'Why is Excel processing slower than CSV?',
          a: 'Excel files require more processing because: Multiple possible sheets need to be analyzed, Formatting and formulas must be parsed, Data types need to be normalized, Cell references and complex structures require processing. CSV files are plain text and process much faster.'
        },
        {
          q: 'Can I compare more than two files at once?',
          a: 'Currently, VeriDiff compares two files at a time. For multiple file comparisons: Compare files in pairs, Use consistent methodology across comparisons, Export results and combine in Excel for analysis.'
        }
      ]
    },
    {
      id: 'business',
      title: 'Business Use Cases',
      questions: [
        {
          q: 'How can I use VeriDiff for invoice reconciliation?',
          a: 'Perfect for invoice reconciliation: 1. Upload vendor invoice (Excel/PDF) as File 1, 2. Upload payment system export (CSV) as File 2, 3. Set ±$0.01 flat tolerance for amounts, 4. Map invoice numbers, amounts, dates between files, 5. Export results showing matched vs. disputed items.'
        },
        {
          q: 'Can VeriDiff help with audit processes?',
          a: 'Excellent for audit support: Data validation (Compare source data with reports), Compliance checking (Verify regulatory report accuracy), Exception identification (Highlight discrepancies for investigation), Documentation (Professional export format suitable for auditors).'
        },
        {
          q: 'How does VeriDiff help with system migrations?',
          a: 'System migration validation: Compare data before/after migration, Validate that all records transferred correctly, Identify any data transformation issues, Provide documented proof of migration accuracy.'
        },
        {
          q: 'Can I use VeriDiff for budget vs. actual analysis?',
          a: 'Budget analysis workflow: 1. Upload budget file (Excel) and actual results (CSV/Excel), 2. Use percentage tolerances (e.g., ±5% acceptable variance), 3. Map budget categories to actual expense categories, 4. Export variance report for management review.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      questions: [
        {
          q: 'My results show too many differences - what should I check?',
          a: 'Investigation steps: 1. Verify field mappings (Ensure correct fields are mapped together), 2. Check tolerances (May need to increase tolerance values), 3. Data quality (Source files may have genuine formatting differences), 4. Sample verification (Manually check a few results to confirm accuracy).'
        },
        {
          q: 'Everything shows as "Match" but I expected differences',
          a: 'Possible issues: 1. Incorrect mapping (Same field mapped to itself), 2. Empty files (One file may be empty or improperly formatted), 3. Wrong sheet selection (Comparing wrong Excel worksheet), 4. Data conversion (Files may have been automatically converted).'
        },
        {
          q: 'The mapping interface looks wrong on my mobile device',
          a: 'Mobile limitations: Complex mapping interfaces work better on desktop/laptop screens, Touch interfaces may have limited functionality. Recommendation: Use tablet (minimum) or desktop for optimal experience.'
        },
        {
          q: 'I can\'t find a specific feature mentioned in the documentation',
          a: 'VeriDiff uses feature flags for controlled rollout of new functionality. Some features may: Be in beta testing with limited availability, Require specific browser capabilities, Be temporarily disabled for stability reasons.'
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - VeriDiff Smart File Comparison Tool</title>
        <meta name="description" content="Frequently asked questions about VeriDiff file comparison tool. Get answers about features, privacy, troubleshooting, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .header {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 64px;
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            cursor: pointer;
          }

          .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }

          .nav-links a {
            text-decoration: none;
            color: #374151;
            font-weight: 500;
          }

          .nav-links a:hover {
            color: #2563eb;
          }

          .btn-primary {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
            text-decoration: none;
          }

          .btn-primary:hover {
            background: #1d4ed8;
          }

          .hero {
            background: linear-gradient(135deg, #eff6ff, #f3e8ff);
            padding: 4rem 0 2rem 0;
            text-align: center;
          }

          .hero h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1f2937;
          }

          .hero p {
            font-size: 1.125rem;
            color: #6b7280;
            max-width: 600px;
            margin: 0 auto;
          }

          .content {
            background: white;
            padding: 3rem 0;
          }

          .toc {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 3rem;
          }

          .toc h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1f2937;
          }

          .toc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.5rem;
          }

          .toc-item {
            color: #2563eb;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
          }

          .toc-item:hover {
            background: #eff6ff;
          }

          .faq-section {
            margin-bottom: 2rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            overflow: hidden;
          }

          .section-header {
            background: #f8fafc;
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
          }

          .section-header:hover {
            background: #f1f5f9;
          }

          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
          }

          .chevron {
            font-size: 1.5rem;
            color: #6b7280;
            transition: transform 0.2s;
          }

          .chevron.open {
            transform: rotate(180deg);
          }

          .section-content {
            display: none;
            padding: 0;
          }

          .section-content.open {
            display: block;
          }

          .question {
            border-bottom: 1px solid #f3f4f6;
          }

          .question:last-child {
            border-bottom: none;
          }

          .question-header {
            padding: 1rem 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
          }

          .question-header:hover {
            background: #f9fafb;
          }

          .question-title {
            font-weight: 500;
            color: #1f2937;
            flex: 1;
            text-align: left;
          }

          .question-content {
            display: none;
            padding: 0 1.5rem 1.5rem 1.5rem;
            color: #4b5563;
            background: #f9fafb;
          }

          .question-content.open {
            display: block;
          }

          .quick-ref {
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: white;
            padding: 3rem 0;
            margin-top: 3rem;
          }

          .quick-ref h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-align: center;
          }

          .ref-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }

          .ref-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            padding: 1.5rem;
          }

          .ref-card h3 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #bfdbfe;
          }

          .ref-card ul {
            list-style: none;
          }

          .ref-card li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .footer {
            background: #111827;
            color: white;
            padding: 2rem 0;
            text-align: center;
          }

          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2rem;
            }

            .nav-links {
              display: none;
            }

            .toc-grid {
              grid-template-columns: 1fr;
            }

            .ref-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh' }}>
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="nav-container">
              <div className="logo" onClick={handleHome}>
                VeriDiff
              </div>
              <nav className="nav-links">
                <a href="/#features">Features</a>
                <a href="/#pricing">Pricing</a>
                <a href="/faq">FAQ</a>
                <a href="/" className="btn-primary">Try Free Demo</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="container">
            <h1>Frequently Asked Questions</h1>
            <p>Everything you need to know about VeriDiff file comparison tool</p>
          </div>
        </section>

        {/* Content */}
        <section className="content">
          <div className="container">
            {/* Table of Contents */}
            <div className="toc">
              <h2>Quick Navigation</h2>
              <div className="toc-grid">
                {faqSections.map((section) => (
                  <div 
                    key={section.id}
                    className="toc-item"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {section.title}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Sections */}
            {faqSections.map((section) => (
              <div key={section.id} id={section.id} className="faq-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <h2 className="section-title">{section.title}</h2>
                  <span className={`chevron ${openSections[section.id] ? 'open' : ''}`}>⌄</span>
                </div>
                <div className={`section-content ${openSections[section.id] ? 'open' : ''}`}>
                  {section.questions.map((item, index) => (
                    <div key={index} className="question">
                      <div 
                        className="question-header"
                        onClick={() => toggleSection(`${section.id}-${index}`)}
                      >
                        <h3 className="question-title">{item.q}</h3>
                        <span className={`chevron ${openSections[`${section.id}-${index}`] ? 'open' : ''}`}>⌄</span>
                      </div>
                      <div className={`question-content ${openSections[`${section.id}-${index}`] ? 'open' : ''}`}>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="quick-ref">
          <div className="container">
            <h2>Quick Reference</h2>
            <div className="ref-grid">
              <div className="ref-card">
                <h3>File Size Recommendations</h3>
                <ul>
                  <li>• Optimal: Under 5MB per file</li>
                  <li>• Good: 5-10MB per file</li>
                  <li>• Possible: 10MB+ (may be slow)</li>
                </ul>
              </div>
              <div className="ref-card">
                <h3>Browser Performance</h3>
                <ul>
                  <li>• Chrome: Best overall performance</li>
                  <li>• Firefox: Excellent compatibility</li>
                  <li>• Safari: Good on macOS/iOS</li>
                  <li>• Edge: Full feature support</li>
                </ul>
              </div>
              <div className="ref-card">
                <h3>Common Tolerance Settings</h3>
                <ul>
                  <li>• Invoices: ±$0.01 to ±$0.05 flat</li>
                  <li>• Budget analysis: ±1% to ±5% percentage</li>
                  <li>• Inventory: ±1 to ±5 units flat</li>
                  <li>• Financial reports: ±0.1% to ±2%</li>
                </ul>
              </div>
              <div className="ref-card">
                <h3>Processing Speed Order</h3>
                <ul>
                  <li>• CSV-CSV: Fastest processing</li>
                  <li>• Excel-CSV: Good performance</li>
                  <li>• Excel-Excel: Moderate speed</li>
                  <li>• PDF-PDF: Slower (text extraction)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 VeriDiff. All rights reserved. Precision-engineered in London for global professionals.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
