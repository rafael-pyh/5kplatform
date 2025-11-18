'use server';

import { cookies } from 'next/headers';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export async function loginAction(data: LoginData): Promise<LoginResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Erro ao fazer login',
      };
    }

    const result = await response.json();

    // O backend retorna { success: true, data: { token, user } }
    const { token, user } = result.data || result;

    if (!token || !user) {
      return {
        success: false,
        error: 'Dados de autenticação incompletos',
      };
    }

    // Salvar token nos cookies (httpOnly para segurança)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return {
      success: true,
      token,
      user,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Erro ao conectar com o servidor',
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}
