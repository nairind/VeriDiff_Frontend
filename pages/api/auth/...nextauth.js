import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { query } from '../../../lib/db'
import bcrypt from 'bcryptjs'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const result = await query('SELECT * FROM users WHERE email = $1', [credentials.email])
          const user = result.rows[0]

          if (!user) {
            return null
          }

          // Check password
          const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash)
          
          if (!passwordMatch) {
            return null
          }

          // Update last login
          await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.full_name,
            tier: user.tier,
            comparisons_used: user.comparisons_used
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  
  adapter: {
    async createUser(user) {
      const hashedPassword = await bcrypt.hash(user.password, 12)
      
      const result = await query(`
        INSERT INTO users (email, full_name, password_hash, tier, comparisons_used, created_at)
        VALUES ($1, $2, $3, 'free', 0, NOW())
        RETURNING *
      `, [user.email, user.name, hashedPassword])
      
      const newUser = result.rows[0]
      return {
        id: newUser.id.toString(),
        email: newUser.email,
        name: newUser.full_name,
        emailVerified: newUser.email_verified
      }
    },
    
    async getUser(id) {
      const result = await query('SELECT * FROM users WHERE id = $1', [id])
      const user = result.rows[0]
      if (!user) return null
      
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.full_name,
        emailVerified: user.email_verified
      }
    },
    
    async getUserByEmail(email) {
      const result = await query('SELECT * FROM users WHERE email = $1', [email])
      const user = result.rows[0]
      if (!user) return null
      
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.full_name,
        emailVerified: user.email_verified
      }
    },
    
    async getUserByAccount({ providerAccountId, provider }) {
      const result = await query(`
        SELECT u.* FROM users u
        JOIN accounts a ON u.id = a.user_id
        WHERE a.provider = $1 AND a.provider_account_id = $2
      `, [provider, providerAccountId])
      
      const user = result.rows[0]
      if (!user) return null
      
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.full_name,
        emailVerified: user.email_verified
      }
    },
    
    async updateUser(user) {
      const result = await query(`
        UPDATE users 
        SET full_name = $1, email_verified = $2
        WHERE id = $3
        RETURNING *
      `, [user.name, user.emailVerified, user.id])
      
      const updatedUser = result.rows[0]
      return {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        name: updatedUser.full_name,
        emailVerified: updatedUser.email_verified
      }
    },
    
    async linkAccount(account) {
      await query(`
        INSERT INTO accounts (
          user_id, type, provider, provider_account_id,
          refresh_token, access_token, expires_at, token_type, scope, id_token
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        account.userId, account.type, account.provider, account.providerAccountId,
        account.refresh_token, account.access_token, account.expires_at,
        account.token_type, account.scope, account.id_token
      ])
    },
    
    async createSession({ sessionToken, userId, expires }) {
      await query(`
        INSERT INTO sessions (session_token, user_id, expires)
        VALUES ($1, $2, $3)
      `, [sessionToken, userId, expires])
      
      return { sessionToken, userId, expires }
    },
    
    async getSessionAndUser(sessionToken) {
      const result = await query(`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = $1 AND s.expires > NOW()
      `, [sessionToken])
      
      const row = result.rows[0]
      if (!row) return null
      
      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id.toString(),
          expires: row.expires
        },
        user: {
          id: row.id.toString(),
          email: row.email,
          name: row.full_name,
          emailVerified: row.email_verified
        }
      }
    },
    
    async updateSession({ sessionToken, expires }) {
      await query(`
        UPDATE sessions 
        SET expires = $1 
        WHERE session_token = $2
      `, [expires, sessionToken])
      
      return { sessionToken, expires }
    },
    
    async deleteSession(sessionToken) {
      await query('DELETE FROM sessions WHERE session_token = $1', [sessionToken])
    }
  },
  
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  
  callbacks: {
    async session({ session, user }) {
      // Add user data to session
      const result = await query('SELECT * FROM users WHERE id = $1', [user.id])
      const userData = result.rows[0]
      
      session.user.id = user.id
      session.user.tier = userData?.tier || 'free'
      session.user.comparisons_used = userData?.comparisons_used || 0
      
      return session
    }
  }
})
