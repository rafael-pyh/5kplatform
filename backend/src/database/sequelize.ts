import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Person } from '../models/Person';
import { Lead } from '../models/Lead';
import { QRCodeScan } from '../models/QRCodeScan';
import { Creative } from '../models/Creative';

// Suporta tanto DATABASE_URL (Railway/Heroku) quanto variáveis individuais
const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
  // Usa DATABASE_URL se disponível
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    models: [Person, Lead, QRCodeScan, Creative],
    logging: process.env.NODE_ENV === 'development' ? console.log : (msg) => console.log(`[SQL] ${msg}`),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: databaseUrl.includes('localhost') || databaseUrl.includes('postgres:5432') ? {
      ssl: false,
    } : {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Usa variáveis individuais
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'postgres',
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    models: [Person, Lead, QRCodeScan, Creative],
    logging: process.env.NODE_ENV === 'development' ? console.log : (msg) => console.log(`[SQL] ${msg}`),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

export default sequelize;