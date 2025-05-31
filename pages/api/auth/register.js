import bcrypt from 'bcryptjs'
import { query } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fullName, email, password } = req.body

  try {
    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await query(`
      INSERT INTO users (
        email, 
        full_name, 
        password_hash, 
        tier, 
        comparisons_used, 
        last_reset_date,
        created_at
      ) VALUES ($1, $2, $3, 'free', 0, CURRENT_DATE, NOW())
      RETURNING id, email, full_name, tier, comparisons_used
    `, [email, fullName, hashedPassword])

    const newUser = result.rows[0]

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        tier: newUser.tier,
        comparisons_used: newUser.comparisons_used
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}
