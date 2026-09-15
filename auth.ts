// ============================================================
// ★ auth.ts — Next-Auth (Auth.js v5) Core Configuration
// ★ SECURITY: All credentials are environment variables only.
//   Never hardcode any secrets here.
// ============================================================

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Session strategy: JWT (no DB required for MVP)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    // Add user id and role to session
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = (token.role as string) || 'free';
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = (user?.email || (token.email as string) || '').trim().toLowerCase();
      if (email) {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        const testerEmails = (process.env.TESTER_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        if (adminEmails.includes(email)) {
          token.role = 'admin';
        } else if (testerEmails.includes(email)) {
          token.role = 'tester';
        } else {
          token.role = 'free';
        }
      }
      return token;
    }
  },

  // Trust the host header (needed for production deployments)
  trustHost: true,
});
