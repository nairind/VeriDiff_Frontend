// pages/admin/index.js - Enhanced Admin Dashboard with Full Activity Tracking
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

  const getTierBadge = (tier) => {
    const colors = {
      premium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pro: 'bg-purple-100 text-purple-800 border-purple-300',
      free: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[tier?.toLowerCase()] || colors.free;
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enhanced admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🎯 VeriDiff Enhanced Admin Dashboard</h1>
              <p className="text-blue-100">Complete user activity & business intelligence</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30 transition"
              >
                {debugMode ? 'Hide Debug' : 'Show Debug'}
              </button>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-50 transition font-medium"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugMode && (stats || users.length > 0) && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">🔍 Debug Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Stats Data:</h4>
                <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-40">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Users Sample (First 2):</h4>
                <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-40">
                  {JSON.stringify(users.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-green-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.totalUsers}</dd>
                      <dd className="text-sm text-green-600">All signups</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.weeklyUsers}</dd>
                      <dd className="text-sm text-blue-600">New signups</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-yellow-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⭐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</dd>
                      <dd className="text-sm text-yellow-600">Paying customers</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Comparisons</dt>
                      <dd className="text-2xl font-bold text-gray-900">{stats.totalComparisons}</dd>
                      <dd className="text-sm text-purple-600">Tool usage</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced User Activity Table */}
        <div className="bg-white shadow-lg overflow-hidden rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              📈 Detailed User Activity & Business Intelligence
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete user profiles with activity tracking, upgrade opportunities, and contact info
            </p>
          </div>
          
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Analytics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <>
                      {/* Main User Row */}
                      <tr key={user.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'No name provided'}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">📧 {user.email}</div>
                          <div className="text-sm text-gray-500">📞 {user.phone || 'No phone'}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTierBadge(user.tier)}`}>
                            {user.tier || 'free'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined: {formatDate(user.createdAt)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.totalComparisons} total comparisons
                          </div>
                          <div className="text-xs text-gray-500">
                            📗 Excel: {user.excelComparisons} | ⭐ Premium: {user.premiumComparisons}
                          </div>
                          <div className="text-xs text-gray-500">
                            Favorite: {getComparisonTypeDisplay(user.favoriteComparison)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(user.lastActivity)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => toggleUserDetails(user.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {expandedUser === user.id ? 'Hide Activity' : 'View Activity'}
                            </button>
                            <button
                              onClick={() => window.open(`mailto:${user.email}?subject=VeriDiff%20Follow%20Up`)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Activity Details */}
                      {expandedUser === user.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50 border-l-4 border-blue-500">
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                                📊 Detailed Activity for {user.name || user.email}
                              </h4>
                              
                              {/* Activity Breakdown Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-green-200">
                                  <h5 className="text-sm font-medium text-green-800 mb-2">📗 Excel-Excel (Free)</h5>
                                  <div className="text-2xl font-bold text-green-600">{user.excelComparisons}</div>
                                  <div className="text-xs text-green-600">Free comparisons</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                                  <h5 className="text-sm font-medium text-yellow-800 mb-2">⭐ Premium Features</h5>
                                  <div className="text-2xl font-bold text-yellow-600">{user.premiumComparisons}</div>
                                  <div className="text-xs text-yellow-600">Advanced formats</div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                  <h5 className="text-sm font-medium text-purple-800 mb-2">🎯 Most Used</h5>
                                  <div className="text-sm font-bold text-purple-600">
                                    {getComparisonTypeDisplay(user.favoriteComparison)}
                                  </div>
                                  <div className="text-xs text-purple-600">Preferred format</div>
                                </div>
                              </div>
                              
                              {/* Upgrade Opportunity Alert */}
                              {user.tier !== 'premium' && user.premiumComparisons > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="ml-3">
                                      <h3 className="text-sm font-medium text-yellow-800">
                                        💡 High-Priority Upgrade Opportunity!
                                      </h3>
                                      <p className="text-sm text-yellow-700 mt-1">
                                        This user has tried {user.premiumComparisons} premium features but is still on the free tier. 
                                        Perfect candidate for upgrade outreach!
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Recent Activity Feed */}
                              {user.recentActivity && user.recentActivity.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-3">🕒 Recent Activity (Last 10 Actions)</h5>
                                  <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                    {user.recentActivity.map((activity, idx) => (
                                      <div key={idx} className={`p-3 ${idx < user.recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">
                                              {getComparisonTypeDisplay(activity.comparisonType)}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded ${getTierBadge(activity.tier)}`}>
                                              {activity.tier}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {formatDate(activity.timestamp)}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          {activity.files}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {user.recentActivity?.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                  No activity recorded yet. This user hasn't used the comparison tool.
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
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p>Users will appear here as people sign up for VeriDiff.</p>
            </div>
          )}
        </div>

        {/* Instructions Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">🎯 How to Use This Enhanced Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">📊</span>
                <span><strong>Overview Stats:</strong> Track total growth, weekly signups, premium conversions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">👤</span>
                <span><strong>User Profiles:</strong> Complete contact info, tier status, signup dates</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">📈</span>
                <span><strong>Activity Analytics:</strong> Usage patterns, favorite features, engagement levels</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">🎯</span>
                <span><strong>Upgrade Opportunities:</strong> Users trying premium features = sales leads</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">📱</span>
                <span><strong>Contact Integration:</strong> Click "Contact" to send emails directly</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">🕒</span>
                <span><strong>Activity History:</strong> See exactly what users are comparing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
