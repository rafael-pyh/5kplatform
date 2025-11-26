#!/bin/sh
set -e

echo "Starting entrypoint script..."

# Generate Prisma Client (safe to run on container start)
echo "Generating Prisma Client..."
npx prisma generate || echo "prisma generate failed — continuing"

# Start the application
echo "Starting application (npm start)"
exec npm start
