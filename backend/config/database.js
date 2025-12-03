require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('postgres:5432') 
      ? { ssl: false }
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
  },
};
