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
  @Column({
    type: DataType.STRING,
    field: 'pixKey'
  })
  pixKey?: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
    field: 'photoBase64'
  })
  photoBase64?: string; // Base64 data URL da foto de perfil

  @Unique
  @Column({
    type: DataType.STRING,
    field: 'qrCode'
  })
  qrCode!: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'qrCodeUrl'
  })
  qrCodeUrl?: string; // URL do QR code armazenado no Minio

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: 'scanCount'
  })
  scanCount!: number;

  @Default(PersonRole.SELLER)
  @Column(DataType.ENUM(...Object.values(PersonRole)))
  role!: PersonRole;

  @Default('ADMIN')
  @Column({
    type: DataType.ENUM('PUBLIC', 'ADMIN'),
    field: 'registration_type'
  })
  registrationType!: 'PUBLIC' | 'ADMIN';

  @AllowNull(true)
  @Column({
    type: DataType.UUID,
    field: 'created_by'
  })
  createdBy?: string; // ID do admin que criou este usuário

  @AllowNull(true)
  @Column(DataType.STRING)
  password?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'emailVerified'
  })
  emailVerified!: boolean;

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.STRING)
  state: string;

  @Unique
  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'verificationToken'
  })
  verificationToken?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'tokenExpiry'
  })
  tokenExpiry?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'rememberMeToken'
  })
  rememberMeToken?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'rememberMeExpiry'
  })
  rememberMeExpiry?: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    field: 'resetPasswordToken'
  })
  resetPasswordToken?: string;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'resetPasswordExpiry'
  })
  resetPasswordExpiry?: Date;

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

  @HasMany(() => Lead)
  leads?: Lead[];

  @HasMany(() => QRCodeScan)
  qrCodeScans?: QRCodeScan[];

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    field: 'approvalStatus'
  })
  approvalStatus!: 'pending' | 'approved' | 'rejected';

  @AllowNull(true)
  @Unique
  @Column({
    type: DataType.STRING(11),
    field: 'cpf'
  })
  cpf?: string; // CPF do usuário (somente números)

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'birthDate'
  })
  birthDate?: Date; // Data de nascimento do usuário
}

// Removi a chamada redundante de Person.init, pois o decorador @Table já cuida da configuração do modelo.
