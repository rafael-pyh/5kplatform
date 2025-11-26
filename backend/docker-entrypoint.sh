#!/bin/sh
set -e

echo "Running Prisma generate..."
npx prisma generate

echo "Applying migrations..."
npx prisma migrate deploy || true

exec "$@"
