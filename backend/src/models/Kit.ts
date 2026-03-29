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
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Person } from './Person';
import { KitItem } from './KitItem';
import { Order } from './Order';

/**
 * Kit Model
 * Representa um conjunto de produtos com preço consolidado
 * Um kit é composto por múltiplos KitItems (produto + quantidade)
 */
@Table({
  tableName: 'Kit',
  timestamps: true,
})
export class Kit extends Model {
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
  price!: number; // Preço total do kit

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
  sku?: string; // SKU do kit

  @AllowNull(true)
  @Column(DataType.TEXT)
  tags?: string; // Tags separadas por vírgula

  /**
   * Imagem principal do kit
   * URL no MinIO
   */
  @AllowNull(true)
  @Column(DataType.STRING)
  imageUrl?: string;

  @HasMany(() => KitItem, 'kitId')
  items?: KitItem[];

  @HasMany(() => Order, 'kitId')
  orders?: Order[];

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
