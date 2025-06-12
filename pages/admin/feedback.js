import { useState, useEffect } from 'react';

export default function AdminFeedback() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(r => r.json())
      .then(setData);
  }, []);

  // Extract rating from feedback text
  const extractRating = (feedbackText) => {
    const match = feedbackText.match(/(\d+)\/5 stars?/);
    return match ? parseInt(match[1]) : null;
  };

  // Clean feedback text (remove rating part)
  const cleanFeedbackText = (feedbackText) => {
    return feedbackText.replace(/.*?(\d+\/5 stars?):\s*/, '').trim() || 'No additional comments';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    if (!rating) return <span style={{ color: '#9ca3af' }}>No rating</span>;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: '#f59e0b' }}>
          {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
        </span>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          ({rating}/5)
        </span>
      </div>
    );
  };

  if (!data) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>Loading feedback data...</div>
    </div>
  );

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>
          Feedback Dashboard
        </h1>
      </div>
      
      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          background: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e0f2fe'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
            {data.data.stats.totalCount}
          </div>
          <div style={{ color: '#0369a1' }}>Total Feedback</div>
        </div>
        
        <div style={{ 
          background: '#fef3c7', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
            {data.data.stats.averageRating}
          </div>
          <div style={{ color: '#d97706' }}>Average Rating</div>
        </div>
      </div>

      {/* Feedback Table */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: '#f9fafb',
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
            All Feedback
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Date
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  User Type
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Comparison Type
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Rating
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Comments
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Comparisons Done
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.feedback.map((item, index) => {
                const rating = extractRating(item.feedback_text);
                const cleanText = cleanFeedbackText(item.feedback_text);
                
                return (
                  <tr key={item.id} style={{ 
                    borderBottom: index < data.data.feedback.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <td style={{ 
                      padding: '12px', 
                      color: '#6b7280',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatDate(item.created_at)}
                    </td>
                    
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: item.user_type === 'Registered' ? '#fef3c7' : '#dbeafe',
                        color: item.user_type === 'Registered' ? '#d97706' : '#2563eb'
                      }}>
                        {item.user_type === 'Registered' ? '🔐 Registered' : '🆓 Trial'}
                      </span>
                    </td>
                    
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: item.feedback_category === 'PDF' ? '#dcfce7' : '#f3f4f6',
                        color: item.feedback_category === 'PDF' ? '#16a34a' : '#374151'
                      }}>
                        {item.feedback_category === 'PDF' ? '📄 PDF' : '📊 Excel/CSV'}
                      </span>
                    </td>
                    
                    <td style={{ padding: '12px' }}>
                      {renderStars(rating)}
                    </td>
                    
                    <td style={{ 
                      padding: '12px', 
                      maxWidth: '300px',
                      color: '#374151'
                    }}>
                      <div style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {cleanText}
                      </div>
                    </td>
                    
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      {item.comparison_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {data.data.feedback.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '1.125rem', marginBottom: '8px' }}>No feedback yet</div>
          <div>Feedback will appear here once users submit reviews</div>
        </div>
      )}
    </div>
  );
}
