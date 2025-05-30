import { Resend } from 'resend';
import crypto from 'crypto';
import { query } from '../../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, full_name, phone_number, company_name, job_title, how_heard_about_us, returnUrl } = req.body;

  try {
    // Validate required fields
    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length === 0) {
      // Create new user
      await query(`
        INSERT INTO users (email, full_name, phone_number, company_name, job_title, how_heard_about_us) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [email, full_name, phone_number, company_name, job_title, how_heard_about_us]);
    }

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
      subject: '🔗 Your VeriDiff Magic Link - Sign in instantly',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 2rem; text-align: center; border-radius: 1rem 1rem 0 0;">
            <h1 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 700;">VeriDiff</h1>
            <p style="color: #bfdbfe; margin: 0.5rem 0 0;">Secure file comparison</p>
          </div>
          
          <div style="background: white; padding: 2rem; border-radius: 0 0 1rem 1rem; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Welcome${full_name ? ` ${full_name}` : ''}!</h2>
            
            <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
              Click the button below to sign in to your VeriDiff account. This link will expire in 30 minutes.
            </p>
            
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${magicLinkUrl}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 1rem 2rem; 
                        text-decoration: none; border-radius: 0.5rem; font-weight: 500; font-size: 1.1rem;">
                🔗 Sign In to VeriDiff
              </a>
            </div>
            
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0;">
              <p style="color: #166534; margin: 0; font-size: 0.875rem;">
                🔒 <strong>Privacy First:</strong> Your files are processed locally in your browser - we never see your data.
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 2rem;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
}
