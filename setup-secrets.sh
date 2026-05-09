#!/bin/sh
# setup-secrets.sh
# Cria a pasta ./secrets e os arquivos de secret vazios para você preencher.
# Execute uma vez antes do primeiro `docker compose up`.

set -e

mkdir -p ./secrets

for secret in auth_secret google_client_id google_client_secret resend_api_key; do
  file="./secrets/${secret}.txt"
  if [ ! -f "$file" ]; then
    touch "$file"
    echo "  criado: $file"
  else
    echo "  já existe: $file (não sobrescrito)"
  fi
done

echo ""
echo "✅ Pasta ./secrets pronta."
echo "   Preencha cada arquivo com o valor correspondente (sem quebra de linha)."
echo ""
echo "   Exemplo:"
echo "   printf 'minha-chave-super-secreta' > ./secrets/auth_secret.txt"
echo ""
echo "⚠️  Não commite a pasta ./secrets no git!"
echo "   Adicione ao .gitignore: secrets/"