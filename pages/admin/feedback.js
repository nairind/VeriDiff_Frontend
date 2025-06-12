// pages/admin/feedback.js - Admin Feedback Dashboard
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminFeedback() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUserType, setFilterUserType] = useState('all');

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback data');
      
      const result = await response.json();
      setFeedbackData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const filteredFeedback = feedbackData?.feedback?.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.feedback_category.toLowerCase() === filterCategory.toLowerCase();
    const userTypeMatch = filterUserType === 'all' || item.user_type.toLowerCase() === filterUserType.toLowerCase();
    return categoryMatch && userTypeMatch;
  }) || [];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading feedback data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Feedback Management - VeriDiff Admin</title>
        <meta name="description" content="VeriDiff Admin Feedback Dashboard" />
      </Head>

      <div style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>💬</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
                VeriDiff Feedback Management
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                User feedback analysis and insights
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={fetchFeedbackData}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Total Feedback */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1.5rem'
                }}>💬</div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {feedbackData?.stats?.totalCount || 0}
                  </div>
                  <div style={{ opacity: 0.9 }}>Total Feedback</div>
                </div>
              </div>
            </div>

            {/* Recent Feedback */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1.5rem'
                }}>📅</div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {feedbackData?.stats?.recentCount || 0}
                  </div>
                  <div style={{ opacity: 0.9 }}>This Week</div>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1.5rem'
                }}>⭐</div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {feedbackData?.stats?.averageRating || '0.0'}
                  </div>
                  <div style={{ opacity: 0.9 }}>Average Rating</div>
                </div>
              </div>
            </div>

            {/* Response Rate */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1.5rem'
                }}>📊</div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {feedbackData?.stats?.responseRate || 0}%
                  </div>
                  <div style={{ opacity: 0.9 }}>Response Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category & User Type Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Feedback Categories */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                📋 Feedback Categories
              </h3>
              {feedbackData?.categoryBreakdown?.map((category, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < feedbackData.categoryBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <span style={{ color: '#374151' }}>{category.category}</span>
                  <span style={{
                    background: '#f3f4f6',
                    color: '#1f2937',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>

            {/* User Type Breakdown */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
                👥 User Type Breakdown
              </h3>
              {feedbackData?.userTypeBreakdown?.map((userType, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < feedbackData.userTypeBreakdown.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}>
                  <span style={{ color: '#374151' }}>
                    {userType.user_type === 'Registered' ? '🔐' : '🆓'} {userType.user_type}
                  </span>
                  <span style={{
                    background: userType.user_type === 'Registered' ? '#dbeafe' : '#fef3c7',
                    color: userType.user_type === 'Registered' ? '#2563eb' : '#d97706',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {userType.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: '500', color: '#374151' }}>🔍 Filters:</span>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Categories</option>
                <option value="pdf">PDF</option>
                <option value="excel/csv">Excel/CSV</option>
                <option value="general">General</option>
              </select>

              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">All Users</option>
                <option value="registered">Registered</option>
                <option value="trial">Trial</option>
              </select>

              <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.875rem' }}>
                Showing {filteredFeedback.length} of {feedbackData?.feedback?.length || 0} feedback items
              </span>
            </div>
          </div>

          {/* Recent Feedback List */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              📝 Recent Feedback
            </h3>

            {filteredFeedback.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <div>No feedback found matching your filters</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Feedback</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>User Type</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Rating</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Comparisons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedback.map((item, index) => (
                      <tr key={item.id} style={{
                        borderBottom: index < filteredFeedback.length - 1 ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.875rem' }}>
                          {formatDate(item.created_at)}
                        </td>
                        <td style={{ padding: '12px', maxWidth: '300px' }}>
                          <div style={{ color: '#1f2937' }}>
                            {truncateText(item.feedback_text)}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: item.feedback_category === 'PDF' ? '#dbeafe' : 
                                       item.feedback_category === 'Excel/CSV' ? '#d1fae5' : '#f3f4f6',
                            color: item.feedback_category === 'PDF' ? '#2563eb' : 
                                   item.feedback_category === 'Excel/CSV' ? '#059669' : '#374151'
                          }}>
                            {item.feedback_category}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: item.user_type === 'Registered' ? '#fef3c7' : '#f0f9ff',
                            color: item.user_type === 'Registered' ? '#d97706' : '#0369a1'
                          }}>
                            {item.user_type === 'Registered' ? '🔐' : '🆓'} {item.user_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.rating ? (
                            <span style={{ color: '#f59e0b' }}>
                              {'⭐'.repeat(item.rating)} ({item.rating}/5)
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>No rating</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>
                          {item.comparison_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
