#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed data exists..."
SEED_CHECK=$(echo "SELECT COUNT(*) FROM \"User\"" | npx prisma db execute --stdin 2>/dev/null | tail -1)
if [ "$SEED_CHECK" = "0" ] || [ -z "$SEED_CHECK" ]; then
  echo "Seeding database with initial data..."
  npx prisma db seed
else
  echo "Seed data already present, skipping."
fi

echo "Starting Next.js..."
exec node server.js
