/**
 * Enums e Constantes do Módulo de Kits / Loja
 */

// Re-exportar enums dos models
export { OrderStatus } from '../models/Order';
export { CreditTransactionType } from '../models/CreditTransaction';
export { WithdrawalStatus } from '../models/WithdrawalRequest';

/**
 * Constantes de negócio
 */
export const SHOP_CONSTANTS = {
  // Limites
  MAX_PRODUCT_IMAGES: 10,
  MAX_KIT_ITEMS: 50,
  MAX_PAYMENT_PROOFS_PER_ORDER: 5,

  // Valores mínimos/máximos
  MIN_PRODUCT_PRICE: 0.01,
  MIN_KIT_PRICE: 0.01,
  MIN_WITHDRAWAL_AMOUNT: 10.00,
  MAX_WITHDRAWAL_AMOUNT: 50000.00,

  // Uploads
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PROOF_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_PROOF_MIMES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],

  // Paginação padrão
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 500,

  // MinIO folders
  PRODUCTS_FOLDER: 'products',
  KITS_FOLDER: 'kits',
  PAYMENT_PROOFS_FOLDER: 'payment-proofs',
};

/**
 * Mensagens de erro comuns
 */
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Produto não encontrado',
  KIT_NOT_FOUND: 'Kit não encontrado',
  ORDER_NOT_FOUND: 'Pedido não encontrado',
  PAYMENT_PROOF_NOT_FOUND: 'Comprovante não encontrado',
  INVALID_PRICE: 'Preço deve ser maior que zero',
  INVALID_QUANTITY: 'Quantidade deve ser maior que zero',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  INVALID_ORDER_STATUS: 'Status do pedido inválido',
  PAYMENT_PROOF_REQUIRED: 'Comprovante de pagamento é obrigatório',
  CREDIT_PAYMENT_NO_PROOF_REQUIRED: 'Pagamento com créditos não requer comprovante',
};

/**
 * Mensagens de sucesso comuns
 */
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Produto criado com sucesso',
  PRODUCT_UPDATED: 'Produto atualizado com sucesso',
  PRODUCT_DELETED: 'Produto deletado com sucesso',
  KIT_CREATED: 'Kit criado com sucesso',
  KIT_UPDATED: 'Kit atualizado com sucesso',
  KIT_DELETED: 'Kit deletado com sucesso',
  ORDER_CREATED: 'Pedido criado com sucesso',
  ORDER_APPROVED: 'Pedido aprovado com sucesso',
  ORDER_REJECTED: 'Pedido rejeitado com sucesso',
  PAYMENT_PROOF_UPLOADED: 'Comprovante enviado com sucesso',
  WITHDRAWAL_REQUESTED: 'Saque solicitado com sucesso',
  WITHDRAWAL_APPROVED: 'Saque aprovado com sucesso',
  WITHDRAWAL_REJECTED: 'Saque rejeitado com sucesso',
};
