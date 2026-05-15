#!/bin/sh
set -e

# ── Carrega Docker Secrets como variáveis de ambiente ──────────────────────────
# O Docker monta cada secret em /run/secrets/<nome>.
# Lemos o arquivo e exportamos a variável correspondente.
load_secret() {
  var_name="$1"
  secret_file="/run/secrets/$2"
  if [ -f "$secret_file" ]; then
    export "$var_name"="$(cat "$secret_file" | tr -d '\n')"
  else
    echo "⚠️ Warning: Secret file $secret_file not found. Check docker-compose secrets config."
  fi
}

required_secrets() {
  missing=0
  for secret in "$@"; do
    if [ ! -f "/run/secrets/$secret" ]; then
      echo "❌ Required secret file /run/secrets/$secret is missing!"
      missing=$((missing + 1))
    fi
  done
  if [ "$missing" -gt 0 ]; then
    echo "❌ $missing required secret(s) missing. Aborting."
    exit 1
  fi
}

required_secrets auth_secret google_client_id google_client_secret resend_api_key

load_secret AUTH_SECRET          auth_secret
load_secret GOOGLE_CLIENT_ID     google_client_id
load_secret GOOGLE_CLIENT_SECRET google_client_secret
load_secret RESEND_API_KEY       resend_api_key
# ──────────────────────────────────────────────────────────────────────────────

echo "🌐 Verificando conexão com o banco..."
npx prisma migrate deploy

echo "🔌 Iniciando WebSocket server..."
node ws-server.js &
WS_PID=$!

echo "🚀 Subindo Cur10usX..."
exec npx next start