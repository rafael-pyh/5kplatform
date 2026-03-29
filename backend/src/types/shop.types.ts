/**
 * Tipos e Interfaces do Módulo de Kits / Loja
 * Reutilizáveis em Controllers, Services e DTOs
 */

import { OrderStatus } from '../models/Order';
import { CreditTransactionType } from '../models/CreditTransaction';
import { WithdrawalStatus } from '../models/WithdrawalRequest';

// ============== PRODUCT TYPES ==============

export interface CreateProductDTO {
  name: string;
  price: number;
  userId: string;
  description?: string;
  sku?: string;
  stock?: number;
  tags?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
  tags?: string;
  active?: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stock?: number;
  tags?: string;
  active: boolean;
  images?: ProductImageResponse[];
  imagesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  order: number;
  description?: string;
}

export interface ProductListResponse {
  total: number;
  limit: number;
  offset: number;
  data: ProductResponse[];
}

// ============== KIT TYPES ==============

export interface CreateKitItemInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateKitDTO {
  name: string;
  price: number;
  userId: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string;
  items: CreateKitItemInput[];
}

export interface UpdateKitDTO {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  imageUrl?: string;
  tags?: string;
  active?: boolean;
}

export interface KitItemResponse {
  id: string;
  productId: string;
  productName?: string;
  productPrice?: number;
  quantity: number;
  notes?: string;
}

export interface KitResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string;
  active: boolean;
  items?: KitItemResponse[];
  itemsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitListResponse {
  total: number;
  limit: number;
  offset: number;
  data: KitResponse[];
}

// ============== ORDER TYPES ==============

export interface CreateOrderDTO {
  kitId: string;
  useCredit?: boolean;
  notes?: string;
}

export interface OrderPersonInfo {
  id: string;
  name: string;
  email?: string;
  pixKey?: string;
}

export interface OrderKitInfo {
  id: string;
  name: string;
  price: number;
  items?: KitItemResponse[];
}

export interface OrderProductInfo {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface PaymentProofResponse {
  id: string;
  fileUrl: string;
  fileType: 'image' | 'pdf';
  originalFileName?: string;
  fileSize?: number;
  createdAt: Date;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  person?: OrderPersonInfo;
  kit?: OrderKitInfo;
  product?: OrderProductInfo;
  totalPrice: number;
  status: OrderStatus;
  usesCredit: boolean;
  notes?: string;
  paymentProofs?: PaymentProofResponse[];
  approvedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListResponse {
  total: number;
  limit: number;
  offset: number;
  data: Array<{
    id: string;
    orderCode: string;
    personName?: string;
    kitName?: string;
    totalPrice: number;
    status: OrderStatus;
    usesCredit: boolean;
    hasPaymentProofs: boolean;
    createdAt: Date;
  }>;
}

export interface ApproveOrderDTO {
  approvedByUserId: string;
}

export interface RejectOrderDTO {
  rejectionReason: string;
}

// ============== CREDIT TYPES ==============

export interface CreditWalletResponse {
  id: string;
  balance: number;
  lastTransactionAt?: Date;
}

export interface CreditWalletDetailResponse extends CreditWalletResponse {
  personName?: string;
  personId?: string;
  createdAt: Date;
}

export interface CreditTransactionResponse {
  id: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  orderId?: string;
  withdrawalRequestId?: string;
  createdAt: Date;
}

export interface CreditTransactionListResponse {
  total: number;
  limit: number;
  offset: number;
  data: CreditTransactionResponse[];
}

export interface CreditStatsResponse {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction?: Date;
}

export interface AdjustCreditsDTO {
  personId: string;
  amount: number;
  reason: string;
}

// ============== WITHDRAWAL TYPES ==============

export interface CreateWithdrawalDTO {
  amount: number;
  bankAccountInfo?: string;
  notes?: string;
}

export interface WithdrawalPersonInfo {
  id: string;
  name: string;
  email?: string;
  pixKey?: string;
}

export interface WithdrawalResponse {
  id: string;
  person?: WithdrawalPersonInfo;
  amount: number;
  status: WithdrawalStatus;
  bankAccountInfo?: string;
  notes?: string;
  approvedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: Date;
  rejectedBy?: {
    id: string;
    name: string;
  };
  rejectedAt?: Date;
  rejectionReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalListResponse {
  total: number;
  limit: number;
  offset: number;
  data: Array<{
    id: string;
    personName?: string;
    personEmail?: string;
    amount: number;
    status: WithdrawalStatus;
    bankAccountInfo?: string;
    approvedAt?: Date;
    approvedByName?: string;
    paidAt?: Date;
    createdAt: Date;
  }>;
}

export interface WithdrawalStatsResponse {
  totalRequests: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  rejectedCount: number;
}

export interface ApproveWithdrawalDTO {
  approvedByUserId: string;
}

export interface RejectWithdrawalDTO {
  rejectionReason: string;
}

// ============== PAGINATION ==============

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

// ============== ERROR RESPONSE ==============

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ============== FILTERS ==============

export interface ProductFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  active?: boolean;
}

export interface KitFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  active?: boolean;
}

export interface OrderFilters {
  personId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface TransactionFilters {
  type?: CreditTransactionType;
  startDate?: Date;
  endDate?: Date;
}

export interface WithdrawalFilters {
  personId?: string;
  status?: WithdrawalStatus;
  startDate?: Date;
  endDate?: Date;
}

// ============== USER CONTEXT ==============

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'AFFILIATE';
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Express.Request {
  user?: AuthenticatedUser;
}
