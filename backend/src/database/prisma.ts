import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Person } from '../models/Person';
import { Lead } from '../models/Lead';
import { QRCodeScan } from '../models/QRCodeScan';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'postgres',
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  models: [Person, Lead, QRCodeScan],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;