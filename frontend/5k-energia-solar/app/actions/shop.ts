'use server';

import { cookies } from 'next/headers';

/**
 * Ações do servidor para Shop/Kits
 * Usadas para operações que requerem token ou processamento no servidor
 */

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export async function uploadPaymentProof(
  orderId: string,
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/orders/${orderId}/payment-proofs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao enviar comprovante' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao enviar comprovante' };
  }
}

export async function createOrder(input: {
  kitId: string;
  useCredit?: boolean;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao criar pedido' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao criar pedido' };
  }
}

export async function requestWithdrawal(input: {
  amount: number;
  bankAccountInfo?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/withdrawals/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao solicitar saque' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao solicitar saque' };
  }
}

export async function cancelWithdrawal(id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/withdrawals/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao cancelar saque' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao cancelar saque' };
  }
}

// ==================== ADMIN ====================

export async function approveOrder(id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/orders/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao aprovar pedido' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao aprovar pedido' };
  }
}

export async function rejectOrder(id: string, reason: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/orders/${id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao rejeitar pedido' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao rejeitar pedido' };
  }
}

export async function approveWithdrawal(id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/withdrawals/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao aprovar saque' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao aprovar saque' };
  }
}

export async function rejectWithdrawal(id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/withdrawals/${id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao rejeitar saque' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao rejeitar saque' };
  }
}

export async function markWithdrawalAsPaid(id: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/shop/withdrawals/${id}/mark-as-paid`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Erro ao marcar saque como pago' };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao marcar saque como pago',
    };
  }
}
