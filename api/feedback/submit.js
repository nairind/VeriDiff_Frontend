import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, feedback_type, feedback_text, selected_reasons } = req.body;

  try {
    await query(`
      INSERT INTO user_feedback (email, feedback_type, feedback_text, selected_reasons)
      VALUES ($1, $2, $3, $4)
    `, [email, feedback_type, feedback_text, selected_reasons]);

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}
