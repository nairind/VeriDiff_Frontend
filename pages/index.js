import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Check, X, Play, Shield, Clock, Zap, Users, Star, ChevronDown, FileText, BarChart3, Calculator } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState('excel-csv');
  const [faqOpen, setFaqOpen] = useState(null);

  const demoData = {
    'excel-csv': {
      title: 'Excel to CSV Comparison',
      description: 'Smart mapping handles mismatched column names automatically',
      before: { file: 'client_data.xlsx', columns: ['Customer Name', 'Total Amount', 'Invoice Date'] },
      after: { file: 'export_data.csv', columns: ['customer', 'amount', 'date'] },
      result: '3 matches found with smart mapping + 2 tolerance matches'
    },
    'tolerance': {
      title: 'Financial Data with Tolerances',
      description: 'Set percentage tolerances for numerical comparisons',
      before: { file: 'budget_v1.xlsx', values: ['$1,000.00', '$2,500.50', '$999.99'] },
      after: { file: 'budget_v2.csv', values: ['$1000', '$2500.5', '$1000.01'] },
      result: 'All matches within 0.1% tolerance'
    }
  };

  const testimonials = [
    {
      text: "VeriDiff caught a $50K error in client data that would have cost us our biggest account. The smart mapping feature is incredible.",
      author: "Sarah Chen",
      role: "Senior Consultant, Acme Consulting",
      savings: "10 hours/week"
    },
    {
      text: "Finally, a comparison tool that understands business data isn't perfect. Tolerance settings are a game-changer for financial reconciliation.",
      author: "Michael Rodriguez",
      role: "Finance Manager, GrowthCorp",
      savings: "6 hours/week"
    },
    {
      text: "I can compare Excel files with CSV exports directly. No more manual conversion - this saves me hours every month.",
      author: "Jennifer Liu",
      role: "Data Analyst, TechFlow",
      savings: "8 hours/week"
    }
  ];

  const faqs = [
    {
      q: "How is VeriDiff different from free comparison tools?",
      a: "Free tools require exact column matches and identical formats. VeriDiff uses smart mapping to match 'Total Amount' with 'amount', handles cross-format comparison (Excel-to-CSV), and includes tolerance settings for numerical data - perfect for real business scenarios."
    },
    {
      q: "What makes VeriDiff better than Diffchecker?",
      a: "While Diffchecker does basic file comparison, VeriDiff is built specifically for business data reconciliation. We offer smart header mapping, tolerance settings for financial data, and AI-like suggestions - features Diffchecker doesn't have."
    },
    {
      q: "Can I really compare Excel files directly with CSV files?",
      a: "Yes! This is our specialty. VeriDiff handles cross-format comparison seamlessly, including smart mapping between different column naming conventions. Most tools require you to convert files first."
    },
    {
      q: "What file formats do you support?",
      a: "Excel (.xlsx, .xls), CSV, PDF (with enhanced parsing), JSON, XML, and TXT. Our unique advantage is cross-format comparison - especially Excel-to-CSV direct comparison."
    },
    {
      q: "How does the smart mapping work?",
      a: "Our AI-like engine recognizes that 'Customer Name' and 'customer' refer to the same data, 'Total Amount' matches 'amount', etc. You can review and adjust mappings before comparison."
    },
    {
      q: "What are tolerance settings?",
      a: "For financial data, you can set percentage (±2%) or flat-rate (±$0.01) tolerances. This means $100.00 and $99.99 can be considered a match - crucial for real-world business data comparison."
    }
  ];

  const handleTryDemo = () => {
    router.push('/compare');
  };

  const handleSignIn = () => {
    alert('Sign in functionality coming soon!');
  };

  const handleWatchVideo = () => {
    alert('Demo video coming soon! Click "Try Live Demo" above to test VeriDiff now.');
  };

  const handleProTrial = () => {
    alert('Pro trial signup coming soon! Click "Try Free Demo" to test VeriDiff now.');
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

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VeriDiff
                </span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
                <a href="#faq" className="text-gray-700 hover:text-blue-600">FAQ</a>
              </nav>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleSignIn}
                  className="text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleTryDemo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Try Free Demo
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                Precision-Engineered in London for Global Professionals
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                What Excel Comparison
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Should Have Been
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                British-engineered smart mapping + tolerance settings for business data that is never perfect. 
                Built in London fintech district for consultants, analysts, and finance teams worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  onClick={handleTryDemo}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 flex items-center justify-center cursor-pointer"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Live Demo - Free
                </button>
                <button 
                  onClick={handleWatchVideo}
                  className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-medium border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Watch 2-Min Video
                </button>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Smart mapping when columns don't match</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Tolerance settings for financial data</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Built for business users, not developers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-20 bg-white" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">See the Difference in Action</h2>
              <p className="text-xl text-gray-600">Compare real business data scenarios that other tools cannot handle</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={() => setSelectedDemo('excel-csv')}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    selectedDemo === 'excel-csv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Excel ↔ CSV
                </button>
                <button
                  onClick={() => setSelectedDemo('tolerance')}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    selectedDemo === 'tolerance'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tolerance Matching
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-4">File 1: {demoData[selectedDemo].before.file}</h4>
                  <div className="space-y-2">
                    {selectedDemo === 'excel-csv' && demoData[selectedDemo].before.columns.map((col, i) => (
                      <div key={i} className="bg-green-50 p-2 rounded text-sm">{col}</div>
                    ))}
                    {selectedDemo === 'tolerance' && demoData[selectedDemo].before.values.map((val, i) => (
                      <div key={i} className="bg-green-50 p-2 rounded text-sm">{val}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-4">File 2: {demoData[selectedDemo].after.file}</h4>
                  <div className="space-y-2">
                    {selectedDemo === 'excel-csv' && demoData[selectedDemo].after.columns.map((col, i) => (
                      <div key={i} className="bg-blue-50 p-2 rounded text-sm">{col}</div>
                    ))}
                    {selectedDemo === 'tolerance' && demoData[selectedDemo].after.values.map((val, i) => (
                      <div key={i} className="bg-blue-50 p-2 rounded text-sm">{val}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
                <p className="text-green-800 font-medium">✨ VeriDiff Result: {demoData[selectedDemo].result}</p>
                <p className="text-green-700 text-sm mt-1">{demoData[selectedDemo].description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">VeriDiff vs Basic Comparison Tools</h2>
              <p className="text-xl text-gray-600">Why business users choose VeriDiff over generic file comparison tools</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Basic Tools</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">VeriDiff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Excel to CSV Direct Comparison</td>
                    <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Smart Header Mapping</td>
                    <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Tolerance Settings for Financial Data</td>
                    <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-900">User-Controlled Mapping Validation</td>
                    <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Built for Business Users</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">Technical Focus</td>
                    <td className="px-6 py-4 text-center text-sm text-blue-600">Business Focus</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Pricing</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">$15+/month</td>
                    <td className="px-6 py-4 text-center text-sm text-blue-600">£19/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Real Business Scenarios</h2>
              <p className="text-xl text-gray-600">See how professionals use VeriDiff to solve data challenges</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-8 rounded-2xl">
                <Calculator className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Consultants</h3>
                <p className="text-gray-600 mb-6">
                  Verify client data accuracy before delivering reports. Smart mapping handles mismatched column names from different client systems.
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  ✓ Catch errors before client delivery<br/>
                  ✓ Handle inconsistent data formats<br/>
                  ✓ Save 10+ hours per project
                </div>
              </div>

              <div className="bg-green-50 p-8 rounded-2xl">
                <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Accountants</h3>
                <p className="text-gray-600 mb-6">
                  Reconcile financial data from different systems with tolerance settings. Perfect for month-end close processes.
                </p>
                <div className="text-sm text-green-600 font-medium">
                  ✓ Set tolerances for rounding differences<br/>
                  ✓ Compare different data sources<br/>
                  ✓ Ensure audit compliance
                </div>
              </div>

              <div className="bg-purple-50 p-8 rounded-2xl">
                <FileText className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Analysts</h3>
                <p className="text-gray-600 mb-6">
                  Compare datasets with slight format differences. Excel to CSV direct comparison without manual conversion.
                </p>
                <div className="text-sm text-purple-600 font-medium">
                  ✓ Cross-format comparison<br/>
                  ✓ No manual file conversion<br/>
                  ✓ Automated data validation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Forward-Thinking Business Professionals</h2>
              <p className="text-xl text-gray-600">Join innovative teams using next-generation comparison tools for mission-critical data reconciliation</p>
              <div className="flex justify-center items-center space-x-2 text-yellow-500 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-current" />
                ))}
                <span className="text-gray-600 ml-2">Built with industry feedback</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.text}</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium mt-1">Saves {testimonial.savings}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-white border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <h4 className="font-semibold text-gray-900">Bank-Level Security</h4>
                <p className="text-sm text-gray-600">256-bit encryption</p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <h4 className="font-semibold text-gray-900">30-Day Guarantee</h4>
                <p className="text-sm text-gray-600">Full money back</p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <h4 className="font-semibold text-gray-900">Industry Experts</h4>
                <p className="text-sm text-gray-600">Built with professional feedback</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <h4 className="font-semibold text-gray-900">Instant Setup</h4>
                <p className="text-sm text-gray-600">Ready in 2 minutes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for trying VeriDiff</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">£0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">5 comparisons per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Files up to 5MB</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">All comparison formats</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Smart mapping</span>
                  </li>
                </ul>
                <button 
                  onClick={handleTryDemo}
                  className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 cursor-pointer"
                >
                  Start Free
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-white p-8 rounded-2xl border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">£19</span>
                  <span className="text-gray-600">/month</span>
                  <div className="text-sm text-gray-500 mt-1">
                    Includes all local taxes<br/>
                    Approx $24 USD / €22 EUR
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited comparisons</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Files up to 50MB</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced tolerance settings</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">12-month history</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>
                <button 
                  onClick={handleProTrial}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Start Pro Trial
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">£79</span>
                  <span className="text-gray-600">/month</span>
                  <div className="text-sm text-gray-500 mt-1">
                    Includes all local taxes<br/>
                    Approx $99 USD / €92 EUR
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited file size</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Team collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">API access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Phone support</span>
                  </li>
                </ul>
                <button 
                  onClick={handleContactSales}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 cursor-pointer"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about VeriDiff</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                      faqOpen === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {faqOpen === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Stop Wrestling with Data?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join forward-thinking professionals using business-intelligent data reconciliation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={handleTryDemo}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 flex items-center justify-center cursor-pointer"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Free Demo
              </button>
              <button 
                onClick={handleProTrial}
                className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-800 border border-blue-500 cursor-pointer"
              >
                Start Pro Trial - £19/month
              </button>
            </div>
            
            <p className="text-blue-200 text-sm">
              ✓ No credit card required for demo • ✓ 30-day money-back guarantee • ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VeriDiff
                </span>
                <p className="text-gray-300 mt-4 text-sm">
                  Precision-engineered in London for global business professionals. Smart file comparison for real-world data reconciliation.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#features" className="hover:text-white">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">API Docs</a></li>
                  <li><a href="#" className="hover:text-white">Changelog</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Status</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-white">GDPR</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 VeriDiff. All rights reserved. Precision-engineered in London for global professionals.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
