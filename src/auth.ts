import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  // @ts-expect-error NextAuth v5 adapter typing limitation with Prisma
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        type PrismaUserWithPassword = {
          id: string;
          name: string | null;
          email: string | null;
          password?: string | null;
          role: 'USER' | 'FARMER' | 'ADMIN';
        };

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        }) as PrismaUserWithPassword | null;

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as 'USER' | 'FARMER' | 'ADMIN';
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});
