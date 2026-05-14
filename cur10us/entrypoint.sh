#!/bin/sh
set -e

load_secret() {
    var_name="$1"
    secret_file="/run/secrets/$2"
    if [ -f "$secret_file" ]; then
        export "$var_name"="$(cat "$secret_file" | tr -d '\n')"
    fi
}

load_secret AUTH_SECRET          auth_secret
load_secret GOOGLE_CLIENT_ID     google_client_id
load_secret GOOGLE_CLIENT_SECRET google_client_secret
load_secret RESEND_API_KEY       resend_api_key

export NEXT_TELEMETRY_DISABLED=1

echo "Running Prisma migrations..."
npx prisma generate 2>/dev/null || true
npx prisma migrate deploy 2>/dev/null || echo "No migrations to apply"

if [ "$NODE_ENV" = "production" ]; then
    echo "Starting Cur10usX (production)..."
    exec node server.js
else
    echo "Starting Cur10usX (development)..."
    exec npx next dev
fi
