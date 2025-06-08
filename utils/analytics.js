// /utils/analytics.js
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
