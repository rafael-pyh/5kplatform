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
import { Order } from './Order';

/**
 * PaymentProof Model
 * Armazena comprovantes de pagamento (imagem ou PDF)
 * Associado a um pedido
 * Pedido NÃO pode ser aprovado sem comprovante (a menos que pague com créditos)
 */
@Table({
  tableName: 'PaymentProof',
  timestamps: true,
})
export class PaymentProof extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    field: 'orderId',
  })
  orderId!: string;

  @BelongsTo(() => Order, 'orderId')
  order?: Order;

  /**
   * URL do arquivo (imagem ou PDF) no MinIO
   */
  @Column(DataType.STRING)
  fileUrl!: string;

  /**
   * Tipo do arquivo: 'image' ou 'pdf'
   */
  @Column(DataType.ENUM('image', 'pdf'))
  fileType!: 'image' | 'pdf';

  /**
   * Nome original do arquivo
   */
  @AllowNull(true)
  @Column(DataType.STRING)
  originalFileName?: string;

  /**
   * Tamanho do arquivo em bytes
   */
  @AllowNull(true)
  @Column(DataType.INTEGER)
  fileSize?: number;

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
