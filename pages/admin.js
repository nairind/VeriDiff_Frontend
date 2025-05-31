// pages/admin.js - Simple admin page
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only allow specific admin emails - CHANGE THESE TO YOUR EMAIL
    const adminEmails = [
      'your-email@gmail.com',  // ← CHANGE THIS TO YOUR EMAIL
      'admin@yourdomain.com'   // ← ADD MORE ADMIN EMAILS HERE
    ];

    if (!session || !adminEmails.includes(session.user.email)) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      // Get user data
      const usersResponse = await fetch('/api/admin/simple-stats');
      const userData = await usersResponse.json();
      setData(userData);
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
  const adminEmails = ['your-email@gmail.com', 'admin@yourdomain.com']; // Same emails as above
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

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1000px', 
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
          Welcome {session.user.name}! Here's what's happening with your app.
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

      {/* Recent Users */}
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
          Recent Users
        </h2>
        {data?.recentUsers && data.recentUsers.length > 0 ? (
          <div style={{ padding: '1rem' }}>
            {data.recentUsers.map((user, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderBottom: index < data.recentUsers.length - 1 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{user.name}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {user.email}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: user.tier === 'premium' ? '#fef3c7' : '#f0fdf4',
                    color: user.tier === 'premium' ? '#92400e' : '#166534'
                  }}>
                    {user.tier || 'free'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No users found yet. Once people start signing up, they'll appear here!
          </div>
        )}
      </div>

      {/* Simple Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📊 What This Shows You:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151' }}>
          <li><strong>Total Users:</strong> Everyone who's signed up</li>
          <li><strong>This Week:</strong> New signups in the last 7 days</li>
          <li><strong>Premium Users:</strong> People paying for advanced features</li>
          <li><strong>Total Comparisons:</strong> How many times people used your tool</li>
          <li><strong>Recent Users:</strong> Latest people to join</li>
        </ul>
      </div>
    </div>
  );
}
