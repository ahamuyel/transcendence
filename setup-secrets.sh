#!/bin/sh
# setup-secrets.sh
# Cria a pasta ./secrets e os arquivos de secret.
# Executar antes do primeiro `docker compose up`.
#
# Se já tiver um .env configurado, este script pode popular os secrets
# a partir dele automaticamente.

set -e

mkdir -p ./secrets

ENV_FILE=".env"

create_secret_from_env() {
  var_name="$1"
  secret_file="./secrets/$2"
  if [ ! -f "$secret_file" ] || [ ! -s "$secret_file" ]; then
    if [ -f "$ENV_FILE" ]; then
      val=$(grep "^${var_name}=" "$ENV_FILE" | cut -d'=' -f2- | head -1)
      if [ -n "$val" ]; then
        printf '%s' "$val" > "$secret_file"
        echo "  populado: $secret_file (do .env)"
        return
      fi
    fi
    touch "$secret_file"
    echo "  criado vazio: $secret_file (preencher manualmente)"
  else
    echo "  já existe: $secret_file"
  fi
}

create_secret_from_env AUTH_SECRET          auth_secret.txt
create_secret_from_env GOOGLE_CLIENT_ID     google_client_id.txt
create_secret_from_env GOOGLE_CLIENT_SECRET google_client_secret.txt
create_secret_from_env RESEND_API_KEY       resend_api_key.txt

echo ""
echo "✅ Secrets prontos em ./secrets/"
echo "   Verifique se cada ficheiro tem o valor correto."
echo ""
echo "   Para configurar manualmente:"
echo "   printf 'meu-valor' > ./secrets/auth_secret.txt"
echo ""
echo "⚠️  A pasta secrets/ está no .gitignore — não fazer commit!"
