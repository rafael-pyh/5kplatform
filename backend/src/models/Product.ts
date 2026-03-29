import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  AllowNull,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Person } from './Person';
import { ProductImage } from './ProductImage';
import { KitItem } from './KitItem';

/**
 * Product Model
 * Representa um produto que pode ser adicionado a kits
 * e vendido diretamente
 */
@Table({
  tableName: 'Product',
  timestamps: true,
})
export class Product extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.DECIMAL(10, 2))
  price!: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  stock?: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @ForeignKey(() => Person)
  @Column({
    type: DataType.UUID,
    field: 'createdByUserId',
  })
  createdByUserId!: string;

  @BelongsTo(() => Person, 'createdByUserId')
  createdBy?: Person;

  @AllowNull(true)
  @Column(DataType.TEXT)
  sku?: string; // SKU do produto

  @AllowNull(true)
  @Column(DataType.TEXT)
  tags?: string; // Tags separadas por vírgula

  @HasMany(() => ProductImage, 'productId')
  images?: ProductImage[];

  @HasMany(() => KitItem, 'productId')
  kitItems?: KitItem[];

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
