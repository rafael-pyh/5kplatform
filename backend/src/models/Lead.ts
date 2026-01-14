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
  @Column({
    type: DataType.TEXT,
    field: 'energyBill'
  })
  energyBill?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'roofPhoto'
  })
  roofPhoto?: string;

  @Default(LeadStatus.NEGOTIATION)
  @Column(DataType.ENUM(...Object.values(LeadStatus)))
  status!: LeadStatus;

  @ForeignKey(() => Person)
  @Column({
    type: DataType.UUID,
    field: 'ownerId'
  })
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
  @Column({
    type: DataType.DATE,
    field: 'createdAt'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updatedAt'
  })
  updatedAt!: Date;
}
