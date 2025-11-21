# Migration 20251121190000_init

Baseline migration created to match prisma/schema.prisma.

Notes:
- Created from schema.prisma to allow prisma migrate deploy to proceed in production where the DB already has schema.
- Review the SQL before applying in production. Take DB backup first.
