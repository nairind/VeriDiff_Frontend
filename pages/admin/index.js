// pages/admin/index.js - Enhanced Dashboard with Inline Styles (No Tailwind CSS Required)
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function EnhancedAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  // ✅ PRESERVED: All original functionality
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching enhanced admin data...');
      
      // Fetch basic stats
      const statsResponse = await fetch('/api/admin/simple-stats');
      if (!statsResponse.ok) throw new Error(`Stats API error: ${statsResponse.status}`);
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch detailed user activity
      const usersResponse = await fetch('/api/admin/detailed-users');
      if (!usersResponse.ok) throw new Error(`Users API error: ${usersResponse.status}`);
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);
      
      console.log('✅ Enhanced data loaded successfully');
      
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierBadgeStyle = (tier) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    };
    
    switch (tier?.toLowerCase()) {
      case 'premium':
        return { ...baseStyle, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#92400e' };
      case 'pro':
        return { ...baseStyle, background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: '#6b21a8' };
      default:
        return { ...baseStyle, background: 'linear-gradient(135deg, #9ca3af, #6b7280)', color: '#374151' };
    }
  };

  const getComparisonTypeDisplay = (type) => {
    const types = {
      'excel-excel': 'Excel → Excel',
      'csv-csv': 'CSV → CSV',
      'pdf-pdf': 'PDF → PDF',
      'excel-csv': 'Excel → CSV',
      'pdf-excel': 'PDF → Excel'
    };
    return types[type] || type?.replace('-', ' → ') || 'Unknown';
  };

  // Inline styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
    color: 'white',
    padding: '2rem 0',
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
  };

  const headerContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  };

  const debugButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    backdropFilter: 'blur(10px)'
  };

  const refreshButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#2563eb'
  };

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const tableContainerStyle = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0'
  };

  const tableHeaderStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'top'
  };

  const actionButtonStyle = {
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
  };

  const viewButtonStyle = {
    ...actionButtonStyle,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white'
  };

  const contactButtonStyle = {
    ...actionButtonStyle,
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Loading Enhanced Dashboard</h3>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
            Analyzing user activity & business intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={containerStyle}>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .table-container {
            overflow-x: auto;
          }
        }
      `}</style>

      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContainerStyle} className="header-container">
          <div style={logoStyle}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>🎯</span>
            </div>
            <div>
              <h1 style={{
                margin: '0',
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                VeriDiff Analytics
              </h1>
              <p style={{
                margin: '0',
                fontSize: '1.1rem',
                opacity: '0.9',
                fontWeight: '500'
              }}>
                Complete User Activity & Business Intelligence
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right', marginRight: '1rem', display: 'none' }}>
              <p style={{ margin: '0', fontWeight: '600' }}>{session.user.email}</p>
              <p style={{ margin: '0', fontSize: '0.875rem', opacity: '0.8' }}>Admin Dashboard</p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              style={debugButtonStyle}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              {debugMode ? '🔍 Hide Debug' : '🔍 Debug'}
            </button>
            <button
              onClick={fetchData}
              style={refreshButtonStyle}
              onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
              onMouseOut={(e) => e.target.style.background = 'white'}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={mainStyle}>
        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fca5a5',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ color: 'white', fontSize: '18px' }}>⚠</span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontWeight: '600' }}>
                  Error Loading Data
                </h3>
                <p style={{ margin: '0', color: '#b91c1c' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugMode && (stats || users.length > 0) && (
          <div style={{
            marginBottom: '2rem',
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#374151',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>🔍</span> Debug Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#6b7280' }}>
                  📊 Stats Data:
                </h4>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#4b5563',
                  overflow: 'auto',
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  maxHeight: '200px',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#6b7280' }}>
                  👥 Users Sample:
                </h4>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#4b5563',
                  overflow: 'auto',
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  maxHeight: '200px',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(users.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div style={statsGridStyle} className="stats-grid">
            {[
              {
                title: 'Total Users',
                value: stats.totalUsers,
                subtitle: 'All signups',
                icon: '👥',
                gradient: 'linear-gradient(135deg, #10b981, #059669)',
                bgGradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
              },
              {
                title: 'This Week',
                value: stats.weeklyUsers,
                subtitle: 'New signups',
                icon: '📅',
                gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                bgGradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
              },
              {
                title: 'Premium Users',
                value: stats.premiumUsers,
                subtitle: 'Paying customers',
                icon: '⭐',
                gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                bgGradient: 'linear-gradient(135deg, #fef3c7, #fde68a)'
              },
              {
                title: 'Total Comparisons',
                value: stats.totalComparisons,
                subtitle: 'Tool usage',
                icon: '📊',
                gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                bgGradient: 'linear-gradient(135deg, #e9d5ff, #ddd6fe)'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="stat-card"
                style={{
                  ...statCardStyle,
                  background: stat.bgGradient,
                  border: '1px solid rgba(255,255,255,0.5)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {stat.title}
                    </p>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      background: stat.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: '1.2',
                      marginBottom: '0.25rem'
                    }}>
                      {stat.value}
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {stat.subtitle}
                    </p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: stat.gradient,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{ fontSize: '24px', filter: 'brightness(0) invert(1)' }}>
                      {stat.icon}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Activity Table */}
        <div style={tableContainerStyle} className="table-container">
          <div style={tableHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px', filter: 'brightness(0) invert(1)' }}>📈</span>
              </div>
              <div>
                <h3 style={{
                  margin: '0',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#374151'
                }}>
                  User Activity & Business Intelligence
                </h3>
                <p style={{
                  margin: '0',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Complete user profiles with activity tracking and upgrade opportunities
                </p>
              </div>
            </div>
          </div>
          
          {users && users.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {[
                      'User Profile',
                      'Contact Info', 
                      'Account Status',
                      'Usage Analytics',
                      'Last Activity',
                      'Actions'
                    ].map((header, idx) => (
                      <th key={idx} style={thStyle}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <>
                      {/* User Row */}
                      <tr key={user.id} style={{ 
                        background: index % 2 === 0 ? 'white' : '#fafbfc',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc'}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: '700',
                              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                            }}>
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.25rem'
                              }}>
                                {user.name || 'No name provided'}
                              </div>
                              <div style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                fontWeight: '500'
                              }}>
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.875rem',
                              color: '#374151',
                              fontWeight: '500'
                            }}>
                              <span style={{ marginRight: '0.5rem' }}>📧</span>
                              {user.email}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.875rem',
                              color: '#6b7280'
                            }}>
                              <span style={{ marginRight: '0.5rem' }}>📞</span>
                              {user.phone || 'No phone'}
                            </div>
                          </div>
                        </td>
                        
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={getTierBadgeStyle(user.tier)}>
                              {user.tier || 'free'}
                            </span>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>
                              Joined: {formatDate(user.createdAt)}
                            </div>
                          </div>
                        </td>
                        
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{
                              fontSize: '1.125rem',
                              fontWeight: '700',
                              color: '#374151'
                            }}>
                              {user.totalComparisons} comparisons
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.5rem',
                                background: '#dcfce7',
                                color: '#166534',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                📗 {user.excelComparisons}
                              </span>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.5rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                ⭐ {user.premiumComparisons}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontWeight: '500'
                            }}>
                              Favorite: {getComparisonTypeDisplay(user.favoriteComparison)}
                            </div>
                          </div>
                        </td>
                        
                        <td style={tdStyle}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151'
                          }}>
                            {formatDate(user.lastActivity)}
                          </div>
                        </td>
                        
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              onClick={() => toggleUserDetails(user.id)}
                              className="action-button"
                              style={viewButtonStyle}
                              onMouseOver={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                                e.target.style.transform = 'translateY(-2px)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                                e.target.style.transform = 'none';
                              }}
                            >
                              {expandedUser === user.id ? '🔼 Hide Activity' : '🔽 View Activity'}
                            </button>
                            <button
                              onClick={() => window.open(`mailto:${user.email}?subject=VeriDiff%20Follow%20Up`)}
                              className="action-button"
                              style={contactButtonStyle}
                              onMouseOver={(e) => {
                                e.target.style.background = '#e5e7eb';
                                e.target.style.transform = 'translateY(-2px)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = '#f3f4f6';
                                e.target.style.transform = 'none';
                              }}
                            >
                              📧 Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Activity Details */}
                      {expandedUser === user.id && (
                        <tr>
                          <td colSpan="6" style={{
                            padding: '2rem',
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            borderLeft: '4px solid #3b82f6'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <span style={{ fontSize: '20px', filter: 'brightness(0) invert(1)' }}>📊</span>
                                </div>
                                <h4 style={{
                                  margin: '0',
                                  fontSize: '1.5rem',
                                  fontWeight: '700',
                                  color: '#374151'
                                }}>
                                  Detailed Activity for {user.name || user.email}
                                </h4>
                              </div>
                              
                              {/* Activity Cards */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                              }}>
                                <div style={{
                                  background: 'white',
                                  padding: '1.5rem',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                  border: '1px solid #dcfce7'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span style={{ fontSize: '16px', filter: 'brightness(0) invert(1)' }}>📗</span>
                                    </div>
                                    <div>
                                      <h5 style={{
                                        margin: '0',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#166534'
                                      }}>
                                        Excel-Excel (Free)
                                      </h5>
                                      <p style={{
                                        margin: '0',
                                        fontSize: '0.875rem',
                                        color: '#059669'
                                      }}>
                                        Free comparisons
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {user.excelComparisons}
                                  </div>
                                  <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: '#dcfce7',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: user.totalComparisons > 0 ? `${(user.excelComparisons / user.totalComparisons) * 100}%` : '0%',
                                      height: '100%',
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      borderRadius: '4px'
                                    }}></div>
                                  </div>
                                </div>
                                
                                <div style={{
                                  background: 'white',
                                  padding: '1.5rem',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                  border: '1px solid #fef3c7'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span style={{ fontSize: '16px', filter: 'brightness(0) invert(1)' }}>⭐</span>
                                    </div>
                                    <div>
                                      <h5 style={{
                                        margin: '0',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#92400e'
                                      }}>
                                        Premium Features
                                      </h5>
                                      <p style={{
                                        margin: '0',
                                        fontSize: '0.875rem',
                                        color: '#d97706'
                                      }}>
                                        Advanced formats
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '700',
                                    color: '#f59e0b',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {user.premiumComparisons}
                                  </div>
                                  <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: '#fef3c7',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: user.totalComparisons > 0 ? `${(user.premiumComparisons / user.totalComparisons) * 100}%` : '0%',
                                      height: '100%',
                                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                      borderRadius: '4px'
                                    }}></div>
                                  </div>
                                </div>
                                
                                <div style={{
                                  background: 'white',
                                  padding: '1.5rem',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                  border: '1px solid #e9d5ff'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span style={{ fontSize: '16px', filter: 'brightness(0) invert(1)' }}>🎯</span>
                                    </div>
                                    <div>
                                      <h5 style={{
                                        margin: '0',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#6b21a8'
                                      }}>
                                        Most Used
                                      </h5>
                                      <p style={{
                                        margin: '0',
                                        fontSize: '0.875rem',
                                        color: '#7c3aed'
                                      }}>
                                        Preferred format
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                    color: '#8b5cf6',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {getComparisonTypeDisplay(user.favoriteComparison)}
                                  </div>
                                  <div style={{
                                    fontSize: '0.875rem',
                                    color: '#7c3aed'
                                  }}>
                                    Primary choice
                                  </div>
                                </div>
                              </div>
                              
                              {/* Upgrade Opportunity */}
                              {user.tier !== 'premium' && user.premiumComparisons > 0 && (
                                <div style={{
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                                  borderLeft: '4px solid #f59e0b',
                                  borderRadius: '8px',
                                  padding: '1.5rem',
                                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                      width: '50px',
                                      height: '50px',
                                      background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                                    }}>
                                      <span style={{ fontSize: '20px', filter: 'brightness(0) invert(1)' }}>💡</span>
                                    </div>
                                    <div>
                                      <h3 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#92400e'
                                      }}>
                                        🎯 High-Priority Upgrade Opportunity!
                                      </h3>
                                      <p style={{
                                        margin: '0',
                                        color: '#b45309',
                                        fontWeight: '500',
                                        lineHeight: '1.5'
                                      }}>
                                        This user has tried <span style={{ fontWeight: '700' }}>{user.premiumComparisons}</span> premium features but is still on the free tier. 
                                        Perfect candidate for upgrade outreach!
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Recent Activity */}
                              {user.recentActivity && user.recentActivity.length > 0 && (
                                <div>
                                  <h5 style={{
                                    margin: '0 0 1rem 0',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: '#374151',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    <span style={{ marginRight: '0.5rem' }}>🕒</span> Recent Activity (Last 10 Actions)
                                  </h5>
                                  <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb',
                                    maxHeight: '400px',
                                    overflowY: 'auto'
                                  }}>
                                    {user.recentActivity.map((activity, idx) => (
                                      <div key={idx} style={{
                                        padding: '1rem',
                                        borderBottom: idx < user.recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        transition: 'background-color 0.3s ease'
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                      >
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                              width: '32px',
                                              height: '32px',
                                              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                              borderRadius: '8px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}>
                                              <span style={{ fontSize: '14px', filter: 'brightness(0) invert(1)' }}>📊</span>
                                            </div>
                                            <div>
                                              <span style={{
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                color: '#374151'
                                              }}>
                                                {getComparisonTypeDisplay(activity.comparisonType)}
                                              </span>
                                              <span style={{
                                                ...getTierBadgeStyle(activity.tier),
                                                marginLeft: '0.75rem',
                                                fontSize: '0.75rem'
                                              }}>
                                                {activity.tier}
                                              </span>
                                            </div>
                                          </div>
                                          <div style={{
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            fontWeight: '500'
                                          }}>
                                            {formatDate(activity.timestamp)}
                                          </div>
                                        </div>
                                        <div style={{
                                          fontSize: '0.875rem',
                                          color: '#6b7280',
                                          marginTop: '0.5rem',
                                          marginLeft: '3rem',
                                          fontWeight: '500'
                                        }}>
                                          📁 {activity.files}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {user.recentActivity?.length === 0 && (
                                <div style={{
                                  textAlign: 'center',
                                  padding: '3rem 2rem',
                                  background: 'white',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                                  <h3 style={{
                                    margin: '0 0 0.5rem 0',
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                  }}>
                                    No Activity Yet
                                  </h3>
                                  <p style={{
                                    margin: '0',
                                    color: '#6b7280'
                                  }}>
                                    This user hasn't used the comparison tool yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📊</div>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#374151'
              }}>
                No Users Found
              </h3>
              <p style={{
                margin: '0',
                color: '#6b7280',
                fontSize: '1.125rem'
              }}>
                Users will appear here as people sign up for VeriDiff.
              </p>
            </div>
          )}
        </div>

        {/* Instructions Panel */}
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
          border: '1px solid #93c5fd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px', filter: 'brightness(0) invert(1)' }}>🎯</span>
            </div>
            <h3 style={{
              margin: '0',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e3a8a'
            }}>
              How to Use This Enhanced Dashboard
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            color: '#1e40af'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '📊', title: 'Overview Stats', desc: 'Track total growth, weekly signups, premium conversions' },
                { icon: '👤', title: 'User Profiles', desc: 'Complete contact info, tier status, signup dates' },
                { icon: '📈', title: 'Activity Analytics', desc: 'Usage patterns, favorite features, engagement levels' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#3b82f6',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '18px', filter: 'brightness(0) invert(1)' }}>{item.icon}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{item.title}:</span>
                    <span style={{ marginLeft: '0.5rem' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🎯', title: 'Upgrade Opportunities', desc: 'Users trying premium features = sales leads' },
                { icon: '📱', title: 'Contact Integration', desc: 'Click "Contact" to send emails directly' },
                { icon: '🕒', title: 'Activity History', desc: 'See exactly what users are comparing' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#6366f1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '18px', filter: 'brightness(0) invert(1)' }}>{item.icon}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{item.title}:</span>
                    <span style={{ marginLeft: '0.5rem' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
