// /utils/analytics.js - Dual tracking: VeriDiff Dashboard + Plausible

// Your existing VeriDiff dashboard tracking (keep this!)
export const trackAnalytics = async (eventType, data = {}) => {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        ...data
      })
    });
  } catch (error) {
    console.log('Analytics tracking failed (non-blocking):', error);
  }
};

// Plausible tracking function
export const trackPlausible = (eventName, props = {}) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
};

// Combined tracking function - sends to BOTH systems
export const trackEvent = async (eventType, data = {}) => {
  console.log('Tracking:', eventType, data);
  
  // Track to your VeriDiff dashboard (existing system)
  await trackAnalytics(eventType, data);
  
  // Track to Plausible (new addition)
  trackPlausible(eventType, data);
};

// Specific VeriDiff tracking functions using combined tracking
export const trackPageView = (page, isAuthenticated = false) => {
  trackEvent('Page View', { 
    page,
    userType: isAuthenticated ? 'authenticated' : 'anonymous'
  });
};

export const trackFileUpload = (file1Type, file2Type, isAuthenticated = false) => {
  trackEvent('Files Uploaded', { 
    file1Type,
    file2Type,
    combination: `${file1Type}_vs_${file2Type}`,
    userType: isAuthenticated ? 'authenticated' : 'anonymous'
  });
};

export const trackComparisonComplete = (fileType, resultsCount, isAuthenticated = false) => {
  trackEvent('Comparison Complete', {
    fileType,
    resultsCount,
    userType: isAuthenticated ? 'authenticated' : 'anonymous'
  });
};

export const trackSignupPrompt = (trigger) => {
  trackEvent('Signup Prompt Shown', { trigger });
};

export const trackExportAttempt = (exportType, isAuthenticated = false) => {
  trackEvent('Export Attempt', {
    type: exportType,
    userType: isAuthenticated ? 'authenticated' : 'anonymous'
  });
  
  if (!isAuthenticated) {
    trackEvent('Export Blocked', { type: exportType, reason: 'not_authenticated' });
  }
};

export const trackPartnershipEngagement = (action) => {
  trackEvent('Partnership Program', { action });
};

export const trackAuthAction = (action, method = null) => {
  trackEvent('Auth Action', { action, method });
};

export const trackFeatureUsage = (feature, details = {}) => {
  trackEvent('Feature Usage', { feature, ...details });
};
