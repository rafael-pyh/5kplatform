import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  AllowNull,
  CreatedAt,
} from 'sequelize-typescript';
import { Person } from './Person';

@Table({
  tableName: 'QRCodeScan',
  timestamps: false,
})
export class QRCodeScan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  personId!: string;

  @BelongsTo(() => Person)
  person?: Person;

  @AllowNull(true)
  @Column(DataType.STRING)
  ipAddress?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  userAgent?: string;

  @CreatedAt
  @Column({ field: 'scannedAt', type: DataType.DATE })
  scannedAt!: Date;
}
