#!/bin/sh
set -e

# ── Carrega Docker Secrets como variáveis de ambiente ──────────────────────────
# O Docker monta cada secret em /run/secrets/<nome>.
# Lemos o arquivo e exportamos a variável correspondente.
load_secret() {
  var_name="$1"
  secret_file="/secrets/$2"
  if [ -f "$secret_file" ]; then
    # `tr -d '\n'` remove qualquer quebra de linha acidental
    export "$var_name"="$(cat "$secret_file" | tr -d '\n')"
  fi
}

load_secret AUTH_SECRET          auth_secret
load_secret GOOGLE_CLIENT_ID     google_client_id
load_secret GOOGLE_CLIENT_SECRET google_client_secret
load_secret RESEND_API_KEY       resend_api_key
# ──────────────────────────────────────────────────────────────────────────────

echo "🌐 Verificando conexão com o banco..."
npx prisma migrate deploy

echo "🚀 Subindo Cur10usX..."
exec npx next start