// pages/training.js
import Head from 'next/head';
import Link from 'next/link';

export default function Training() {
  return (
    <div className="training-page">
      <Head>
        <title>VeriDiff Training Guide - Beta</title>
      </Head>
      
      {/* Use the HTML content from the training guide artifact */}
      {/* But add beta-specific messaging */}
      
      <div className="beta-notice">
        <strong>🧪 Beta Version:</strong> This guide covers current functionality. 
        Features may evolve based on your feedback!
      </div>
      
      {/* Rest of training content */}
    </div>
  );
}
