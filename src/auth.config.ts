import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/farmer');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // optionally redirect logged in users away from auth pages
        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
            return Response.redirect(new URL('/', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
