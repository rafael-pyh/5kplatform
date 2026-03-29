/**
 * API client functions for Shop operations
 * Client-side API calls using fetch
 */

export async function createOrder(input: {
  kitId: string;
  useCredit?: boolean;
  notes?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    console.error('createOrder error:', error);
    return { success: false, error: error.message || 'Erro ao criar pedido' };
  }
}