// Modified handleSubmitFeedback function for your existing analytics API
const handleSubmitFeedback = async () => {
  if (rating === 0) {
    alert('Please select a rating before submitting.');
    return;
  }

  setSubmitting(true);
  
  try {
    // Use your existing analytics API with feedback data
    const feedbackData = {
      user_id: session?.user?.id,
      user_email: session?.user?.email,
      user_name: session?.user?.name,
      comparison_type: 'pdf-comparison-feedback',
      tier: userTier,
      timestamp: new Date().toISOString(),
      file1_name: file1?.name,
      file2_name: file2?.name,
      file1_size: file1?.size,
      file2_size: file2?.size,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      // Additional feedback-specific data
      feedback_rating: rating,
      feedback_comment: comment.trim(),
      feedback_timestamp: new Date().toISOString(),
      feedback_session_id: Date.now().toString(),
      comparison_results: {
        total_changes: results?.differences_found,
        similarity_score: results?.similarity_score
      }
    };

    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });

    if (response.ok) {
      console.log('Feedback submitted successfully via analytics API');
    } else {
      console.warn('Feedback submission failed, but continuing...');
    }
  } catch (error) {
    console.warn('Feedback submission error:', error);
  }

  setFeedbackGiven(true);
  setShowFeedbackModal(false);
  setSubmitting(false);
};
