import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState('excel-csv');
  const [faqOpen, setFaqOpen] = useState(null);

  const handleTryDemo = () => {
    router.push('/compare');
  };

  const handleSignIn = () => {
    alert('Sign in functionality coming soon!');
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click Try Live Demo above to test VeriDiff now.');
  };

  const handleProTrial = () => {
    alert('Pro trial signup coming soon! Click Try Free Demo to test VeriDiff now.');
  };

  const handleContactSales = () => {
    alert('Enterprise contact form coming soon! Email us at hello@veridiff.com');
  };

  return (
    <>
      <Head>
        <title>VeriDiff - Smart File Comparison Tool</title>
        <meta name="description" content="Compare Excel, CSV, PDF, JSON, XML files with smart mapping and tolerance settings. Built for business professionals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .wide-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
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
        }

        .nav-links {
          display: none;
          gap: 2rem;
        }

        .nav-links a {
          text-decoration: none;
          color: #374151;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #2563eb;
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: transparent;
          color: #374151;
        }

        .btn-secondary:hover {
          color: #2563eb;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #eff6ff, #f3e8ff);
          padding: 5rem 0;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          background: #dbeafe;
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 2rem;
          gap: 0.5rem;
        }

        .hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero .gradient-text {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .hero p {
          font-size: 1.25rem;
          color: #6b7280;
          margin-bottom: 2rem;
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        .btn-white {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-white:hover {
          background: #f9fafb;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 64rem;
          margin: 0 auto;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #374151;
        }

        .check-icon {
          color: #10b981;
          font-weight: bold;
        }

        /* Demo Section */
        .demo-section {
          padding: 5rem 0;
          background: white;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.25rem;
          color: #6b7280;
        }

        .demo-container {
          background: #f9fafb;
          border-radius: 1rem;
          padding: 2rem;
        }

        .demo-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .demo-tab {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          color: #374151;
          border: none;
        }

        .demo-tab.active {
          background: #2563eb;
          color: white;
        }

        .demo-tab:hover:not(.active) {
          background: #f3f4f6;
        }

        .demo-files {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .demo-file {
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .demo-file h4 {
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .demo-columns {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .demo-column {
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .demo-column.green {
          background: #ecfdf5;
          color: #065f46;
        }

        .demo-column.blue {
          background: #eff6ff;
          color: #1e40af;
        }

        .demo-result {
          background: #dcfce7;
          color: #166534;
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }

        .demo-result p {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .demo-result small {
          font-size: 0.875rem;
          color: #15803d;
        }

        /* Comparison Table */
        .comparison-section {
          padding: 5rem 0;
          background: #f9fafb;
        }

        .comparison-table {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .comparison-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .comparison-table th {
          background: #f9fafb;
          padding: 1rem 1.5rem;
          text-align: left;
          font-weight: 500;
          color: #111827;
        }

        .comparison-table th:nth-child(3) {
          color: #2563eb;
          text-align: center;
        }

        .comparison-table td {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .comparison-table tr:nth-child(even) {
          background: #f9fafb;
        }

        .comparison-table td:nth-child(2),
        .comparison-table td:nth-child(3) {
          text-align: center;
        }

        .icon-check {
          color: #10b981;
          font-weight: bold;
        }

        .icon-x {
          color: #ef4444;
          font-weight: bold;
        }

        /* Pricing Section */
        .pricing-section {
          padding: 5rem 0;
          background: #f9fafb;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 80rem;
          margin: 0 auto;
        }

        .pricing-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          border: 2px solid #e5e7eb;
          position: relative;
        }

        .pricing-card.popular {
          border-color: #2563eb;
        }

        .pricing-badge {
          position: absolute;
          top: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #2563eb;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pricing-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .pricing-card .description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .pricing-price {
          margin-bottom: 1.5rem;
        }

        .pricing-price .amount {
          font-size: 2.25rem;
          font-weight: 700;
          color: #111827;
        }

        .pricing-price .period {
          color: #6b7280;
        }

        .pricing-features {
          list-style: none;
          margin-bottom: 2rem;
        }

        .pricing-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .pricing-button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .pricing-button.primary {
          background: #2563eb;
          color: white;
        }

        .pricing-button.primary:hover {
          background: #1d4ed8;
        }

        .pricing-button.secondary {
          background: #f3f4f6;
          color: #111827;
        }

        .pricing-button.secondary:hover {
          background: #e5e7eb;
        }

        .pricing-button.dark {
          background: #111827;
          color: white;
        }

        .pricing-button.dark:hover {
          background: #1f2937;
        }

        /* CTA Section */
        .cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          text-align: center;
        }

        .cta-section h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.25rem;
          color: #bfdbfe;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .btn-white-cta {
          background: white;
          color: #2563eb;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-white-cta:hover {
          background: #f9fafb;
        }

        .btn-blue-cta {
          background: #1e40af;
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          border: 1px solid #3b82f6;
          transition: all 0.2s;
        }

        .btn-blue-cta:hover {
          background: #1e3a8a;
        }

        .cta-guarantee {
          color: #bfdbfe;
          font-size: 0.875rem;
        }

        /* Footer */
        .footer {
          background: #111827;
          color: white;
          padding: 3rem 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-brand {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .footer-description {
          color: #d1d5db;
          font-size: 0.875rem;
        }

        .footer h4 {
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .footer ul {
          list-style: none;
        }

        .footer ul li {
          margin-bottom: 0.5rem;
        }

        .footer ul li a {
          color: #d1d5db;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .footer ul li a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 2rem;
          text-align: center;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        /* Responsive Design */
        @media (min-width: 768px) {
          .nav-links {
            display: flex;
          }

          .hero h1 {
            font-size: 4rem;
          }

          .demo-files {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 767px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .demo-files {
            grid-template-columns: 1fr;
          }

          .demo-tabs {
            flex-direction: column;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        <header className="header">
          <div className="container">
            <div className="nav-container">
              <div className="logo">
                VeriDiff
              </div>
              <nav className="nav-links">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">FAQ</a>
              </nav>
              <div className="nav-buttons">
                <button 
                  onClick={handleSignIn}
                  className="btn btn-secondary"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleTryDemo}
                  className="btn btn-primary"
                >
                  Try Free Demo
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="container">
            <div className="hero-badge">
              ⚡ Precision-Engineered in London for Global Professionals
            </div>
            
            <h1>
              What Excel Comparison
              <span className="gradient-text">
                Should Have Been
              </span>
            </h1>
            
            <p>
              British-engineered smart mapping + tolerance settings for business data that is never perfect. 
              Built in London fintech district for consultants, analysts, and finance teams worldwide.
            </p>

            <div className="hero-buttons">
              <button 
                onClick={handleTryDemo}
                className="btn btn-primary btn-large"
              >
                ▶ Try Live Demo - Free
              </button>
              <button 
                onClick={handleWatchVideo}
                className="btn btn-white btn-large"
              >
                Watch 2-Min Video
              </button>
            </div>

            <div className="hero-features">
              <div className="hero-feature">
                <span className="check-icon">✓</span>
                <span>Smart mapping when columns don't match</span>
              </div>
              <div className="hero-feature">
                <span className="check-icon">✓</span>
                <span>Tolerance settings for financial data</span>
              </div>
              <div className="hero-feature">
                <span className="check-icon">✓</span>
                <span>Built for business users, not developers</span>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-section" id="features">
          <div className="container">
            <div className="section-header">
              <h2>See the Difference in Action</h2>
              <p>Compare real business data scenarios that other tools cannot handle</p>
            </div>

            <div className="demo-container">
              <div className="demo-tabs">
                <button
                  onClick={() => setSelectedDemo('excel-csv')}
                  className={`demo-tab ${selectedDemo === 'excel-csv' ? 'active' : ''}`}
                >
                  Excel ↔ CSV
                </button>
                <button
                  onClick={() => setSelectedDemo('tolerance')}
                  className={`demo-tab ${selectedDemo === 'tolerance' ? 'active' : ''}`}
                >
                  Tolerance Matching
                </button>
              </div>

              <div className="demo-files">
                <div className="demo-file">
                  <h4>File 1: client_data.xlsx</h4>
                  <div className="demo-columns">
                    <div className="demo-column green">Customer Name</div>
                    <div className="demo-column green">Total Amount</div>
                    <div className="demo-column green">Invoice Date</div>
                  </div>
                </div>

                <div className="demo-file">
                  <h4>File 2: export_data.csv</h4>
                  <div className="demo-columns">
                    <div className="demo-column blue">customer</div>
                    <div className="demo-column blue">amount</div>
                    <div className="demo-column blue">date</div>
                  </div>
                </div>
              </div>

              <div className="demo-result">
                <p>✨ VeriDiff Result: 3 matches found with smart mapping + 2 tolerance matches</p>
                <small>Smart mapping handles mismatched column names automatically</small>
              </div>
            </div>
          </div>
        </section>

        <section className="comparison-section">
          <div className="container">
            <div className="section-header">
              <h2>VeriDiff vs Basic Comparison Tools</h2>
              <p>Why business users choose VeriDiff over generic file comparison tools</p>
            </div>

            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Basic Tools</th>
                    <th>VeriDiff</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Excel to CSV Direct Comparison</td>
                    <td><span className="icon-x">✗</span></td>
                    <td><span className="icon-check">✓</span></td>
                  </tr>
                  <tr>
                    <td>Smart Header Mapping</td>
                    <td><span className="icon-x">✗</span></td>
                    <td><span className="icon-check">✓</span></td>
                  </tr>
                  <tr>
                    <td>Tolerance Settings for Financial Data</td>
                    <td><span className="icon-x">✗</span></td>
                    <td><span className="icon-check">✓</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="container">
            <div className="section-header">
              <h2>Simple, Transparent Pricing</h2>
              <p>Start free, upgrade when you need more</p>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card">
                <h3>Starter</h3>
                <p className="description">Perfect for trying VeriDiff</p>
                <div className="pricing-price">
                  <span className="amount">£0</span>
                  <span className="period">/month</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <span className="icon-check">✓</span>
                    <span>5 comparisons per month</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Files up to 5MB</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>All comparison formats</span>
                  </li>
                </ul>
                <button 
                  onClick={handleTryDemo}
                  className="pricing-button secondary"
                >
                  Start Free
                </button>
              </div>

              <div className="pricing-card popular">
                <div className="pricing-badge">
                  Most Popular
                </div>
                <h3>Professional</h3>
                <p className="description">For growing businesses</p>
                <div className="pricing-price">
                  <span className="amount">£19</span>
                  <span className="period">/month</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Unlimited comparisons</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Files up to 50MB</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Advanced tolerance settings</span>
                  </li>
                </ul>
                <button 
                  onClick={handleProTrial}
                  className="pricing-button primary"
                >
                  Start Pro Trial
                </button>
              </div>

              <div className="pricing-card">
                <h3>Business</h3>
                <p className="description">For teams and organizations</p>
                <div className="pricing-price">
                  <span className="amount">£79</span>
                  <span className="period">/month</span>
                </div>
                <ul className="pricing-features">
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Everything in Pro</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Unlimited file size</span>
                  </li>
                  <li>
                    <span className="icon-check">✓</span>
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <button 
                  onClick={handleContactSales}
                  className="pricing-button dark"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2>Ready to Stop Wrestling with Data?</h2>
            <p>
              Join forward-thinking professionals using business-intelligent data reconciliation
            </p>
            
            <div className="cta-buttons">
              <button 
                onClick={handleTryDemo}
                className="btn-white-cta"
              >
                ▶ Start Free Demo
              </button>
              <button 
                onClick={handleProTrial}
                className="btn-blue-cta"
              >
                Start Pro Trial - £19/month
              </button>
            </div>
            
            <p className="cta-guarantee">
              ✓ No credit card required for demo • ✓ 30-day money-back guarantee • ✓ Cancel anytime
            </p>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div>
                <span className="footer-brand">
                  VeriDiff
                </span>
                <p className="footer-description">
                  Precision-engineered in London for global business professionals.
                </p>
              </div>
              
              <div>
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h4>Support</h4>
                <ul>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
              
              <div>
                <h4>Legal</h4>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2025 VeriDiff. All rights reserved. Precision-engineered in London for global professionals.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
