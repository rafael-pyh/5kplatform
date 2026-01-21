/**
 * Tipos para módulo de Kits/Shop
 */

// ==================== PRODUTOS ====================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  active: boolean;
  tags?: string; // From API: comma-separated string
  images?: ProductImage[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  order: number;
  description?: string;
  createdAt: string | Date;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stock?: number;
  tags?: string; // Sent to API: comma-separated string
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  description?: string;
  sku?: string;
  stock?: number;
  tags?: string; // Sent to API: comma-separated string
}

// ==================== KITS ====================

export interface Kit {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  tags?: string; // From API: comma-separated string
  active: boolean;
  imageUrl?: string;
  items: KitItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface KitItem {
  id: string;
  kitId: string;
  productId: string;
  quantity: number;
  notes?: string;
  product?: Product;
}

export interface CreateKitDTO {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  tags?: string; // Sent to API: comma-separated string
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface UpdateKitDTO {
  name?: string;
  price?: number;
  description?: string;
  sku?: string;
  tags?: string; // Sent to API: comma-separated string
}

export interface UpdateKitItemsDTO {
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
}

// ==================== PEDIDOS ====================

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface Order {
  id: string;
  orderCode: string;
  personId: string;
  kitId: string;
  totalPrice: number;
  status: OrderStatus;
  usesCredit: boolean;
  notes?: string;
  approvedByUserId?: string;
  approvedAt?: string | Date;
  rejectionReason?: string;
  paymentProofs?: PaymentProof[];
  kit?: Kit;
  person?: {
    id: string;
    name: string;
    email: string;
    pixKey?: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  // Campos adicionais retornados pela API de listagem
  personName?: string;
  kitName?: string;
  hasPaymentProofs?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOrderDTO {
  kitId: string;
  useCredit?: boolean;
  notes?: string;
}

export interface CreateOrderResponse {
  id: string;
  orderCode: string;
  status: string;
  totalPrice: number;
  usesCredit: boolean;
  createdAt: string;
}

// ==================== COMPROVANTE DE PAGAMENTO ====================

export type PaymentProofType = 'image' | 'pdf';

export interface PaymentProof {
  id: string;
  orderId: string;
  fileUrl: string;
  fileType: PaymentProofType;
  originalFileName: string;
  fileSize: number;
  createdAt: string | Date;
}

// ==================== CRÉDITOS ====================

export interface CreditWallet {
  id: string;
  personId: string;
  balance: number;
  lastTransactionAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export enum CreditTransactionType {
  COMMISSION = 'COMMISSION',
  KIT_PURCHASE = 'KIT_PURCHASE',
  WITHDRAW_REQUEST = 'WITHDRAW_REQUEST',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface CreditTransaction {
  id: string;
  personId: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  orderId?: string;
  withdrawalRequestId?: string;
  adjustedByUserId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreditStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction?: string | Date;
}

// ==================== SAQUES ====================

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface WithdrawalRequest {
  id: string;
  personId: string;
  amount: number;
  status: WithdrawalStatus;
  bankAccountInfo?: string;
  notes?: string;
  approvedByUserId?: string;
  approvedAt?: string | Date;
  rejectedByUserId?: string;
  rejectedAt?: string | Date;
  paidAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateWithdrawalDTO {
  amount: number;
  bankAccountInfo?: string;
  notes?: string;
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
