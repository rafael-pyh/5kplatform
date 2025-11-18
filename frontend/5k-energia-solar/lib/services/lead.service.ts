import api from '../api';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadStatus,
  LeadFilters,
  ApiResponse,
} from '../types';

export const leadService = {
  // Listar todos os leads (admin)
  async getAll(filters?: LeadFilters): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ownerId) params.append('ownerId', filters.ownerId);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const response = await api.get<ApiResponse<Lead[]>>(
      `/lead${queryString ? `?${queryString}` : ''}`
    );
    return response.data.data || [];
  },

  // Listar leads de um vendedor específico
  async getByOwner(ownerId: string): Promise<Lead[]> {
    const response = await api.get<ApiResponse<Lead[]>>(`/lead/owner/${ownerId}`);
    return response.data.data || [];
  },

  // Buscar lead por ID
  async getById(id: string): Promise<Lead> {
    const response = await api.get<ApiResponse<Lead>>(`/lead/${id}`);
    return response.data.data!;
  },

  // Criar novo lead
  async create(data: CreateLeadDto): Promise<Lead> {
    const response = await api.post<ApiResponse<Lead>>('/lead', data);
    return response.data.data!;
  },

  // Atualizar status do lead
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const response = await api.patch<ApiResponse<Lead>>(`/lead/${id}/status`, {
      status,
    });
    return response.data.data!;
  },

  // Atualizar lead completo
  async update(id: string, data: UpdateLeadDto): Promise<Lead> {
    const response = await api.put<ApiResponse<Lead>>(`/lead/${id}`, data);
    return response.data.data!;
  },

  // Deletar lead
  async delete(id: string): Promise<void> {
    await api.delete(`/lead/${id}`);
  },

  // Obter novos leads (últimos 7 dias)
  async getNewLeads(): Promise<Lead[]> {
    const response = await api.get<ApiResponse<Lead[]>>('/lead/new');
    return response.data.data || [];
  },

  // Obter estatísticas de leads
  async getStats(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/lead/stats');
    return response.data.data!;
  },
};
