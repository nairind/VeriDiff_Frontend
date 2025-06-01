// pages/admin/index.js - Visually Enhanced Admin Dashboard (Functionality Preserved)
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

  const getTierBadge = (tier) => {
    const colors = {
      premium: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-lg',
      pro: 'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900 shadow-lg',
      free: 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-900 shadow-lg'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-blue-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl animate-pulse">📊</div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading Enhanced Dashboard</p>
          <p className="text-sm text-gray-500">Analyzing user activity & business intelligence...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ✨ ENHANCED: Stunning Header with Glass Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                  <span className="text-3xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    VeriDiff Analytics
                  </h1>
                  <p className="text-blue-100 text-lg font-medium">
                    Complete User Activity & Business Intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right mr-4">
                  <p className="text-white font-medium">{session.user.email}</p>
                  <p className="text-blue-200 text-sm">Admin Dashboard</p>
                </div>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 font-medium"
                >
                  {debugMode ? '🔍 Hide Debug' : '🔍 Debug'}
                </button>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ PRESERVED: Error Display with Enhanced Styling */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ PRESERVED: Debug Information with Enhanced Styling */}
        {debugMode && (stats || users.length > 0) && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔍</span> Debug Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-lg">📊 Stats Data:</h4>
                <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-4 rounded-lg border max-h-48 font-mono">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-lg">👥 Users Sample:</h4>
                <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-4 rounded-lg border max-h-48 font-mono">
                  {JSON.stringify(users.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ✨ ENHANCED: Beautiful Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Users',
                value: stats.totalUsers,
                subtitle: 'All signups',
                icon: '👥',
                gradient: 'from-emerald-400 to-emerald-600',
                bgGradient: 'from-emerald-50 to-emerald-100',
                iconBg: 'bg-emerald-500'
              },
              {
                title: 'This Week',
                value: stats.weeklyUsers,
                subtitle: 'New signups',
                icon: '📅',
                gradient: 'from-blue-400 to-blue-600',
                bgGradient: 'from-blue-50 to-blue-100',
                iconBg: 'bg-blue-500'
              },
              {
                title: 'Premium Users',
                value: stats.premiumUsers,
                subtitle: 'Paying customers',
                icon: '⭐',
                gradient: 'from-yellow-400 to-yellow-600',
                bgGradient: 'from-yellow-50 to-yellow-100',
                iconBg: 'bg-yellow-500'
              },
              {
                title: 'Total Comparisons',
                value: stats.totalComparisons,
                subtitle: 'Tool usage',
                icon: '📊',
                gradient: 'from-purple-400 to-purple-600',
                bgGradient: 'from-purple-50 to-purple-100',
                iconBg: 'bg-purple-500'
              }
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      {stat.title}
                    </p>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{stat.subtitle}</p>
                  </div>
                  <div className={`w-16 h-16 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl text-white">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✨ ENHANCED: Stunning User Activity Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  User Activity & Business Intelligence
                </h3>
                <p className="text-gray-600 font-medium">
                  Complete user profiles with activity tracking and upgrade opportunities
                </p>
              </div>
            </div>
          </div>
          
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {[
                      'User Profile',
                      'Contact Info', 
                      'Account Status',
                      'Usage Analytics',
                      'Last Activity',
                      'Actions'
                    ].map((header, idx) => (
                      <th key={idx} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user, index) => (
                    <>
                      {/* ✨ ENHANCED: Beautiful User Row */}
                      <tr key={user.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900">
                                {user.name || 'No name provided'}
                              </div>
                              <div className="text-sm text-gray-500 font-medium">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <span className="mr-2">📧</span>
                              <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="mr-2">📞</span>
                              <span>{user.phone || 'No phone'}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="space-y-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getTierBadge(user.tier)}`}>
                              {user.tier || 'free'}
                            </span>
                            <div className="text-xs text-gray-500 font-medium">
                              Joined: {formatDate(user.createdAt)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-gray-900">
                              {user.totalComparisons} comparisons
                            </div>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                📗 {user.excelComparisons}
                              </span>
                              <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                ⭐ {user.premiumComparisons}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Favorite: {getComparisonTypeDisplay(user.favoriteComparison)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(user.lastActivity)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => toggleUserDetails(user.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              {expandedUser === user.id ? '🔼 Hide Activity' : '🔽 View Activity'}
                            </button>
                            <button
                              onClick={() => window.open(`mailto:${user.email}?subject=VeriDiff%20Follow%20Up`)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              📧 Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* ✨ ENHANCED: Beautiful Expanded Activity Details */}
                      {expandedUser === user.id && (
                        <tr>
                          <td colSpan="6" className="px-8 py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500">
                            <div className="space-y-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                  <span className="text-white text-xl">📊</span>
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">
                                  Detailed Activity for {user.name || user.email}
                                </h4>
                              </div>
                              
                              {/* ✨ ENHANCED: Beautiful Activity Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300">
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                                      <span className="text-white text-xl">📗</span>
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-green-800">Excel-Excel (Free)</h5>
                                      <p className="text-sm text-green-600">Free comparisons</p>
                                    </div>
                                  </div>
                                  <div className="text-4xl font-bold text-green-600 mb-2">{user.excelComparisons}</div>
                                  <div className="w-full bg-green-100 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{width: user.totalComparisons > 0 ? `${(user.excelComparisons / user.totalComparisons) * 100}%` : '0%'}}></div>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-200 hover:shadow-xl transition-all duration-300">
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                                      <span className="text-white text-xl">⭐</span>
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-yellow-800">Premium Features</h5>
                                      <p className="text-sm text-yellow-600">Advanced formats</p>
                                    </div>
                                  </div>
                                  <div className="text-4xl font-bold text-yellow-600 mb-2">{user.premiumComparisons}</div>
                                  <div className="w-full bg-yellow-100 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" style={{width: user.totalComparisons > 0 ? `${(user.premiumComparisons / user.totalComparisons) * 100}%` : '0%'}}></div>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300">
                                  <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                                      <span className="text-white text-xl">🎯</span>
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-purple-800">Most Used</h5>
                                      <p className="text-sm text-purple-600">Preferred format</p>
                                    </div>
                                  </div>
                                  <div className="text-lg font-bold text-purple-600 mb-2">
                                    {getComparisonTypeDisplay(user.favoriteComparison)}
                                  </div>
                                  <div className="text-sm text-purple-500">Primary choice</div>
                                </div>
                              </div>
                              
                              {/* ✅ PRESERVED: Upgrade Opportunity Alert with Enhanced Styling */}
                              {user.tier !== 'premium' && user.premiumComparisons > 0 && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                      <span className="text-white text-lg">💡</span>
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-yellow-800">
                                        🎯 High-Priority Upgrade Opportunity!
                                      </h3>
                                      <p className="text-yellow-700 mt-1 font-medium">
                                        This user has tried <span className="font-bold">{user.premiumComparisons}</span> premium features but is still on the free tier. 
                                        Perfect candidate for upgrade outreach!
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* ✨ ENHANCED: Beautiful Recent Activity Feed */}
                              {user.recentActivity && user.recentActivity.length > 0 && (
                                <div>
                                  <h5 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="mr-2">🕒</span> Recent Activity (Last 10 Actions)
                                  </h5>
                                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                                    {user.recentActivity.map((activity, idx) => (
                                      <div key={idx} className={`p-4 ${idx < user.recentActivity.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors duration-200`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                              <span className="text-white text-sm">📊</span>
                                            </div>
                                            <div>
                                              <span className="text-lg font-semibold text-gray-900">
                                                {getComparisonTypeDisplay(activity.comparisonType)}
                                              </span>
                                              <span className={`ml-3 px-3 py-1 text-xs rounded-full font-bold ${getTierBadge(activity.tier)}`}>
                                                {activity.tier}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="text-sm text-gray-500 font-medium">
                                            {formatDate(activity.timestamp)}
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2 ml-11 font-medium">
                                          📁 {activity.files}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {user.recentActivity?.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
                                  <div className="text-6xl mb-4">📊</div>
                                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                                  <p className="text-gray-600">This user hasn't used the comparison tool yet.</p>
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
            <div className="px-8 py-16 text-center">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Users Found</h3>
              <p className="text-gray-600 text-lg">Users will appear here as people sign up for VeriDiff.</p>
            </div>
          )}
        </div>

        {/* ✨ ENHANCED: Beautiful Instructions Panel */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-900">How to Use This Enhanced Dashboard</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
            <div className="space-y-4">
              {[
                { icon: '📊', title: 'Overview Stats', desc: 'Track total growth, weekly signups, premium conversions' },
                { icon: '👤', title: 'User Profiles', desc: 'Complete contact info, tier status, signup dates' },
                { icon: '📈', title: 'Activity Analytics', desc: 'Usage patterns, favorite features, engagement levels' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-4 bg-white bg-opacity-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-bold text-lg">{item.title}:</span>
                    <span className="ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { icon: '🎯', title: 'Upgrade Opportunities', desc: 'Users trying premium features = sales leads' },
                { icon: '📱', title: 'Contact Integration', desc: 'Click "Contact" to send emails directly' },
                { icon: '🕒', title: 'Activity History', desc: 'See exactly what users are comparing' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-4 bg-white bg-opacity-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <span className="font-bold text-lg">{item.title}:</span>
                    <span className="ml-2">{item.desc}</span>
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
