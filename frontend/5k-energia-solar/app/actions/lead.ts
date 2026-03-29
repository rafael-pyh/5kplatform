'use server';

export interface CreateLeadData {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function createLeadFromQR(
  qrCode: string,
  data: CreateLeadData
): Promise<CreateLeadResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${apiUrl}/api/qrcode/lead/${qrCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Erro ao cadastrar lead',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Create lead error:', error);
    return {
      success: false,
      error: error.message || 'Erro ao cadastrar lead',
    };
  }
}

export async function scanQRCode(qrCode: string): Promise<CreateLeadResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${apiUrl}/api/qrcode/scan/${qrCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'QR Code inválido',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Scan QR error:', error);
    return {
      success: false,
      error: error.message || 'Erro ao validar QR Code',
    };
  }
}
