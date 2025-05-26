// pages/faq.js - Essential for beta support
import Head from 'next/head';

export default function FAQ() {
  return (
    <div className="faq-page">
      <Head>
        <title>VeriDiff FAQ - Beta Support</title>
      </Head>
      
      {/* Beta-specific FAQ section first */}
      <section className="beta-faq">
        <h2>🧪 Beta Testing FAQ</h2>
        <div className="faq-item">
          <h3>How do I report bugs or issues?</h3>
          <p>[Your preferred method - email, form, etc.]</p>
        </div>
        <div className="faq-item">
          <h3>What should I focus on testing?</h3>
          <p>Excel-CSV comparisons, field mapping, tolerance settings, and export functionality.</p>
        </div>
      </section>
      
      {/* Then regular FAQ content */}
    </div>
  );
}
