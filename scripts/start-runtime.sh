#!/usr/bin/env sh
set -eu

if [ ! -d dist ]; then
  echo "No existe la carpeta dist. Ejecuta primero: npm run build" >&2
  exit 1
fi

RUNTIME_CONFIG="$(node -e 'console.log(JSON.stringify({ VITE_API_URL: process.env.VITE_API_URL || "" }))')"
printf 'window.__APP_CONFIG__ = %s;\n' "$RUNTIME_CONFIG" > dist/config.js

echo "config.js generado con VITE_API_URL=${VITE_API_URL:-}" >&2
exec node server.cjs
