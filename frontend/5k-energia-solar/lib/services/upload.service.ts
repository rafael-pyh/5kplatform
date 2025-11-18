import api from '../api';
import { ApiResponse } from '../types';

export const uploadService = {
  // Upload de foto de perfil do vendedor
  async uploadProfilePhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/upload/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.url;
  },

  // Upload de conta de energia
  async uploadEnergyBill(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/upload/energy-bill',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.url;
  },

  // Upload de foto do telhado
  async uploadRoofPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>(
      '/upload/roof',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.url;
  },
};
