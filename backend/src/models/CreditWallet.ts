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
  Unique,
  AllowNull,
} from 'sequelize-typescript';
import { Person } from './Person';

/**
 * CreditWallet Model
 * Carteira de créditos de cada Person
 * Armazena o saldo total de créditos
 * NUNCA alterar diretamente - usar CreditTransaction para todas as mudanças
 */
@Table({
  tableName: 'CreditWallet',
  timestamps: true,
})
export class CreditWallet extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Person)
  @Unique
  @Column({
    type: DataType.UUID,
    field: 'personId',
  })
  personId!: string;

  @BelongsTo(() => Person, 'personId')
  person?: Person;

  /**
   * Saldo total de créditos
   * Calculado a partir de CreditTransaction
   * Sempre >= 0
   */
  @Default(0)
  @Column(DataType.DECIMAL(15, 2))
  balance!: number;

  /**
   * Última data em que o saldo foi atualizado
   */
  @AllowNull(true)
  @Column(DataType.DATE)
  lastTransactionAt?: Date;

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
