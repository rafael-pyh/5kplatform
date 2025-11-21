#!/bin/sh
set -e

echo "Starting entrypoint script..."

# Only attempt to create migration if enabled (safer to control with env var)
if [ "$PRISMA_AUTO_MIGRATE" = "1" ]; then
  if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "No migrations found — attempting to create a baseline migration (create-only)..."
    # create-only will create a migration from schema.prisma without applying it
    npx prisma migrate dev --name init --create-only || {
      echo "prisma migrate dev --create-only failed — continuing"
    }
  else
    echo "Migrations already present — skipping create-only step."
  fi
else
  echo "PRISMA_AUTO_MIGRATE not set. Skipping creation of migrations."
fi

# Generate Prisma Client (requires DATABASE_URL set for some providers)
echo "Generating Prisma Client..."
npx prisma generate || echo "prisma generate failed — continuing"

# Apply migrations (deploy)
echo "Applying migrations (prisma migrate deploy)..."
npx prisma migrate deploy || echo "prisma migrate deploy failed"

# Run seed if present
if [ -f "dist/prisma/seed.js" ]; then
  echo "Running compiled seed: node dist/prisma/seed.js"
  node dist/prisma/seed.js || echo "seed script failed"
elif [ -f "prisma/seed.ts" ]; then
  echo "Running TS seed via ts-node"
  npx ts-node prisma/seed.ts || echo "ts-node seed failed"
else
  echo "No seed file found, skipping seed."
fi

# Finally start the app
echo "Starting application (npm start)"
exec npm start
