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

export enum LeadStatus {
  BOUGHT = 'BOUGHT',
  CANCELLED = 'CANCELLED',
  NEGOTIATION = 'NEGOTIATION',
}

@Table({
  tableName: 'Lead',
  timestamps: true,
})
export class Lead extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  email?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  phone?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  energyBill?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  roofPhoto?: string;

  @Default(LeadStatus.NEGOTIATION)
  @Column(DataType.ENUM(...Object.values(LeadStatus)))
  status!: LeadStatus;

  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  ownerId!: string;

  @BelongsTo(() => Person)
  owner?: Person;

  @AllowNull(true)
  @Column(DataType.TEXT)
  notes?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  city?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  state?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
