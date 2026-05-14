#!/bin/sh
# Healthcheck script for Docker containers
# Usage: healthcheck.sh <url> [expected_status]

URL="${1:-http://localhost:3000/api/health}"
EXPECTED="${2:-200}"

status=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")

if [ "$status" = "$EXPECTED" ]; then
    echo "Healthcheck passed: $URL -> $status"
    exit 0
else
    echo "Healthcheck failed: $URL -> $status (expected $EXPECTED)"
    exit 1
fi
