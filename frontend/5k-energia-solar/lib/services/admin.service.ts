import api from '../api';
import { User, CreateAdminDto, UpdateAdminDto, ApiResponse } from '../types';

export const adminService = {
  // Listar todos os administradores
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/auth/users');
    return response.data.data || [];
  },

  // Buscar administrador por ID
  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/auth/users/${id}`);
    return response.data.data!;
  },

  // Criar novo administrador (apenas admin)
  async create(data: CreateAdminDto): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/admin/users', data);
    return response.data.data!;
  },

  // Atualizar administrador
  async update(id: string, data: UpdateAdminDto): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/auth/users/${id}`, data);
    return response.data.data!;
  },

  // Deletar administrador
  async delete(id: string): Promise<void> {
    await api.delete(`/auth/users/${id}`);
  },
};
