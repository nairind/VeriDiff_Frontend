// /pages/word-results.js - WORD RESULTS WITH MODAL AUTH
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WordResults from '../components/WordResults';
import AuthModal from '../components/AuthModal';

export default function WordResultsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState({ file1: null, file2: null });
  const [wordResults, setWordResults] = useState(null);
  const [wordOptions, setWordOptions] = useState(null);

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  useEffect(() => {
    loadWordResults();
  }, []);

  const loadWordResults = async () => {
    try {
      console.log('📝 Loading Word comparison results...');
      
      // Load file info
      const file1Info = JSON.parse(sessionStorage.getItem('veridiff_file1_info') || 'null');
      const file2Info = JSON.parse(sessionStorage.getItem('veridiff_file2_info') || 'null');
      
      if (!file1Info || !file2Info) {
        console.error('❌ File info not found, redirecting to home');
        router.push('/');
        return;
      }

      // Verify these are Word files
      const isWordFile = (fileName) => {
        const ext = fileName.toLowerCase();
        return ext.endsWith('.docx') || ext.endsWith('.doc');
      };

      if (!isWordFile(file1Info.name) || !isWordFile(file2Info.name)) {
        setError('This page is for Word results only. Invalid file types detected.');
        setIsLoading(false);
        return;
      }

      setFileInfo({ file1: file1Info, file2: file2Info });

      // Load Word results
      const wordResultsData = sessionStorage.getItem('veridiff_word_results');
      const wordOptionsData = sessionStorage.getItem('veridiff_word_options');

      console.log('🔍 DEBUG - Word data availability:', {
        hasWordResults: !!wordResultsData,
        wordResultsLength: wordResultsData?.length,
        hasWordOptions: !!wordOptionsData,
        wordOptionsLength: wordOptionsData?.length
      });

      if (!wordResultsData) {
        throw new Error('Word comparison results not found in sessionStorage. Please run the comparison again.');
      }

      // Parse Word results
      console.log('🔍 DEBUG - Parsing Word results...');
      const parsedResults = JSON.parse(wordResultsData);
      const parsedOptions = wordOptionsData ? JSON.parse(wordOptionsData) : {};

      console.log('🔍 DEBUG - Parsed Word results structure:', {
        type: typeof parsedResults,
        keys: parsedResults ? Object.keys(parsedResults) : 'null',
        hasDocuments: !!parsedResults.document1_data,
        documentsCount: [parsedResults.document1_data, parsedResults.document2_data].filter(Boolean).length,
        hasComparison: !!parsedResults.similarity_score
      });

      // Validate Word results
      if (!parsedResults || typeof parsedResults !== 'object') {
        throw new Error('Invalid Word results format');
      }

      setWordResults(parsedResults);
      setWordOptions(parsedOptions);
      setIsLoading(false);

      console.log('✅ Word results loaded successfully:', {
        paragraphsProcessed: parsedResults.total_paragraphs || 'unknown',
        hasComparison: !!parsedResults.similarity_score
      });

    } catch (error) {
      console.error('❌ Error loading Word results:', error);
      setError(`Failed to load Word results: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleStartNewComparison = () => {
    sessionStorage.clear();
    router.push('/');
  };

  const handleBackToSetup = () => {
    sessionStorage.removeItem('veridiff_word_results');
    sessionStorage.removeItem('veridiff_word_options');
    router.push('/word-comparison');
  };

  // Modal handlers
  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const renderLoadingState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#1f2937'
      }}>
        Loading Word Analysis Results
      </h3>
      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
        Processing your Word document comparison analysis and generating detailed results...
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#374151' }}>
          📝 {fileInfo.file1?.name} vs {fileInfo.file2?.name}
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#dc2626'
      }}>
        Word Results Error
      </h3>
      <p style={{
        color: '#6b7280',
        fontSize: '1.1rem',
        marginBottom: '25px',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto 25px'
      }}>
        {error}
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleBackToSetup}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔧 Back to Word Setup
        </button>
        <button
          onClick={handleStartNewComparison}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🏠 New Comparison
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {isLoading 
            ? 'Loading Word Results - VeriDiff'
            : error 
              ? 'Word Results Error - VeriDiff'
              : `Word Comparison Results - VeriDiff`
          }
        </title>
        <meta name="description" content="View your detailed Word document comparison results and analysis" />
      </Head>
      
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header />
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode={authMode}
        />
        
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLoading 
                ? '⏳ Processing Word Analysis'
                : error 
                  ? '❌ Word Results Error'
                  : '📝 Word Document Analysis'
              }
            </h1>
            
            {!isLoading && !error && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                margin: '0 auto',
                maxWidth: '600px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span>📝 <strong>{fileInfo.file1?.name}</strong></span>
                  <span style={{ color: '#059669' }}>vs</span>
                  <span>📝 <strong>{fileInfo.file2?.name}</strong></span>
                  {!isAuthenticated && (
                    <span style={{
                      background: '#059669',
                      color: 'white',
                      fontSize: '0.8rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      Preview
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (when not loading and no error) */}
          {!isLoading && !error && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleBackToSetup}
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔧 Modify Word Settings
              </button>
              <button
                onClick={handleStartNewComparison}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 New Comparison
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading && renderLoadingState()}
          
          {error && renderErrorState()}
          
          {!isLoading && !error && wordResults && (
            <WordResults 
              results={wordResults}
              file1Name={fileInfo.file1?.name}
              file2Name={fileInfo.file2?.name}
              options={wordOptions}
              isAuthenticated={isAuthenticated}
              onSignUp={handleSignUp}
              onSignIn={handleSignIn}
            />
          )}
        </div>
        
        <Footer />
      </div>
    </>
  );
}
