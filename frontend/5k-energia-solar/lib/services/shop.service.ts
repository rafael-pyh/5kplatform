/**
 * Shop Service
 * Chamadas de API para módulo de Kits/Loja
 */

import api from '../api';
import {
  Kit,
  Product,
  Order,
  PaymentProof,
  CreditWallet,
  CreditTransaction,
  CreditStats,
  WithdrawalRequest,
  PersonDetails,
  CreateOrderDTO,
  CreateOrderResponse,
  CreateWithdrawalDTO,
  UpdateKitItemsDTO,
  ApiResponse,
  PaginatedResponse,
} from '../types/shop.types';

// URLs base para cada recurso
const PRODUCTS_URL = '/shop/products';
const KITS_URL = '/shop/kits';
const ORDERS_URL = '/shop/orders'; // Back to original
const CREDITS_URL = '/shop/credits';
const WITHDRAWALS_URL = '/shop/withdrawals';
const PERSONS_URL = '/person';

export const shopService = {
  // ==================== PRODUTOS ====================

  products: {
    async getAll(): Promise<Product[]> {
      const response = await api.get<ApiResponse<Product[]>>(PRODUCTS_URL);
      return response.data.data || [];
    },

    async getById(id: string): Promise<Product> {
      const response = await api.get<ApiResponse<Product>>(`${PRODUCTS_URL}/${id}`);
      return response.data.data!;
    },

    async create(data: any): Promise<Product> {
      const response = await api.post<ApiResponse<Product>>(PRODUCTS_URL, data);
      return response.data.data!;
    },

    async update(id: string, data: any): Promise<Product> {
      const response = await api.put<ApiResponse<Product>>(`${PRODUCTS_URL}/${id}`, data);
      return response.data.data!;
    },

    async toggleStatus(id: string): Promise<Product> {
      const response = await api.patch<ApiResponse<Product>>(
        `${PRODUCTS_URL}/${id}/toggle-status`
      );
      return response.data.data!;
    },

    async delete(id: string): Promise<void> {
      await api.delete(`${PRODUCTS_URL}/${id}`);
    },
  },

  // ==================== IMAGENS DE PRODUTOS ====================

  productImages: {
    async add(productId: string, formData: FormData): Promise<any> {
      const response = await api.post<ApiResponse<any>>(
        `${PRODUCTS_URL}/${productId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    },

    async remove(productId: string, imageId: string): Promise<void> {
      await api.delete(`${PRODUCTS_URL}/${productId}/images/${imageId}`);
    },

    async reorder(productId: string, images: { id: string; order: number }[]): Promise<void> {
      await api.patch(`${PRODUCTS_URL}/${productId}/images/reorder`, { images });
    },
  },

  // ==================== KITS ====================

  kits: {
    async getAll(): Promise<Kit[]> {
      const response = await api.get<ApiResponse<Kit[]>>(KITS_URL);
      return response.data.data || [];
    },

    async getById(id: string): Promise<Kit> {
      const response = await api.get<ApiResponse<Kit>>(`${KITS_URL}/${id}`);
      return response.data.data!;
    },

    async create(data: any): Promise<Kit> {
      const response = await api.post<ApiResponse<Kit>>(KITS_URL, data);
      return response.data.data!;
    },

    async update(id: string, data: any): Promise<Kit> {
      const response = await api.put<ApiResponse<Kit>>(`${KITS_URL}/${id}`, data);
      return response.data.data!;
    },

    async updateItems(id: string, items: UpdateKitItemsDTO): Promise<Kit> {
      const response = await api.patch<ApiResponse<Kit>>(`${KITS_URL}/${id}/items`, items);
      return response.data.data!;
    },

    async toggleStatus(id: string): Promise<Kit> {
      const response = await api.patch<ApiResponse<Kit>>(
        `${KITS_URL}/${id}/toggle-status`
      );
      return response.data.data!;
    },

    async delete(id: string): Promise<void> {
      await api.delete(`${KITS_URL}/${id}`);
    },

    async uploadImage(id: string, formData: FormData): Promise<any> {
      const response = await api.post<ApiResponse<any>>(
        `${KITS_URL}/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    },
  },

  // ==================== PEDIDOS ====================

  orders: {
    async create(data: CreateOrderDTO): Promise<CreateOrderResponse> {
      const response = await api.post<ApiResponse<CreateOrderResponse>>(ORDERS_URL, data);
      return response.data.data!;
    },

    async getAll(limit = 50, offset = 0, filters?: any): Promise<PaginatedResponse<Order>> {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (filters?.status) params.append('status', filters.status);
      if (filters?.personId) params.append('personId', filters.personId);

      const queryString = params.toString();
      const response = await api.get<{
        success: boolean;
        data: Order[];
        pagination: { total: number; limit: number; offset: number };
      }>(
        `${ORDERS_URL}${queryString ? `?${queryString}` : ''}`
      );
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },

    async getById(id: string): Promise<Order> {
      const response = await api.get<ApiResponse<Order>>(`${ORDERS_URL}/${id}`);
      return response.data.data!;
    },

    async getByCode(orderCode: string): Promise<Order> {
      const response = await api.get<ApiResponse<Order>>(
        `${ORDERS_URL}/code/${orderCode}`
      );
      return response.data.data!;
    },

    async approve(id: string): Promise<Order> {
      const response = await api.post<ApiResponse<Order>>(`${ORDERS_URL}/${id}/approve`);
      return response.data.data!;
    },

    async reject(id: string, reason: string): Promise<Order> {
      const response = await api.post<ApiResponse<Order>>(
        `${ORDERS_URL}/${id}/reject`,
        { rejectionReason: reason }
      );
      return response.data.data!;
    },
  },

  // ==================== COMPROVANTES ====================

  paymentProofs: {
    async upload(orderId: string, formData: FormData): Promise<PaymentProof> {
      const response = await api.post<ApiResponse<PaymentProof>>(
        `${ORDERS_URL}/${orderId}/payment-proofs`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    },

    async getByOrder(orderId: string): Promise<PaymentProof[]> {
      const response = await api.get<ApiResponse<PaymentProof[]>>(
        `${ORDERS_URL}/${orderId}/payment-proofs`
      );
      return response.data.data || [];
    },

    async remove(orderId: string, proofId: string): Promise<void> {
      await api.delete(`${ORDERS_URL}/${orderId}/payment-proofs/${proofId}`);
    },
  },

  // ==================== CRÉDITOS ====================

  credits: {
    async getBalance(): Promise<number> {
      const response = await api.get<ApiResponse<{ balance: number }>>(
        `${CREDITS_URL}/balance`
      );
      return response.data.data?.balance || 0;
    },

    async getWallet(): Promise<CreditWallet> {
      const response = await api.get<ApiResponse<CreditWallet>>(`${CREDITS_URL}/wallet`);
      return response.data.data!;
    },

    async getTransactions(
      limit = 50,
      offset = 0,
      filters?: any
    ): Promise<PaginatedResponse<CreditTransaction>> {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (filters?.type) params.append('type', filters.type);

      const queryString = params.toString();
      const response = await api.get<{
        success: boolean;
        data: CreditTransaction[];
        pagination: { total: number; limit: number; offset: number };
      }>(
        `${CREDITS_URL}/transactions${queryString ? `?${queryString}` : ''}`
      );
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },

    async getStats(): Promise<CreditStats> {
      const response = await api.get<ApiResponse<CreditStats>>(`${CREDITS_URL}/stats`);
      return response.data.data!;
    },

    async adjust(personId: string, amount: number, reason: string): Promise<CreditTransaction> {
      const response = await api.post<ApiResponse<CreditTransaction>>(
        `${CREDITS_URL}/adjust`,
        { personId, amount, reason }
      );
      return response.data.data!;
    },
  },

  // ==================== PESSOAS ====================

  persons: {
    async getDetailsForAdmin(personId: string): Promise<PersonDetails> {
      const response = await api.get<ApiResponse<PersonDetails>>(
        `${PERSONS_URL}/${personId}/admin-details`
      );
      return response.data.data!;
    },
  },

  // ==================== SAQUES ====================

  withdrawals: {
    async request(data: CreateWithdrawalDTO): Promise<WithdrawalRequest> {
      const response = await api.post<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/request`,
        data
      );
      return response.data.data!;
    },

    async getAll(limit = 50, offset = 0): Promise<PaginatedResponse<WithdrawalRequest>> {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await api.get<{
        success: boolean;
        data: WithdrawalRequest[];
        pagination: { total: number; limit: number; offset: number };
      }>(
        `${WITHDRAWALS_URL}?${params.toString()}`
      );
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },

    async getById(id: string): Promise<WithdrawalRequest> {
      const response = await api.get<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/${id}`
      );
      return response.data.data!;
    },

    async cancel(id: string): Promise<WithdrawalRequest> {
      const response = await api.post<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/${id}/cancel`
      );
      return response.data.data!;
    },

    async approve(id: string): Promise<WithdrawalRequest> {
      const response = await api.post<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/${id}/approve`
      );
      return response.data.data!;
    },

    async reject(id: string): Promise<WithdrawalRequest> {
      const response = await api.post<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/${id}/reject`
      );
      return response.data.data!;
    },

    async markAsPaid(id: string): Promise<WithdrawalRequest> {
      const response = await api.post<ApiResponse<WithdrawalRequest>>(
        `${WITHDRAWALS_URL}/${id}/mark-as-paid`
      );
      return response.data.data!;
    },

    async getStats(): Promise<any> {
      const response = await api.get<ApiResponse<any>>(`${WITHDRAWALS_URL}/stats`);
      return response.data.data!;
    },
  },
};
