// components/FeedbackSystem.js - Adapted for your existing table structure
import React, { useState, useEffect } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSubmit(feedback, email);
    setIsSubmitting(false);
    
    if (success) {
      setFeedback('');
      setEmail('');
      onClose();
    }
  };

  const handleSkip = () => {
    // Still submit but with empty feedback to track the interaction
    onSubmit('', email);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎉</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
            You're getting the hang of it!
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            What's the #1 thing we should improve?
          </p>
        </div>
        
        {/* Email field for trial users */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional, for updates)"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '15px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        
        {/* Feedback textarea */}
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your suggestion (optional)..."
          style={{
            width: '100%',
            height: '100px',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '10px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: 'white',
              color: '#6b7280',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontFamily: 'inherit'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FeedbackSystem = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [trialCount, setTrialCount] = useState(0);
  const [feedbackShown, setFeedbackShown] = useState(false);

  useEffect(() => {
    // Get trial count and feedback status from localStorage
    const storedCount = localStorage.getItem('trialComparisonCount') || '0';
    const shown = localStorage.getItem('feedbackShown') === 'true';
    setTrialCount(parseInt(storedCount));
    setFeedbackShown(shown);
  }, []);

  const handleComparisonComplete = async () => {
    // Don't show if already shown
    if (feedbackShown) return;
    
    const token = localStorage.getItem('token');
    let currentCount = trialCount;

    if (!token) {
      // Trial user - increment count
      currentCount = trialCount + 1;
      setTrialCount(currentCount);
      localStorage.setItem('trialComparisonCount', currentCount.toString());
    } else {
      // Authenticated user - you could fetch count from database if needed
      // For now, we'll trigger on 3rd comparison regardless
      currentCount = 3;
    }

    // Show feedback popup after 3rd comparison
    if (currentCount === 3) {
      setShowFeedbackModal(true);
      setFeedbackShown(true);
      localStorage.setItem('feedbackShown', 'true');
    }
  };

  const submitFeedback = async (feedbackText, email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          feedback_text: feedbackText,
          email: email,
          comparisonCount: trialCount 
        })
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        return true;
      } else {
        console.error('Failed to submit feedback');
        return false;
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  };

  // Expose the function globally for easy integration
  useEffect(() => {
    window.triggerFeedbackCheck = handleComparisonComplete;
  }, [trialCount, feedbackShown]);

  return (
    <FeedbackModal
      isOpen={showFeedbackModal}
      onClose={() => setShowFeedbackModal(false)}
      onSubmit={submitFeedback}
    />
  );
};

export default FeedbackSystem;
