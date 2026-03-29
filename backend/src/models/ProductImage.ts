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
import { Product } from './Product';

/**
 * ProductImage Model
 * Armazena múltiplas imagens por produto
 * Suporta URLs do MinIO
 */
@Table({
  tableName: 'ProductImage',
  timestamps: true,
})
export class ProductImage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    field: 'productId',
  })
  productId!: string;

  @BelongsTo(() => Product, 'productId')
  product?: Product;

  @Column(DataType.STRING)
  imageUrl!: string; // URL da imagem no MinIO

  @Default(1)
  @Column(DataType.INTEGER)
  order?: number; // Ordem de exibição (1 = principal)

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

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
