import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          hd: 'edu' // Restrict to .edu domains
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        // Here you would typically validate against your database
        // For now, we'll just check if it's a .edu email
        if (!credentials.email.endsWith('.edu')) {
          throw new Error('Only .edu email addresses are allowed')
        }

        // Mock user data
        return {
          id: '1',
          name: 'Test User',
          email: credentials.email
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/auth/error'
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only allow .edu email addresses
      if (account?.provider === 'google') {
        return user.email?.endsWith('.edu') ?? false
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 