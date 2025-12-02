module.exports = {
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db',
    },
  },
};
