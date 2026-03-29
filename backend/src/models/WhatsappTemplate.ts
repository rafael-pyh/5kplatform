import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'WhatsappTemplate',
  timestamps: true,
})
export class WhatsappTemplate extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Mensagem com placeholder {{NOME_CLIENTE}} para ser substituído pelo nome do cliente',
  })
  message!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'isActive'
  })
  isActive!: boolean;

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
