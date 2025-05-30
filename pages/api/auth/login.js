import { Resend } from 'resend';
import crypto from 'crypto';
import { query } from '../../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, returnUrl } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Store magic link
    await query(`
      INSERT INTO magic_links (email, token, expires_at) 
      VALUES ($1, $2, $3)
    `, [email, token, expiresAt]);

    // Send magic link email
    const magicLinkUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}&returnUrl=${encodeURIComponent(returnUrl || '/compare')}`;
    
    await resend.emails.send({
      from: 'VeriDiff <noreply@veridiff.com>',
      to: email,
      subject: '🔗 Your VeriDiff Sign In Link',
      html: `<!-- Your email template -->`
    });

    res.status(200).json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
}
