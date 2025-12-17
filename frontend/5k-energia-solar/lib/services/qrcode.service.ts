import api from '../api';
import { ApiResponse } from '../types';

export const qrcodeService = {
  // Registrar scan de QR Code
  async scanQRCode(qrCode: string): Promise<void> {
    await api.post(`/qrcode/${qrCode}/scan`);
  },

  // Criar lead a partir do QR Code (público)
  async createLeadFromQR(
    qrCode: string,
    data: {
      name: string;
      email: string;
      phone: string;
      energyBillUrl?: string;
      roofPhotoUrl?: string;
    }
  ): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `/qrcode/${qrCode}/lead`,
      data
    );
    return response.data.data;
  },

  // Obter scans do vendedor autenticado
  async getMyScans(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/qrcode/my-scans');
    return response.data.data || [];
  },
};
