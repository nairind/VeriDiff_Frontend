// pages/faq.js
import Head from 'next/head';
import Link from 'next/link';

export default function FAQ() {
  return (
    <div className="faq-page">
      <Head>
        <title>VeriDiff FAQ - Beta Support & Help</title>
        <meta name="description" content="Frequently asked questions and help for VeriDiff beta testers. Get support for file comparison, troubleshooting, and beta testing guidance." />
      </Head>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <Link href="/">
            <span className="logo">VeriDiff</span>
          </Link>
          <div className="nav-links">
            <Link href="/about">
              <span className="nav-link">📖 About</span>
            </Link>
            <Link href="/training">
              <span className="nav-link">🎓 Training</span>
            </Link>
            <Link href="/faq">
              <span style={{ 
                color: '#f59e0b', 
                cursor: 'pointer', 
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                ❓ <strong>FAQ & Help</strong>
              </span>
            </Link>
            <Link href="/"><span className="nav-link">Compare Files</span></Link>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Header */}
        <div className="header-section">
          <h1>❓ Frequently Asked Questions</h1>
          <p>Get help with VeriDiff and beta testing guidance</p>
          
          <div className="beta-notice">
            <strong>🧪 Beta Version:</strong> This FAQ focuses on current functionality. Features may evolve based on your feedback!
          </div>
        </div>

        {/* Beta Testing FAQ */}
        <section className="faq-section">
          <h2>🚀 Beta Testing FAQ</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I report bugs or issues?</h3>
              <p>Please email us at [your-email@domain.com] with:</p>
              <ul>
                <li>Description of what happened</li>
                <li>What you were trying to do</li>
                <li>Screenshots if possible</li>
                <li>Browser type and file sizes</li>
              </ul>
            </div>
            
            <div className="faq-item">
              <h3>What should I focus on testing?</h3>
              <p>Excel-CSV comparisons, field mapping, tolerance settings, and export functionality. These are our core features that need the most feedback.</p>
            </div>
            
            <div className="faq-item">
              <h3>What file sizes should I test with?</h3>
              <p>Start with small files (under 1MB) to learn the interface, then try medium files (1-5MB). If you have larger files, please test them and let us know how performance is!</p>
            </div>
            
            <div className="faq-item">
              <h3>Which browsers should I test?</h3>
              <p>Primarily Chrome or Firefox for best performance. If you regularly use Safari or Edge, please test with those too and report any differences you notice.</p>
            </div>
            
            <div className="faq-item">
              <h3>What if something doesn't work as expected?</h3>
              <p>That's exactly what we want to know! Take a screenshot if possible and describe what you were trying to do. No issue is too small to report.</p>
            </div>
            
            <div className="faq-item">
              <h3>How long is the beta testing period?</h3>
              <p>We expect the beta period to last 2-4 weeks. We'll keep you updated on timeline and when we're ready for full launch.</p>
            </div>
            
            <div className="faq-item">
              <h3>Can I share VeriDiff with others during beta?</h3>
              <p>Please check with us first! We'd love to know who else might benefit, but we want to manage the beta group size carefully.</p>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="faq-section">
          <h2>🚀 Quick Start for Beta Testers</h2>
          
          <div className="quick-start-grid">
            <div className="quick-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Start Simple</h4>
                <p>Try Excel-CSV comparison first - it's our most featured capability</p>
              </div>
            </div>
            
            <div className="quick-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Test Auto-Detection</h4>
                <p>Upload files and see how well the field mapping works automatically</p>
              </div>
            </div>
            
            <div className="quick-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Try Tolerances</h4>
                <p>Set small tolerance values for amount fields (±$0.01 or ±1%)</p>
              </div>
            </div>
            
            <div className="quick-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Export Results</h4>
                <p>Download both Excel and CSV formats to test export quality</p>
              </div>
            </div>
            
            <div className="quick-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4>Give Feedback</h4>
                <p>What worked well? What was confusing? All feedback is valuable!</p>
              </div>
            </div>
          </div>
        </section>

        {/* General Usage FAQ */}
        <section className="faq-section">
          <h2>💡 General Usage Questions</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What file formats does VeriDiff support?</h3>
              <p>Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf), JSON (.json), XML (.xml), and Text (.txt) files. Our specialty is Excel-CSV cross-format comparison.</p>
            </div>
            
            <div className="faq-item">
              <h3>Is my data safe and private?</h3>
              <p>Absolutely! All file processing happens in your browser. Your files never leave your device or get uploaded to any server. Complete privacy guaranteed.</p>
            </div>
            
            <div className="faq-item">
              <h3>Why does file order matter for Excel-CSV?</h3>
              <p>For best results, upload Excel file first, then CSV file. This ensures optimal field mapping and data consistency in the comparison process.</p>
            </div>
            
            <div className="faq-item">
              <h3>What are tolerance settings?</h3>
              <p>Tolerances let you define acceptable differences for numerical fields. For example, ±$0.01 for currency or ±2% for budget comparisons. Perfect for real-world data variations.</p>
            </div>
            
            <div className="faq-item">
              <h3>What does the 🤖 robot icon mean?</h3>
              <p>The robot icon shows fields that VeriDiff automatically detected as amount/currency fields. These get automatic tolerance settings applied.</p>
            </div>
            
            <div className="faq-item">
              <h3>Can I compare files with different column names?</h3>
              <p>Yes! VeriDiff's smart mapping can match similar fields even if they have different names. You can also manually map any fields that don't match automatically.</p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="faq-section">
          <h2>🔧 Troubleshooting</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3>File upload is failing or slow</h3>
              <div className="troubleshoot-steps">
                <p><strong>Try these steps:</strong></p>
                <ul>
                  <li>Keep files under 10MB for best performance</li>
                  <li>Close other browser tabs to free up memory</li>
                  <li>Try refreshing the page and uploading again</li>
                  <li>Use Chrome or Firefox for best compatibility</li>
                </ul>
              </div>
            </div>
            
            <div className="faq-item">
              <h3>Getting "File Order Error" for Excel-CSV</h3>
              <div className="troubleshoot-steps">
                <p><strong>Solution:</strong></p>
                <ul>
                  <li>Make sure File 1 is Excel (.xlsx, .xls, .xlsm)</li>
                  <li>Make sure File 2 is CSV (.csv)</li>
                  <li>Clear both files and re-upload in correct order</li>
                </ul>
              </div>
            </div>
            
            <div className="faq-item">
              <h3>No field mappings are showing up</h3>
              <div className="troubleshoot-steps">
                <p><strong>This usually means:</strong></p>
                <ul>
                  <li>Field names are very different between files</li>
                  <li>Files may have formatting issues</li>
                  <li>Use "Add Mapping" to create manual mappings</li>
                  <li>Focus on your most important fields first</li>
                </ul>
              </div>
            </div>
            
            <div className="faq-item">
              <h3>Comparison is showing too many differences</h3>
              <div className="troubleshoot-steps">
                <p><strong>Check these items:</strong></p>
                <ul>
                  <li>Increase tolerance values for amount fields</li>
                  <li>Verify field mappings are correct</li>
                  <li>Data may have genuine differences (this is normal!)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Known Beta Issues */}
        <section className="faq-section beta-issues">
          <h2>⚠️ Known Beta Issues</h2>
          
          <div className="issues-grid">
            <div className="issue-item">
              <h4>🐌 Large File Performance</h4>
              <p>Files over 5MB may process slowly. This is expected in beta and will be optimized for launch.</p>
            </div>
            
            <div className="issue-item">
              <h4>📱 Mobile Experience</h4>
              <p>Best experience is on desktop/laptop. Mobile works but some features may be harder to use with touch interface.</p>
            </div>
            
            <div className="issue-item">
              <h4>🔄 Auto-rerun Feature</h4>
              <p>Sometimes auto-rerun triggers too frequently. You can disable it using the toggle if it becomes annoying.</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2>📞 Still Need Help?</h2>
          <p>Can't find the answer you're looking for? We're here to help!</p>
          
          <div className="contact-options">
            <div className="contact-method">
              <h4>📧 Email Support</h4>
              <p>Send us your questions at: <strong>[sales@veridiff.com]</strong></p>
            </div>
            
            <div className="contact-method">
              <h4>🐛 Bug Reports</h4>
              <p>Found a bug? Include screenshots and describe what you were trying to do.</p>
            </div>
            
            <div className="contact-method">
              <h4>💡 Feature Requests</h4>
              <p>Have ideas for improvement? We'd love to hear them during beta!</p>
            </div>
          </div>
          
          <div className="beta-thanks">
            <p><strong>Thank you for being a beta tester!</strong> Your feedback is invaluable in making VeriDiff the best file comparison tool possible.</p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .faq-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .navigation {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
          cursor: pointer;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: #6b7280;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .header-section {
          text-align: center;
          margin-bottom: 60px;
        }

        .header-section h1 {
          font-size: 3rem;
          color: #1f2937;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .header-section p {
          font-size: 1.2rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .beta-notice {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          color: #92400e;
          font-weight: 600;
          max-width: 600px;
          margin: 0 auto;
        }

        .faq-section {
          background: white;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .faq-section h2 {
          color: #1f2937;
          font-size: 2rem;
          margin-bottom: 30px;
          text-align: center;
          border-bottom: 3px solid #f59e0b;
          padding-bottom: 10px;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .faq-item {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .faq-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .faq-item h3 {
          color: #1f2937;
          font-size: 1.2rem;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .faq-item p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .faq-item ul {
          color: #6b7280;
          padding-left: 20px;
          line-height: 1.6;
        }

        .faq-item li {
          margin: 5px 0;
        }

        .quick-start-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .quick-step {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 25px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .step-number {
          background: #0ea5e9;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          font-size: 1.2rem;
        }

        .step-content h4 {
          color: #0c4a6e;
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .step-content p {
          color: #0369a1;
          margin: 0;
          line-height: 1.5;
        }

        .troubleshoot-steps {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
        }

        .troubleshoot-steps p {
          color: #991b1b;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .troubleshoot-steps ul {
          color: #dc2626;
        }

        .beta-issues {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
        }

        .beta-issues h2 {
          color: #92400e;
          border-bottom-color: #f59e0b;
        }

        .issues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .issue-item {
          background: rgba(255,255,255,0.7);
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
        }

        .issue-item h4 {
          color: #92400e;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .issue-item p {
          color: #78350f;
          margin: 0;
          line-height: 1.5;
        }

        .contact-section {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
        }

        .contact-section h2 {
          color: white;
          font-size: 2rem;
          margin-bottom: 20px;
          border: none;
        }

        .contact-section p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 30px;
        }

        .contact-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .contact-method {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 25px;
        }

        .contact-method h4 {
          color: white;
          margin-bottom: 10px;
          font-size: 1.2rem;
        }

        .contact-method p {
          color: rgba(255,255,255,0.9);
          margin: 0;
          line-height: 1.5;
        }

        .beta-thanks {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 20px;
          margin-top: 30px;
        }

        .beta-thanks p {
          color: white;
          font-size: 1.1rem;
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header-section h1 {
            font-size: 2rem;
          }

          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-links {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .faq-section {
            padding: 25px 20px;
          }

          .faq-grid,
          .quick-start-grid,
          .issues-grid,
          .contact-options {
            grid-template-columns: 1fr;
          }

          .quick-step {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
