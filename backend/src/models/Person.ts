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
  @Column(DataType.TEXT)
  photoBase64?: string; // Base64 data URL da foto de perfil

  @Unique
  @Column(DataType.STRING)
  qrCode!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  qrCodeBase64?: string; // Base64 data URL do QR code

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

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.STRING)
  state: string;

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

// Removi a chamada redundante de Person.init, pois o decorador @Table já cuida da configuração do modelo.
