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
import { Kit } from './Kit';
import { Product } from './Product';

/**
 * KitItem Model
 * Representa a relação entre Kit e Product com quantidade
 * Um kit pode ter múltiplos itens (produtos)
 */
@Table({
  tableName: 'KitItem',
  timestamps: true,
})
export class KitItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Kit)
  @Column({
    type: DataType.UUID,
    field: 'kitId',
  })
  kitId!: string;

  @BelongsTo(() => Kit, 'kitId')
  kit?: Kit;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    field: 'productId',
  })
  productId!: string;

  @BelongsTo(() => Product, 'productId')
  product?: Product;

  @Column(DataType.INTEGER)
  quantity!: number; // Quantidade do produto neste kit

  @AllowNull(true)
  @Column(DataType.TEXT)
  notes?: string; // Notas específicas para este item

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
