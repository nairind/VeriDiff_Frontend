// pages/admin.js - Enhanced admin dashboard with detailed user activity
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    // Only allow specific admin emails
    const adminEmails = [
      'SALES@VERIDIFF.COM',  // Your email
      'contact@gubithcm.com' // Add more if needed
    ];

    if (!session || !adminEmails.includes(session.user.email)) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      // Get basic stats
      const statsResponse = await fetch('/api/admin/simple-stats');
      const statsData = await statsResponse.json();
      setData(statsData);

      // Get detailed user activity
      const usersResponse = await fetch('/api/admin/detailed-users');
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Not logged in
  if (!session) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Please sign in to access admin panel</h1>
      </div>
    );
  }

  // Not admin
  const adminEmails = ['SALES@VERIDIFF.COM', 'contact@gubithcm.com'];
  if (!adminEmails.includes(session.user.email)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You don't have admin permissions.</p>
        <p>Current email: {session.user.email}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading admin data...</h1>
      </div>
    );
  }

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div style={{ 
      padding: '1rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>VeriDiff Admin Dashboard</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Welcome {session.user.name}! Complete user activity overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '2px solid #22c55e',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>Total Users</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>
            {data?.totalUsers || '0'}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '2px solid #3b82f6',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>This Week</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {data?.weeklyUsers || '0'}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Premium Users</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {data?.premiumUsers || '0'}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b21a8' }}>Total Comparisons</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {data?.totalComparisons || '0'}
          </div>
        </div>
      </div>

      {/* Detailed User Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          padding: '1rem', 
          margin: 0, 
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          📊 Detailed User Activity
        </h2>
        
        {users && users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    User Details
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Contact Info
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Account Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Usage Stats
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Last Activity
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <React.Fragment key={user.id}>
                    {/* Main User Row */}
                    <tr style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc'
                    }}>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {user.name || 'No name'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          ID: {user.id}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          📧 {user.email}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                          📞 {user.phone || 'No phone'}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          background: user.tier === 'premium' ? '#fef3c7' : '#f0fdf4',
                          color: user.tier === 'premium' ? '#92400e' : '#166534'
                        }}>
                          {user.tier || 'free'}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', color: '#2563eb' }}>
                          {user.totalComparisons || 0} comparisons
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          Excel: {user.excelComparisons || 0} | Premium: {user.premiumComparisons || 0}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {user.lastActivity ? new Date(user.lastActivity).toLocaleTimeString() : ''}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleUserDetails(user.id)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          {expandedUser === user.id ? 'Hide Details' : 'View Activity'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan="6" style={{ 
                          padding: '0',
                          background: '#f8fafc',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                          <div style={{ padding: '1rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                              📈 Detailed Activity for {user.name}
                            </h4>
                            
                            {/* Activity Breakdown */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '1rem',
                              marginBottom: '1rem'
                            }}>
                              <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>
                                  Excel-Excel (Free)
                                </h5>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                  {user.excelComparisons || 0}
                                </div>
                              </div>
                              
                              <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>
                                  Premium Features
                                </h5>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                  {user.premiumComparisons || 0}
                                </div>
                              </div>
                              
                              <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6' }}>
                                  Most Used Feature
                                </h5>
                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                  {user.favoriteComparison || 'Excel-Excel'}
                                </div>
                              </div>
                            </div>
                            
                            {/* Recent Activity */}
                            {user.recentActivity && user.recentActivity.length > 0 && (
                              <div>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                                  🕒 Recent Activity (Last 10)
                                </h5>
                                <div style={{ 
                                  maxHeight: '200px', 
                                  overflowY: 'auto',
                                  background: 'white',
                                  borderRadius: '6px',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  {user.recentActivity.map((activity, idx) => (
                                    <div key={idx} style={{
                                      padding: '0.75rem',
                                      borderBottom: idx < user.recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}>
                                      <div>
                                        <span style={{ fontWeight: 'bold' }}>
                                          {activity.comparisonType?.replace('-', ' → ') || 'Unknown'}
                                        </span>
                                        <span style={{
                                          marginLeft: '0.5rem',
                                          padding: '0.125rem 0.375rem',
                                          borderRadius: '3px',
                                          fontSize: '0.7rem',
                                          background: activity.tier === 'premium' ? '#fef3c7' : '#f0fdf4',
                                          color: activity.tier === 'premium' ? '#92400e' : '#166534'
                                        }}>
                                          {activity.tier}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        {new Date(activity.timestamp).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Upgrade Opportunity */}
                            {user.tier !== 'premium' && user.premiumComparisons > 0 && (
                              <div style={{
                                background: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '6px',
                                padding: '1rem',
                                marginTop: '1rem'
                              }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
                                  💡 Upgrade Opportunity!
                                </h5>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                                  This user tried {user.premiumComparisons} premium features but is still on free tier. 
                                  Great candidate for upgrade outreach!
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No users found yet. Once people start signing up, they'll appear here with detailed activity!
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📊 How to Use This Dashboard:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.6' }}>
          <li><strong>Quick Stats:</strong> Overview of total growth and activity</li>
          <li><strong>User Table:</strong> Complete contact info and usage for each user</li>
          <li><strong>"View Activity" Button:</strong> Click to see detailed comparison history</li>
          <li><strong>Upgrade Opportunities:</strong> Users trying premium features = potential customers</li>
          <li><strong>Contact Info:</strong> Email and phone for direct outreach</li>
          <li><strong>Usage Patterns:</strong> See who's actively using your tool</li>
        </ul>
      </div>
    </div>
  );
}
