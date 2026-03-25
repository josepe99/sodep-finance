#!/usr/bin/env sh
set -eu

if [ ! -d dist ]; then
  echo "No existe la carpeta dist. Ejecuta primero: npm run build" >&2
  exit 1
fi

RUNTIME_CONFIG="$(node -e 'console.log(JSON.stringify({ VITE_TRANSACTIONS_HOST: process.env.VITE_TRANSACTIONS_HOST || "", VITE_ANALYTICS_HOST: process.env.VITE_ANALYTICS_HOST || "", VITE_BANK_HOST: process.env.VITE_BANK_HOST || "", VITE_SIPAP_HOST: process.env.VITE_SIPAP_HOST || "" }))')"
printf 'window.__APP_CONFIG__ = %s;\n' "$RUNTIME_CONFIG" > dist/config.js

echo "config.js generado con VITE_TRANSACTIONS_HOST=${VITE_TRANSACTIONS_HOST:-} VITE_ANALYTICS_HOST=${VITE_ANALYTICS_HOST:-} VITE_BANK_HOST=${VITE_BANK_HOST:-} VITE_SIPAP_HOST=${VITE_SIPAP_HOST:-}" >&2
exec node server.cjs
