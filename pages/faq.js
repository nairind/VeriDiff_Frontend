import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function FAQ() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleHome = () => {
    router.push('/');
  };

  const scrollToSection = (sectionId) => {
    router.push(`/#${sectionId}`);
    setMobileMenuOpen(false);
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

          .desktop-nav {
            display: flex;
            gap: 2rem;
            align-items: center;
          }

          .mobile-nav-button {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            color: #374151;
          }

          .nav-button {
            background: none;
            border: none;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
            padding: 0.5rem;
            text-decoration: none;
          }

          .nav-button:hover {
            color: #2563eb;
          }

          .nav-link {
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            padding: 0.5rem;
          }

          .nav-link:hover {
            color: #2563eb;
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

          @media (max-width: 768px) {
            .desktop-nav { 
              display: none !important; 
            }
            .mobile-nav-button { 
              display: block !important; 
            }
            .toc-grid {
              grid-template-columns: 1fr;
            }
            .hero h1 {
              font-size: 2rem;
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
              
              <nav className="desktop-nav">
                <button onClick={() => scrollToSection('features')} className="nav-button">
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} className="nav-button">
                  Pricing
                </button>
                <Link href="/faq" className="nav-link">
                  FAQ
                </Link>
              </nav>

              <button 
                className="mobile-nav-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div style={{
                borderTop: '1px solid #e5e7eb',
                padding: '1rem 0',
                background: 'white'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={() => scrollToSection('features')} className="nav-button" style={{ textAlign: 'left' }}>
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="nav-button" style={{ textAlign: 'left' }}>
                    Pricing
                  </button>
                  <Link href="/faq" className="nav-link" style={{ textAlign: 'left' }}>
                    FAQ
                  </Link>
                </div>
              </div>
            )}
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
      </div>
    </>
  );
}
