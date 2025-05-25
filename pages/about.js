// pages/about.js
import Head from 'next/head';
import Link from 'next/link';

export default function About() {
  return (
    <div className="about-page">
      <Head>
        <title>About VeriDiff - Smart File Comparison Tool</title>
        <meta name="description" content="Learn about VeriDiff's features, security, and supported file formats. Compare Excel, PDF, CSV, JSON, XML files with professional accuracy." />
      </Head>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <Link href="/">
            <span className="logo">VeriDiff</span>
          </Link>
          <div className="nav-links">
            <Link href="/"><span className="nav-link">Compare Files</span></Link>
            <Link href="/about"><span className="nav-link active">About</span></Link>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Hero Banner */}
        <div className="hero-banner">
          <h1>🚀 VeriDiff - Smart File Comparison</h1>
          <p>Compare documents with precision, confidence, and security. From invoices to contracts, 
          VeriDiff handles your most critical file comparisons with professional-grade accuracy.</p>
          <Link href="/">
            <button className="cta-button">Start Comparing Files →</button>
          </Link>
        </div>

        {/* Supported Formats */}
        <div className="section">
          <h2>📁 Supported File Formats</h2>
          <div className="formats-showcase">
            <span className="format-badge">📊 Excel (.xlsx)</span>
            <span className="format-badge">📄 CSV (.csv)</span>
            <span className="format-badge">📋 PDF (.pdf)</span>
            <span className="format-badge">🔗 JSON (.json)</span>
            <span className="format-badge">📝 XML (.xml)</span>
            <span className="format-badge">📃 Text (.txt)</span>
          </div>
          <p>Mix and match formats - compare Excel files with CSV data, extract text from PDFs, 
          and handle complex nested JSON structures.</p>
        </div>

        {/* Features Grid */}
        <div className="section">
          <h2>✨ Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon security">🔒</div>
              <h3>100% Private & Secure</h3>
              <p>All file processing happens in your browser. Your files never leave your device or get uploaded to any server. Complete privacy guaranteed.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon formats">🎯</div>
              <h3>Smart Field Mapping</h3>
              <p>Automatically detects similar fields across different files. Handle mismatched column names and choose exactly what to compare.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon accuracy">⚖️</div>
              <h3>Tolerance Settings</h3>
              <p>Set acceptable differences for financial data. Perfect for invoice reconciliation and accounting workflows where small variances are expected.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon speed">📊</div>
              <h3>Professional Reports</h3>
              <p>Export detailed comparison results to Excel with color-coded differences, summary statistics, and ready-to-share professional formatting.</p>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="security-banner">
          <h2>🛡️ Your Data Never Leaves Your Device</h2>
          <p>VeriDiff processes everything locally in your browser using advanced client-side technology. 
          No uploads, no cloud storage, no data collection. What happens on your computer, stays on your computer.</p>
        </div>

        {/* Current Limitations */}
        <div className="restrictions-section">
          <h2>⚠️ Current Limitations (Beta Version)</h2>
          <ul className="restrictions-list">
            <li><strong>File Size:</strong> Best performance with files under 10MB. Larger files may process slowly.</li>
            <li><strong>PDF Support:</strong> Text-based PDFs only. Scanned/image PDFs require text content to compare.</li>
            <li><strong>Browser Memory:</strong> Very large datasets may impact browser performance. Close other tabs for best results.</li>
            <li><strong>Internet Required:</strong> Initial app loading requires internet, but file processing works offline.</li>
            <li><strong>Modern Browsers:</strong> Works best in Chrome, Firefox, Safari, and Edge. Internet Explorer not supported.</li>
            <li><strong>Mobile Experience:</strong> Optimized for desktop/laptop use. Mobile devices may have limited functionality.</li>
          </ul>
        </div>

        {/* Use Cases */}
        <div className="section">
          <h2>💼 Perfect For</h2>
          <div className="use-cases-grid">
            <div className="use-case">
              <h3>🧾 Finance Teams</h3>
              <p>Compare invoices vs bank statements, reconcile financial data, validate expense reports</p>
            </div>
            <div className="use-case">
              <h3>📊 Data Analysts</h3>
              <p>Reconcile data from different sources, validate data exports, compare dataset versions</p>
            </div>
            <div className="use-case">
              <h3>🔍 Auditors</h3>
              <p>Compare document versions, validate compliance data, ensure data consistency</p>
            </div>
            <div className="use-case">
              <h3>📋 Project Managers</h3>
              <p>Compare contract versions, validate deliverables, track document changes</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <h2>✨ Ready to Compare?</h2>
          <p>Upload your files and experience the difference. Whether you're reconciling financial data, 
          comparing contract versions, or validating data exports - VeriDiff makes it simple, secure, and accurate.</p>
          <Link href="/">
            <button className="cta-button">Start Comparing Files →</button>
          </Link>
        </div>
      </main>

      <style jsx>{`
        .about-page {
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

        .nav-link:hover, .nav-link.active {
          color: #667eea;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .hero-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 40px;
          border-radius: 16px;
          text-align: center;
          margin-bottom: 60px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .hero-banner h1 {
          font-size: 3em;
          margin: 0 0 20px 0;
          font-weight: 700;
        }

        .hero-banner p {
          font-size: 1.3em;
          opacity: 0.9;
          margin: 0 0 30px 0;
          line-height: 1.6;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .cta-button:hover {
          background: rgba(255,255,255,0.3);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
        }

        .section {
          margin: 60px 0;
        }

        .section h2 {
          font-size: 2.2em;
          color: #1f2937;
          margin: 0 0 30px 0;
          text-align: center;
        }

        .section p {
          font-size: 1.2em;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }

        .formats-showcase {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          margin: 30px 0;
        }

        .format-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 1em;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .feature-card {
          background: white;
          padding: 40px 30px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          border-radius: 50%;
          color: white;
        }

        .feature-icon.security { background: linear-gradient(135deg, #667eea, #764ba2); }
        .feature-icon.formats { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .feature-icon.speed { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .feature-icon.accuracy { background: linear-gradient(135deg, #43e97b, #38f9d7); }

        .feature-card h3 {
          color: #1f2937;
          font-size: 1.4em;
          margin: 0 0 15px 0;
          font-weight: 600;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .security-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 50px 40px;
          border-radius: 16px;
          text-align: center;
          margin: 60px 0;
        }

        .security-banner h2 {
          font-size: 2em;
          margin: 0 0 20px 0;
          color: white;
        }

        .security-banner p {
          font-size: 1.2em;
          opacity: 0.9;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          color: white;
        }

        .restrictions-section {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 16px;
          padding: 40px;
          margin: 60px 0;
        }

        .restrictions-section h2 {
          color: #92400e;
          font-size: 1.8em;
          margin: 0 0 30px 0;
          text-align: center;
        }

        .restrictions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          max-width: 800px;
          margin: 0 auto;
        }

        .restrictions-list li {
          color: #78350f;
          margin: 20px 0;
          padding-left: 35px;
          position: relative;
          line-height: 1.6;
          font-size: 1.1em;
        }

        .restrictions-list li:before {
          content: "⚠️";
          position: absolute;
          left: 0;
          top: 0;
          font-size: 1.2em;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .use-case {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }

        .use-case h3 {
          color: #1f2937;
          font-size: 1.2em;
          margin: 0 0 15px 0;
          font-weight: 600;
        }

        .use-case p {
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
          text-align: left;
          font-size: 1em;
        }

        .cta-section {
          text-align: center;
          padding: 60px 40px;
          background: white;
          border-radius: 16px;
          margin: 60px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .cta-section h2 {
          color: #1f2937;
          font-size: 2.2em;
          margin: 0 0 20px 0;
        }

        .cta-section p {
          color: #6b7280;
          font-size: 1.2em;
          margin: 0 0 30px 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-banner h1 {
            font-size: 2.2em;
          }
          
          .hero-banner {
            padding: 40px 20px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
