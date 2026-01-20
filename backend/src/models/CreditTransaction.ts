import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { Person } from './Person';
import { Order } from './Order';
import { WithdrawalRequest } from './WithdrawalRequest';

/**
 * Tipo de Transação de Crédito
 * COMMISSION: Comissão por venda
 * KIT_PURCHASE: Compra de kit com créditos
 * WITHDRAW_REQUEST: Saque de créditos
 * ADJUSTMENT: Ajuste manual (admin)
 */
export enum CreditTransactionType {
  COMMISSION = 'COMMISSION',
  KIT_PURCHASE = 'KIT_PURCHASE',
  WITHDRAW_REQUEST = 'WITHDRAW_REQUEST',
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * CreditTransaction Model
 * Ledger de todas as transações de crédito
 * Implementa padrão de extrato - NUNCA alterar saldo diretamente
 * Cada transação é imutável
 */
@Table({
  tableName: 'CreditTransaction',
  timestamps: true,
})
export class CreditTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Person)
  @Column({
    type: DataType.UUID,
    field: 'personId',
  })
  personId!: string;

  @BelongsTo(() => Person, 'personId')
  person?: Person;

  /**
   * Tipo de transação
   */
  @Column(DataType.ENUM(...Object.values(CreditTransactionType)))
  type!: CreditTransactionType;

  /**
   * Valor da transação (positivo ou negativo)
   * Positivo: adição de crédito
   * Negativo: débito de crédito
   */
  @Column(DataType.DECIMAL(15, 2))
  amount!: number;

  /**
   * Descrição da transação (ex: "Comissão do pedido ABC123")
   */
  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  /**
   * Referência ao pedido (se aplicável)
   */
  @AllowNull(true)
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    field: 'orderId',
  })
  orderId?: string;

  @BelongsTo(() => Order, 'orderId')
  order?: Order;

  /**
   * Referência ao saque (se aplicável)
   */
  @AllowNull(true)
  @ForeignKey(() => WithdrawalRequest)
  @Column({
    type: DataType.UUID,
    field: 'withdrawalRequestId',
  })
  withdrawalRequestId?: string;

  @BelongsTo(() => WithdrawalRequest, 'withdrawalRequestId')
  withdrawalRequest?: WithdrawalRequest;

  /**
   * Admin que fez o ajuste (se type === ADJUSTMENT)
   */
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'adjustedByUserId',
  })
  adjustedByUserId?: string;

  @BelongsTo(() => Person, { foreignKey: 'adjustedByUserId', as: 'adjustedBy' })
  adjustedBy?: Person;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'createdAt',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updatedAt',
  })
  updatedAt!: Date;
}
