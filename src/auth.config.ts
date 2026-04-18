import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = [
        '/admin',
        '/dashboard/profil',
        '/dashboard/favorit',
        '/dashboard/pesanan',
        '/dashboard/checkout',
        '/dashboard/ajukan-seller',
        '/dashboard/notifikasi',
        '/dashboard/farmer-produk'
      ];
      const isProtected = protectedPaths.some((p) => nextUrl.pathname.startsWith(p));

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      }

      if (isLoggedIn) {
        // Redirect logged-in users away from auth pages back to home
        if (nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')) {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
