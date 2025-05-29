import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Cookies() {
  const router = useRouter();

  const handleHome = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Cookie Policy - VeriDiff</title>
        <meta name="description" content="VeriDiff Cookie Policy - How we use cookies and tracking technologies." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
          .header { background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 1000; }
          .nav-container { display: flex; justify-content: space-between; align-items: center; height: 64px; }
          .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; }
          .content { padding: 3rem 0; }
          .content h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; }
          .content h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem 0; color: #1f2937; }
          .content p { margin-bottom: 1rem; color: #4b5563; }
          .content ul { margin: 1rem 0; padding-left: 2rem; }
          .content li { margin-bottom: 0.5rem; color: #4b5563; }
          .last-updated { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
          .cookie-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
          .cookie-table th, .cookie-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
          .cookie-table th { background: #f3f4f6; font-weight: 600; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <header className="header">
          <div className="container">
            <div className="nav-container">
              <div className="logo" onClick={handleHome}>VeriDiff</div>
              <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <a href="/#features" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Features</a>
                <a href="/#pricing" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Pricing</a>
                <a href="/faq" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>FAQ</a>
              </nav>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="container">
            <div className="last-updated">
              <strong>Last updated:</strong> January 2025
            </div>

            <h1>Cookie Policy</h1>

            <h2>1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences and improve your experience.</p>

            <h2>2. How We Use Cookies</h2>
            <p>VeriDiff uses cookies for essential functionality and optional analytics. We respect your privacy and provide opt-out options for non-essential cookies.</p>

            <h2>3. Types of Cookies We Use</h2>

            <table className="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Type</th>
                  <th>Purpose</th>
                  <th>Required</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Essential</td>
                  <td>Authentication, security, preferences</td>
                  <td>Yes</td>
                  <td>Session/1 year</td>
                </tr>
                <tr>
                  <td>Analytics</td>
                  <td>Usage tracking (Google Analytics)</td>
                  <td>No</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td>Marketing</td>
                  <td>Conversion tracking (Google Ads)</td>
                  <td>No</td>
                  <td>90 days</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Essential Cookies</h2>
            <p>These cookies are necessary for the website to function:</p>
            <ul>
              <li><strong>Authentication:</strong> Keep you logged in</li>
              <li><strong>Security:</strong> Prevent cross-site request forgery</li>
              <li><strong>Preferences:</strong> Remember your settings</li>
              <li><strong>Session:</strong> Maintain your session state</li>
            </ul>

            <h2>5. Analytics Cookies (Optional)</h2>
            <p>We use Google Analytics to understand how users interact with VeriDiff:</p>
            <ul>
              <li>Page views and user journeys</li>
              <li>Feature usage and performance</li>
              <li>Error tracking and debugging</li>
              <li>Demographic insights (anonymized)</li>
            </ul>
            <p><strong>Opt-out:</strong> You can disable analytics cookies in your browser settings or through our cookie consent banner.</p>

            <h2>6. Marketing Cookies (Optional)</h2>
            <p>If you arrived via Google Ads, we may use conversion tracking cookies to:</p>
            <ul>
              <li>Measure ad campaign effectiveness</li>
              <li>Optimize marketing spend</li>
              <li>Provide relevant advertisements</li>
            </ul>
            <p><strong>Opt-out:</strong> You can disable marketing cookies through our consent banner or browser settings.</p>

            <h2>7. Third-Party Cookies</h2>
            <p>We may use third-party services that set their own cookies:</p>
            <ul>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Google Analytics:</strong> Usage analytics</li>
              <li><strong>Google Ads:</strong> Conversion tracking</li>
            </ul>

            <h2>8. Managing Your Cookie Preferences</h2>
            <p>You can control cookies through:</p>
            <ul>
              <li><strong>Cookie Consent Banner:</strong> Appears on first visit</li>
              <li><strong>Browser Settings:</strong> Disable cookies entirely</li>
              <li><strong>Opt-out Links:</strong> Google Analytics opt-out</li>
              <li><strong>Account Settings:</strong> Manage preferences when logged in</li>
            </ul>

            <h2>9. Browser Settings</h2>
            <p>Most browsers allow you to:</p>
            <ul>
              <li>View and delete existing cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block third-party cookies</li>
              <li>Be notified when cookies are set</li>
            </ul>
            <p><strong>Note:</strong> Disabling essential cookies may affect website functionality.</p>

            <h2>10. Contact Information</h2>
            <p>For questions about our cookie usage:</p>
            <p><strong>Email:</strong> privacy@veridiff.com</p>
            <p><strong>Data Protection:</strong> dpo@veridiff.com</p>

            <h2>11. Changes to This Policy</h2>
            <p>We may update this Cookie Policy to reflect changes in technology or regulations. We will notify users of significant changes.</p>
          </div>
        </div>
      </div>
    </>
  );
}
