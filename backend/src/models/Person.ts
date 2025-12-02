import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { Lead } from './Lead';
import { QRCodeScan } from './QRCodeScan';

export enum PersonRole {
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Table({
  tableName: 'Person',
  timestamps: true,
})
export class Person extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Unique
  @AllowNull(true)
  @Column(DataType.STRING)
  email?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  phone?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  pixKey?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  photoUrl?: string;

  @Unique
  @Column(DataType.STRING)
  qrCode!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  qrCodeUrl?: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  scanCount!: number;

  @Default(PersonRole.SELLER)
  @Column(DataType.ENUM(...Object.values(PersonRole)))
  role!: PersonRole;

  @AllowNull(true)
  @Column(DataType.STRING)
  password?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  emailVerified!: boolean;

  @Unique
  @AllowNull(true)
  @Column(DataType.STRING)
  verificationToken?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  tokenExpiry?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasMany(() => Lead)
  leads?: Lead[];

  @HasMany(() => QRCodeScan)
  qrCodeScans?: QRCodeScan[];
}
