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
    console.log('createOrder called with:', input);

    // Get token from localStorage or cookies
    const token = localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    console.log('Token found:', !!token);

    if (!token) {
      console.log('No token found');
      return { success: false, error: 'Token não encontrado' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('API URL:', apiUrl);

    const response = await fetch(`${apiUrl}/api/shop/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('API error response:', error);
      return { success: false, error: error.message || 'Erro ao criar pedido' };
    }

    const result = await response.json();
    console.log('API success response:', result);
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('createOrder error:', error);
    return { success: false, error: error.message || 'Erro ao criar pedido' };
  }
}