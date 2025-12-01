import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',

  datasource: {
    url: process.env.DATABASE_URL,
  },

  // para o Prisma Client (node)
  client: {
    adapter: 'postgresql',
  },
});
