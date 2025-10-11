import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/src/lib/dbConnect'
import User from '@/src/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        emailOrUsername: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with credentials:', {
          emailOrUsername: credentials?.emailOrUsername,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.emailOrUsername || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        await dbConnect()

        try {
          // Lookup by email OR username
          const user = await User.findOne({
            $or: [
              { email: credentials.emailOrUsername.toLowerCase() },
              { username: credentials.emailOrUsername }
            ]
          })

          console.log('👤 User found:', !!user);

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (!isPasswordValid) {
            return null
          }

          // Update login count and last login time
          await User.findByIdAndUpdate(user._id, {
            $inc: { loginCount: 1 },
            lastLogin: new Date()
          });

          // Trigger workspace generation (async, don't wait for completion)
          fetch(`${process.env.NEXTAUTH_URL}/api/workspace/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id.toString() })
          }).catch(error => {
            console.error('Workspace generation failed:', error);
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? user.username,
            role: user.role,
            sessionVersion: user.sessionVersion || 0,
            mustChangePassword: user.mustChangePassword || false
          } as any
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sessionVersion = user.sessionVersion || 0
        token.mustChangePassword = user.mustChangePassword || false
      }

      // Verify session version and mustChangePassword on each request
      if (token.sub) {
        try {
          await dbConnect()
          const dbUser = await User.findById(token.sub).select('sessionVersion mustChangePassword')
          if (dbUser) {
            // Check session version
            if (dbUser.sessionVersion !== undefined) {
              const tokenVersion = token.sessionVersion as number || 0
              if (tokenVersion < dbUser.sessionVersion) {
                // Session has been invalidated
                console.log('Session invalidated due to version mismatch')
                return {} as any // Return empty token to force sign-out
              }
            }
            // Update mustChangePassword flag in token from DB
            token.mustChangePassword = dbUser.mustChangePassword || false
          }
        } catch (error) {
          console.error('Error checking session version:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).sessionVersion = token.sessionVersion;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
}

export default NextAuth(authOptions)