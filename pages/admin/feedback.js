import { useState, useEffect } from 'react';

export default function AdminFeedback() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📊 Feedback Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Stats</h2>
        <p>Total: {data.data.stats.totalCount}</p>
        <p>Average Rating: {data.data.stats.averageRating}</p>
      </div>

      <div>
        <h2>Recent Feedback</h2>
        {data.data.feedback.map(item => (
          <div key={item.id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '10px 0' 
          }}>
            <strong>{item.feedback_category} - {item.user_type}</strong>
            <p>{item.feedback_text}</p>
            <small>{new Date(item.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
