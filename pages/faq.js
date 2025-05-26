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
        <!-- Add these sections to your FAQ page -->

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
  
  <!-- ADD THESE NEW SECTIONS -->
  
  <div className="faq-item">
    <h3>What file sizes should I test with?</h3>
    <p>Start with small files (under 1MB), then try medium files (1-5MB). If you have larger files, let us know how they perform!</p>
  </div>
  
  <div className="faq-item">
    <h3>Which browsers should I test?</h3>
    <p>Primarily Chrome or Firefox. If you use Safari or Edge regularly, please test with those too and report any differences.</p>
  </div>
  
  <div className="faq-item">
    <h3>What if something doesn't work as expected?</h3>
    <p>That's exactly what we want to know! Take a screenshot if possible and describe what you were trying to do.</p>
  </div>
  
  <div className="faq-item">
    <h3>How long is the beta testing period?</h3>
    <p>[Your timeline - e.g., "2-4 weeks" or "Through end of February"]</p>
  </div>
  
  <div className="faq-item">
    <h3>Can I share VeriDiff with others during beta?</h3>
    <p>[Your preference - e.g., "Please check with us first" or "Feel free to share with colleagues"]</p>
  </div>
</section>

<!-- Quick Help Section -->
<section className="quick-help">
  <h2>🚀 Quick Start for Beta Testers</h2>
  
  <div className="quick-steps">
    <div className="step">
      <strong>1. Start Simple:</strong> Try Excel-CSV comparison first - it's our most featured capability
    </div>
    <div className="step">
      <strong>2. Test Auto-Detection:</strong> Upload files and see how well the field mapping works
    </div>
    <div className="step">
      <strong>3. Try Tolerances:</strong> Set small tolerance values for amount fields
    </div>
    <div className="step">
      <strong>4. Export Results:</strong> Download both Excel and CSV formats
    </div>
    <div className="step">
      <strong>5. Give Feedback:</strong> What worked well? What was confusing?
    </div>
  </div>
</section>

<!-- Common Issues Section -->
<section className="common-issues">
  <h2>⚠️ Known Beta Issues</h2>
  
  <div className="issue-item">
    <h4>File Upload Sometimes Slow</h4>
    <p>Large files (>5MB) may take longer to process. This is expected in beta.</p>
  </div>
  
  <div className="issue-item">
    <h4>Mobile Experience Limited</h4>
    <p>Best experience is on desktop/laptop. Mobile works but some features may be harder to use.</p>
  </div>
  
  <!-- Add any other known issues you're aware of -->
      </section>
      
      {/* Then regular FAQ content */}
    </div>
  );
}
