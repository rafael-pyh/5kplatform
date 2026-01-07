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
    role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER';
    createdAt: string;
    updatedAt: string;
    photoBase64?: string;
  };
  error?: string;
}

export async function loginAction(data: LoginData): Promise<LoginResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
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

export async function confirmEmailAction(token: string): Promise<{ message: string }> {
  try {
    // Para server actions, usamos a URL do backend diretamente
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      console.error('[confirmEmailAction] API_URL não está configurada!');
      console.error('[confirmEmailAction] Variáveis disponíveis:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('URL')));
      throw new Error("API_URL não configurada. Verifique variáveis de ambiente.");
    }

    const response = await fetch(`${apiUrl}/api/auth/confirm-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    console.log('[confirmEmailAction] Resposta status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[confirmEmailAction] Erro da API:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || "Erro ao confirmar email");
      } catch (e) {
        throw new Error(`Erro da API (Status ${response.status}): ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('[confirmEmailAction] Sucesso:', result);
    return result.data || result;
  } catch (error: any) {
    console.error('Error in confirmEmailAction:', error);
    throw new Error(error.message || "Erro ao confirmar email");
  }
}

export async function resendVerificationEmailAction(email: string): Promise<{ message: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      console.error('[resendVerificationEmailAction] API_URL não está configurada!');
      throw new Error("API_URL não configurada. Verifique variáveis de ambiente.");
    }

    console.log('[resendVerificationEmailAction] Chamando API:', `${apiUrl}/api/seller/resend-verification-email`);

    const response = await fetch(`${apiUrl}/api/seller/resend-verification-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    console.log('[resendVerificationEmailAction] Resposta status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[resendVerificationEmailAction] Erro da API:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || "Erro ao resolicitar email de verificação");
      } catch (e) {
        throw new Error(`Erro da API (Status ${response.status}): ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('[resendVerificationEmailAction] Sucesso:', result);
    return result.data || result;
  } catch (error: any) {
    console.error('[resendVerificationEmailAction] Erro:', error);
    throw new Error(error.message || "Erro ao resolicitar email de verificação");
  }
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function forgotPasswordAction(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
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
        error: error.message || 'Erro ao solicitar reset de senha',
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: result.data?.message || result.message || 'Email enviado com sucesso',
    };
  } catch (error: any) {
    console.error('[forgotPasswordAction] Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro ao solicitar reset de senha',
    };
  }
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER';
  };
  error?: string;
  message?: string;
}

export async function resetPasswordAction(data: ResetPasswordData): Promise<ResetPasswordResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Erro ao redefinir senha',
      };
    }

    const result = await response.json();
    const { token, user } = result.data || result;

    if (token && user) {
      // Store token in cookie
      const cookieStore = await cookies();
      cookieStore.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return {
      success: true,
      token,
      user,
      message: result.data?.message || 'Senha redefinida com sucesso',
    };
  } catch (error: any) {
    console.error('[resetPasswordAction] Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro ao redefinir senha',
    };
  }
}
