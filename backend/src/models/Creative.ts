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

export enum CreativeType {
  PLACARD = 'PLACARD',
  BANNER = 'BANNER',
  POSTER = 'POSTER',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  OTHER = 'OTHER',
}

@Table({
  tableName: 'Creative',
  timestamps: true,
})
export class Creative extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  imageUrl!: string; // URL da imagem no MinIO

  @Default(CreativeType.PLACARD)
  @Column(DataType.ENUM(...Object.values(CreativeType)))
  type!: CreativeType;

  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  uploadedByUserId!: string;

  @BelongsTo(() => Person, 'uploadedByUserId')
  uploadedBy?: Person;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  downloadCount!: number; // Quantas vezes foi baixado

  @AllowNull(true)
  @Column(DataType.TEXT)
  tags?: string; // Tags separadas por vírgula para busca

  @AllowNull(true)
  @Column(DataType.FLOAT)
  qrBoxCenterXRatio?: number; // Posição X do QR code (0-1, relativo ao criativo)

  @AllowNull(true)
  @Column(DataType.FLOAT)
  qrBoxCenterYRatio?: number; // Posição Y do QR code (0-1, relativo ao criativo)

  @AllowNull(true)
  @Column(DataType.FLOAT)
  qrBoxSizeRatio?: number; // Tamanho do QR code em relação ao criativo (0-1)

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
