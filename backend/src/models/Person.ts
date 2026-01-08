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
  AFFILIATE = 'AFFILIATE',
}

export enum RegistrationType {
  PUBLIC = 'PUBLIC',    // Via link/QR Code (afiliado)
  ADMIN = 'ADMIN',      // Criado por administrador
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
  @Column(DataType.STRING)
  qrCodeUrl?: string; // URL do QR code armazenado no Minio

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  scanCount!: number;

  @Default(PersonRole.SELLER)
  @Column(DataType.ENUM(...Object.values(PersonRole)))
  role!: PersonRole;

  @Default('ADMIN')
  @Column(DataType.ENUM('PUBLIC', 'ADMIN'))
  registration_type!: 'PUBLIC' | 'ADMIN';

  @AllowNull(true)
  @Column(DataType.UUID)
  created_by?: string; // ID do admin que criou este usuário

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

  @AllowNull(true)
  @Column(DataType.STRING)
  rememberMeToken?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  rememberMeExpiry?: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  resetPasswordToken?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  resetPasswordExpiry?: Date;

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

  @Default('pending')
  @Column(DataType.ENUM('pending', 'approved', 'rejected'))
  approvalStatus!: 'pending' | 'approved' | 'rejected';
}

// Removi a chamada redundante de Person.init, pois o decorador @Table já cuida da configuração do modelo.
