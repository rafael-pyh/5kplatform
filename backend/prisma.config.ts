const config = {
  schema: './prisma/schema.prisma',
  migrate: {
    datasourceUrl: process.env.DATABASE_URL || '',
  },
};

export default config;

