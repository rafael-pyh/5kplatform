import api from '../api';
import { ApiResponse } from '../types';

export const uploadService = {
  // Upload de foto de perfil do vendedor - retorna base64
  async uploadProfilePhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ base64: string }>>(
      '/upload/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.base64;
  },

  // Upload de conta de energia - retorna base64
  async uploadEnergyBill(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ base64: string }>>(
      '/upload/energy-bill',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.base64;
  },

  // Upload de foto do telhado - retorna base64
  async uploadRoofPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ base64: string }>>(
      '/upload/roof',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.base64;
  },
};
