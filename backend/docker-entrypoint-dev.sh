#!/bin/sh
set -e

# Wait for Postgres to be ready
host_from_url() {
  echo "$DATABASE_URL" | awk -F'[@:/?]' '{print $4}'
}

# If DATABASE_URL not set, default to postgres host
DB_HOST=${DB_HOST:-$(host_from_url)}
DB_HOST=${DB_HOST:-postgres}

# Wait loop
echo "Waiting for Postgres at ${DB_HOST}..."
# pg_isready may not exist in minimal images; use loop with netcat if necessary
RETRIES=30
until pg_isready -h "$DB_HOST" -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1 || [ $RETRIES -le 0 ]; do
  echo "Postgres not ready, retrying in 2s... ($RETRIES)"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -le 0 ]; then
  echo "Postgres did not become available. Exiting."
  exit 1
fi

# Run migrations for development
echo "Running migrations..."
if command -v npx >/dev/null 2>&1; then
  npx sequelize-cli db:migrate
else
  echo "npx not available, trying npm exec"
  npm exec -- sequelize-cli db:migrate
fi

# Execute the provided command (npm run dev)
exec "$@"
