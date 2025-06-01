// pages/admin/setup.js - Web-based database setup for GitHub + Vercel users
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DatabaseSetupPage() {
  const { data: session } = useSession();
  const [setupStatus, setSetupStatus] = useState('ready');
  const [setupLog, setSetupLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Admin check
  const adminEmails = ['SALES@VERIDIFF.COM', 'contact@gubithcm.com'];
  const isAdmin = session && adminEmails.includes(session.user.email);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setSetupLog(prev => [...prev, { timestamp, message, type }]);
  };

  const runDatabaseSetup = async () => {
    setIsRunning(true);
    setSetupStatus('running');
    setSetupLog([]);
    
    addLog('🔧 Starting VeriDiff database setup...', 'info');

    try {
      // Call our setup API
      const response = await fetch('/api/admin/database-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        addLog('✅ Database setup completed successfully!', 'success');
        setSetupStatus('success');
        
        // Show what was accomplished
        if (result.steps) {
          result.steps.forEach(step => {
            addLog(`✅ ${step}`, 'success');
          });
        }
        
        addLog('🎉 Your admin dashboard is now fully functional!', 'success');
        addLog('📊 User activity tracking is enabled', 'success');
        addLog('📈 Detailed analytics are ready', 'success');
        
      } else {
        addLog(`❌ Setup failed: ${result.error}`, 'error');
        setSetupStatus('error');
        
        if (result.details) {
          addLog(`Details: ${result.details}`, 'error');
        }
      }

    } catch (error) {
      addLog(`❌ Setup error: ${error.message}`, 'error');
      setSetupStatus('error');
    }

    setIsRunning(false);
  };

  const testDatabaseConnection = async () => {
    addLog('🧪 Testing database connection...', 'info');
    
    try {
      const response = await fetch('/api/admin/database-test');
      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Database connection successful', 'success');
        addLog(`📊 Found ${result.userCount} users in database`, 'info');
        addLog(`📈 Found ${result.analyticsCount} analytics records`, 'info');
      } else {
        addLog(`⚠️ Database test failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Test error: ${error.message}`, 'error');
    }
  };

  if (!session) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Please sign in to access database setup</h1>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>Only administrators can access database setup.</p>
        <p>Current email: {session.user.email}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
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
        <h1 style={{ margin: 0, fontSize: '2rem' }}>VeriDiff Database Setup</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Set up analytics tracking and detailed user data
        </p>
      </div>

      {/* Setup Status */}
      <div style={{
        background: setupStatus === 'success' ? '#f0fdf4' : 
                   setupStatus === 'error' ? '#fef2f2' : 
                   setupStatus === 'running' ? '#eff6ff' : '#f8fafc',
        border: `2px solid ${setupStatus === 'success' ? '#22c55e' : 
                               setupStatus === 'error' ? '#ef4444' : 
                               setupStatus === 'running' ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          color: setupStatus === 'success' ? '#166534' : 
                 setupStatus === 'error' ? '#dc2626' : 
                 setupStatus === 'running' ? '#1e40af' : '#374151'
        }}>
          {setupStatus === 'ready' && '🚀 Ready to Set Up Database'}
          {setupStatus === 'running' && '⏳ Setting Up Database...'}
          {setupStatus === 'success' && '✅ Database Setup Complete!'}
          {setupStatus === 'error' && '❌ Setup Failed'}
        </h3>

        {setupStatus === 'ready' && (
          <div>
            <p style={{ margin: '0 0 1rem 0' }}>
              This will set up the analytics database tables needed for detailed user tracking.
            </p>
            <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem' }}>
              <li>Create analytics table for user activity tracking</li>
              <li>Add phone number field to users table</li>
              <li>Set up database indexes for better performance</li>
              <li>Enable detailed admin dashboard functionality</li>
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={runDatabaseSetup}
            disabled={isRunning}
            style={{
              background: isRunning ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {isRunning ? '⏳ Setting Up...' : '🚀 Run Database Setup'}
          </button>

          <button
            onClick={testDatabaseConnection}
            disabled={isRunning}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🧪 Test Database
          </button>
        </div>
      </div>

      {/* Setup Log */}
      {setupLog.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Setup Log:</h3>
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '6px'
          }}>
            {setupLog.map((log, index) => (
              <div key={index} style={{
                color: log.type === 'error' ? '#dc2626' : 
                       log.type === 'success' ? '#059669' : '#374151',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#6b7280' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📋 Instructions:</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.6' }}>
          <li><strong>Click "Run Database Setup"</strong> to create the required tables</li>
          <li><strong>Wait for completion</strong> - this usually takes 10-30 seconds</li>
          <li><strong>Test the connection</strong> to verify everything works</li>
          <li><strong>Go back to your admin dashboard</strong> to see the enhanced features</li>
        </ol>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          background: '#dbeafe',
          borderRadius: '6px'
        }}>
          <strong style={{ color: '#1e40af' }}>💡 Pro Tip:</strong>
          <span style={{ color: '#1e40af' }}> After setup, your admin dashboard will show detailed user activity, upgrade opportunities, and complete analytics!</span>
        </div>
      </div>
    </div>
  );
}
