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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Determine redirect target based on role
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    const redirectTo = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email atau kata sandi salah.';
        default:
          return 'Terjadi kesalahan. Silakan coba lagi.';
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
    // Role is always USER on registration
    const role = 'USER' as const;

    if (!name || !email || !password) {
      return { error: 'Semua field wajib diisi' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email sudah terdaftar' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Terjadi kesalahan server' };
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
