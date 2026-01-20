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
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { Person } from './Person';
import { Kit } from './Kit';
import { PaymentProof } from './PaymentProof';
import { CreditTransaction } from './CreditTransaction';

/**
 * Order Status Enum
 * PENDING_PAYMENT: Aguardando comprovante de pagamento
 * PENDING_APPROVAL: Comprovante recebido, aguardando aprovação do admin
 * APPROVED: Pedido aprovado
 * REJECTED: Pedido rejeitado
 * PAID: Pedido já pago (com créditos)
 */
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

/**
 * Order Model
 * Representa um pedido de um Person para adquirir um Kit
 * Suporta pagamento por transferência (com comprovante) ou créditos
 */
@Table({
  tableName: 'Order',
  timestamps: true,
})
export class Order extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  /**
   * Código único e legível do pedido
   * Formato: YYYY-MM-DD-XXXX (ex: 2025-01-20-A1B2)
   */
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  orderCode!: string;

  @ForeignKey(() => Person)
  @Column({
    type: DataType.UUID,
    field: 'personId',
  })
  personId!: string;

  @BelongsTo(() => Person, 'personId')
  person?: Person;

  @ForeignKey(() => Kit)
  @Column({
    type: DataType.UUID,
    field: 'kitId',
  })
  kitId!: string;

  @BelongsTo(() => Kit, 'kitId')
  kit?: Kit;

  @Column(DataType.DECIMAL(10, 2))
  totalPrice!: number; // Preço total do pedido

  @Default(OrderStatus.PENDING_PAYMENT)
  @Column(DataType.ENUM(...Object.values(OrderStatus)))
  status!: OrderStatus;

  /**
   * true: O usuário pagou com comprovante (PIX, Transferência, etc)
   * false: O usuário pagou com créditos
   */
  @Default(false)
  @Column(DataType.BOOLEAN)
  usesCredit!: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  notes?: string; // Observações do pedido

  @AllowNull(true)
  @Column(DataType.TEXT)
  rejectionReason?: string; // Motivo da rejeição (se rejeitado)

  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'approvedByUserId',
  })
  approvedByUserId?: string; // User que aprovou o pedido

  @BelongsTo(() => Person, { foreignKey: 'approvedByUserId', as: 'approvedBy' })
  approvedBy?: Person;

  @AllowNull(true)
  @Column(DataType.DATE)
  approvedAt?: Date;

  @HasMany(() => PaymentProof, 'orderId')
  paymentProofs?: PaymentProof[];

  @HasMany(() => CreditTransaction, 'orderId')
  transactions?: CreditTransaction[];

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
