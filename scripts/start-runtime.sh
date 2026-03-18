#!/usr/bin/env bash
set -euo pipefail

if [ ! -d dist ]; then
  echo "No existe la carpeta dist. Ejecuta primero: npm run build" >&2
  exit 1
fi

RUNTIME_CONFIG="$(node -e 'console.log(JSON.stringify({ TRANSACTIONS_HOST: process.env.TRANSACTIONS_HOST || "", ANALYTICS_HOST: process.env.ANALYTICS_HOST || process.env.VITE_ANALYTICS_HOST || "", BANK_HOST: process.env.BANK_HOST || process.env.VITE_BANK_HOST || "" }))')"
printf 'window.__APP_CONFIG__ = %s;\n' "$RUNTIME_CONFIG" > dist/config.js

echo "config.js generado con TRANSACTIONS_HOST=${TRANSACTIONS_HOST:-} ANALYTICS_HOST=${ANALYTICS_HOST:-${VITE_ANALYTICS_HOST:-}} BANK_HOST=${BANK_HOST:-${VITE_BANK_HOST:-}}" >&2
exec node server.cjs
