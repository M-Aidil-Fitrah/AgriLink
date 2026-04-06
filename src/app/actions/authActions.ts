'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export type AuthState = { error?: string; success?: boolean } | null | undefined;

export async function registerUser(prevState: AuthState, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'USER' | 'FARMER' | 'ADMIN';

    if (!name || !email || !password || !role) {
      return { error: 'Missing fields' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        // @ts-ignore: Prisma TS Server cache issue for password field
        password: hashedPassword,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

export async function logout() {
  await signOut();
}
