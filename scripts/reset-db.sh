#!/bin/bash
# Reset database: drop all, migrate, seed
# Usage: DATABASE_URL="..." bash scripts/reset-db.sh

set -e

echo "=== AVISO: Isto vai APAGAR toda a base de dados! ==="
echo "Pressione Ctrl+C para cancelar ou Enter para continuar..."
read -r

echo "1/3 Resetando a base de dados..."
npx prisma migrate reset --force --skip-seed

echo "2/3 Aplicando migrações..."
npx prisma migrate deploy

echo "3/3 Executando seed..."
npx prisma db seed

echo ""
echo "=== Base de dados resetada com sucesso! ==="
echo "Login: super@cur10usx.com / cur10usx"
