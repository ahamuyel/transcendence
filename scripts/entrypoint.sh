#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed data exists..."
SEED_CHECK=$(node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(c => { console.log(c); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null || echo "0")
if [ "$SEED_CHECK" = "0" ]; then
  echo "Seeding database with initial data..."
  npx prisma db seed
else
  echo "Seed data already present, skipping ($SEED_CHECK users found)."
fi

echo "Starting Next.js..."
exec node server.js
