import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { query } from '../../../lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
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

          if (!user || !user.password_hash) {
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
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tier = user.tier
        token.comparisons_used = user.comparisons_used
      }
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.id
      session.user.tier = token.tier
      session.user.comparisons_used = token.comparisons_used
      return session
    }
  }
}

export default NextAuth(authOptions)
