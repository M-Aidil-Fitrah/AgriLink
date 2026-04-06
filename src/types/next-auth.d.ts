import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'FARMER' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'USER' | 'FARMER' | 'ADMIN';
  }
}
