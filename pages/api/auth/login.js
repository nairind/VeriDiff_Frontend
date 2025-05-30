import { Resend } from 'resend';
import crypto from 'crypto';
import { query } from '../../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    email, 
    full_name, 
    phone_number, 
    company_name, 
    job_title, 
    how_heard_about_us, 
    returnUrl 
  } = req.body;

  try {
    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Check if user exists
    let user;
    let isNewUser = false;
    
    try {
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (existingUser.rows.length === 0) {
        // New user - validate required registration fields
        if (!full_name) {
          return res.status(400).json({ error: 'Full name is required for new users' });
        }
        
        // Create new user
        const newUserResult = await query(`
          INSERT INTO users (email, full_name, phone_number, company_name, job_title, how_heard_about_us, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
          RETURNING *
        `, [email, full_name, phone_number, company_name, job_title, how_heard_about_us]);
        
        user = newUserResult.rows[0];
        isNewUser = true;
      } else {
        // Existing user
        user = existingUser.rows[0];
        isNewUser = false;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Store magic link
    try {
      await query(`
        INSERT INTO magic_links (email, token, expires_at) 
        VALUES ($1, $2, $3)
      `, [email, token, expiresAt]);
    } catch (linkError) {
      console.error('Magic link storage error:', linkError);
      return res.status(500).json({ error: 'Failed to create magic link' });
    }

    // Prepare magic link URL
    const magicLinkUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}&returnUrl=${encodeURIComponent(returnUrl || '/compare')}`;
    
    // Send email
    try {
      await resend.emails.send({
        from: 'VeriDiff <sales@veridiff.com>',
        to: email,
        subject: isNewUser ? '🎉 Welcome to VeriDiff - Your Magic Link' : '🔗 Your VeriDiff Sign In Link',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 2rem; text-align: center; border-radius: 1rem 1rem 0 0;">
              <h1 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 700;">VeriDiff</h1>
              <p style="color: #bfdbfe; margin: 0.5rem 0 0;">${isNewUser ? 'Welcome to VeriDiff!' : 'Welcome back!'}</p>
            </div>
            
            <div style="background: white; padding: 2rem; border-radius: 0 0 1rem 1rem; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-bottom: 1rem;">Hi ${user.full_name || 'there'}!</h2>
              
              <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
                ${isNewUser 
                  ? 'Thanks for signing up! Click the button below to access your VeriDiff account.' 
                  : 'Click the button below to sign in to your VeriDiff account.'
                } This link will expire in 30 minutes.
              </p>
              
              <div style="text-align: center; margin: 2rem 0;">
                <a href="${magicLinkUrl}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 1rem 2rem; 
                          text-decoration: none; border-radius: 0.5rem; font-weight: 500; font-size: 1.1rem;">
                  🔗 ${isNewUser ? 'Access VeriDiff' : 'Sign In to VeriDiff'}
                </a>
              </div>
              
              <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0;">
                <p style="color: #166534; margin: 0; font-size: 0.875rem;">
                  🔒 <strong>Privacy First:</strong> Your files are processed locally in your browser - we never see your data.
                </p>
              </div>
              
              ${isNewUser ? `
                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin: 1.5rem 0;">
                  <p style="color: #92400e; margin: 0; font-size: 0.875rem;">
                    🚀 <strong>Get Started:</strong> Once signed in, you can compare up to 5 files per month with advanced features!
                  </p>
                </div>
              ` : ''}
              
              <p style="color: #9ca3af; font-size: 0.875rem; margin-top: 2rem;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ 
      message: 'Magic link sent successfully',
      isNewUser,
      user: {
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
