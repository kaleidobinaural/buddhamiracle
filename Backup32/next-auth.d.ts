// ============================================================
// ★ next-auth.d.ts — NextAuth Type Augmentation
// Extends the built-in Session/User types to include
// `role` and `id` fields used throughout the app.
// ============================================================

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
