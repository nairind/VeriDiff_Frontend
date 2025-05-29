import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Check, X, Play, Shield, Clock, Zap, Users, Star, ChevronDown, FileText, BarChart3, Calculator } from 'lucide-react';

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

      <div className="min-h-screen bg-white">
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
                  <h4 className="font-semibold text-gray-900 mb-4">File 1: client_data.xlsx</h4>
                  <div className="space-y-2">
                    <div className="bg-green-50 p-2 rounded text-sm">Customer Name</div>
                    <div className="bg-green-50 p-2 rounded text-sm">Total Amount</div>
                    <div className="bg-green-50 p-2 rounded text-sm">Invoice Date</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-4">File 2: export_data.csv</h4>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-2 rounded text-sm">customer</div>
                    <div className="bg-blue-50 p-2 rounded text-sm">amount</div>
                    <div className="bg-blue-50 p-2 rounded text-sm">date</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
                <p className="text-green-800 font-medium">✨ VeriDiff Result: 3 matches found with smart mapping + 2 tolerance matches</p>
                <p className="text-green-700 text-sm mt-1">Smart mapping handles mismatched column names automatically</p>
              </div>
            </div>
          </div>
        </section>

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
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                </ul>
                <button 
                  onClick={handleTryDemo}
                  className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 cursor-pointer"
                >
                  Start Free
                </button>
              </div>

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
                </ul>
                <button 
                  onClick={handleProTrial}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Start Pro Trial
                </button>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
                <p className="text-gray-600 mb-6">For teams and organizations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">£79</span>
                  <span className="text-gray-600">/month</span>
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

        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VeriDiff
                </span>
                <p className="text-gray-300 mt-4 text-sm">
                  Precision-engineered in London for global business professionals.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#features" className="hover:text-white">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
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
