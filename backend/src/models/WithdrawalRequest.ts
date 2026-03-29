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
  HasMany,
} from 'sequelize-typescript';
import { Person } from './Person';
import { CreditTransaction } from './CreditTransaction';

/**
 * Status de Saque
 * PENDING: Saque solicitado, aguardando aprovação
 * APPROVED: Aprovado, aguardando processamento
 * PAID: Saque realizado
 * REJECTED: Saque rejeitado
 */
export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

/**
 * WithdrawalRequest Model
 * Solicitação de saque de créditos
 * Fluxo 100% manual
 * Implementa padrão de auditoria com admin approval
 */
@Table({
  tableName: 'WithdrawalRequest',
  timestamps: true,
})
export class WithdrawalRequest extends Model {
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
   * Valor solicitado para saque
   */
  @Column(DataType.DECIMAL(15, 2))
  amount!: number;

  /**
   * Status do saque
   */
  @Default(WithdrawalStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(WithdrawalStatus)))
  status!: WithdrawalStatus;

  /**
   * Chave PIX ou dados bancários para o saque
   */
  @AllowNull(true)
  @Column(DataType.TEXT)
  bankAccountInfo?: string;

  /**
   * Observações do solicitante
   */
  @AllowNull(true)
  @Column(DataType.TEXT)
  notes?: string;

  /**
   * Admin que aprovou o saque
   */
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'approvedByUserId',
  })
  approvedByUserId?: string;

  @BelongsTo(() => Person, { foreignKey: 'approvedByUserId', as: 'approvedBy' })
  approvedBy?: Person;

  @AllowNull(true)
  @Column(DataType.DATE)
  approvedAt?: Date;

  /**
   * Admin que rejeitou o saque
   */
  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'rejectedByUserId',
  })
  rejectedByUserId?: string;

  @BelongsTo(() => Person, { foreignKey: 'rejectedByUserId', as: 'rejectedBy' })
  rejectedBy?: Person;

  @AllowNull(true)
  @Column(DataType.DATE)
  rejectedAt?: Date;

  /**
   * Motivo da rejeição
   */
  @AllowNull(true)
  @Column(DataType.TEXT)
  rejectionReason?: string;

  /**
   * Data em que o saque foi processado/pago
   */
  @AllowNull(true)
  @Column(DataType.DATE)
  paidAt?: Date;

  /**
   * Transações de crédito associadas
   */
  @HasMany(() => CreditTransaction, 'withdrawalRequestId')
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
