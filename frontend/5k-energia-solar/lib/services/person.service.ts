import api from '../api';
import {
  Person,
  CreatePersonDto,
  UpdatePersonDto,
  PersonStats,
  ApiResponse,
} from '../types';
import { normalizePersonUrls } from '../utils/imageUrl';

export const personService = {
  // Listar todos os vendedores
  async getAll(activeOnly?: boolean): Promise<Person[]> {
    const params = activeOnly ? '?active=true' : '';
    const response = await api.get<ApiResponse<Person[]>>(`/person${params}`);
    const persons = response.data.data || [];
    const normalized = persons.map(normalizePersonUrls);
    return normalized;
  },

  // Buscar vendedor por ID
  async getById(id: string): Promise<Person> {
    const response = await api.get<ApiResponse<Person>>(`/person/${id}`);
    return normalizePersonUrls(response.data.data!);
  },

  // Buscar vendedor por QR Code (público)
  async getByQRCode(qrCode: string): Promise<Person> {
    const response = await api.get<ApiResponse<Person>>(`/person/qr/${qrCode}`);
    return normalizePersonUrls(response.data.data!);
  },

  // Criar novo vendedor
  async create(data: CreatePersonDto): Promise<Person> {
    // Se o usuário estiver autenticado (token presente), cria via rota protegida /person
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
    const endpoint = hasToken ? '/person' : '/manual-register';
    const response = await api.post<ApiResponse<Person>>(endpoint, data);
    return normalizePersonUrls(response.data.data!);
  },

  // Atualizar vendedor
  async update(id: string, data: UpdatePersonDto): Promise<Person> {
    const response = await api.put<ApiResponse<Person>>(`/person/${id}`, data);
    return normalizePersonUrls(response.data.data!);
  },

  // Desativar vendedor
  async deactivate(id: string): Promise<void> {
    await api.delete(`/person/${id}`);
  },

  // Reativar vendedor
  async activate(id: string): Promise<Person> {
    const response = await api.put<ApiResponse<Person>>(`/person/${id}/activate`);
    return normalizePersonUrls(response.data.data!);
  },

  // Obter estatísticas do vendedor
  async getStats(id: string): Promise<PersonStats> {
    const response = await api.get<ApiResponse<PersonStats>>(`/person/${id}/stats`);
    return response.data.data!;
  },
};
