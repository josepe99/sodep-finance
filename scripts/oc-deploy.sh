#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-mi-frontend}"
NODE_IMAGE_STREAM="${NODE_IMAGE_STREAM:-nodejs:20-ubi9}"
TRANSACTIONS_HOST="${TRANSACTIONS_HOST:-}"
ANALYTICS_HOST="${ANALYTICS_HOST:-}"
BANK_HOST="${BANK_HOST:-}"
GIT_REF="${GIT_REF:-main}"

if ! command -v oc >/dev/null 2>&1; then
  echo "oc CLI no está disponible en PATH." >&2
  exit 1
fi

if [ -z "$TRANSACTIONS_HOST" ] || [ -z "$ANALYTICS_HOST" ] || [ -z "$BANK_HOST" ]; then
  echo "Define TRANSACTIONS_HOST, ANALYTICS_HOST y BANK_HOST antes de ejecutar el script. Ejemplo:" >&2
  echo "TRANSACTIONS_HOST=https://transactions.apps.cluster.com ANALYTICS_HOST=https://analytics.apps.cluster.com BANK_HOST=https://bank.apps.cluster.com ./scripts/oc-deploy.sh" >&2
  exit 1
fi

if [ -z "${GIT_URL:-}" ]; then
  GIT_URL="$(git config --get remote.origin.url || true)"
fi

if [ -z "${GIT_URL:-}" ]; then
  echo "No se pudo inferir GIT_URL. Define GIT_URL manualmente." >&2
  exit 1
fi

echo "Proyecto actual: $(oc project -q)"
echo "Aplicación: ${APP_NAME}"
echo "Repositorio: ${GIT_URL}#${GIT_REF}"

echo "[1/6] Creando/actualizando ConfigMap frontend-config"
oc create configmap frontend-config \
  --from-literal=TRANSACTIONS_HOST="$TRANSACTIONS_HOST" \
  --from-literal=ANALYTICS_HOST="$ANALYTICS_HOST" \
  --from-literal=BANK_HOST="$BANK_HOST" \
  --dry-run=client -o yaml | oc apply -f -

if ! oc get buildconfig "$APP_NAME" >/dev/null 2>&1; then
  echo "[2/6] Creando app con new-app (S2I Node.js)"
  oc new-app "${NODE_IMAGE_STREAM}~${GIT_URL}#${GIT_REF}" \
    --name "$APP_NAME" \
    --build-env NPM_RUN=build
else
  echo "[2/6] BuildConfig ya existe, se reutiliza"
fi

echo "[3/6] Configurando entorno y recursos"
if oc get deployment "$APP_NAME" >/dev/null 2>&1; then
  WORKLOAD="deployment/${APP_NAME}"
else
  WORKLOAD="deploymentconfig/${APP_NAME}"
fi

oc set env "$WORKLOAD" --from=configmap/frontend-config
oc set resources "$WORKLOAD" \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi

echo "[4/6] Exponiendo servicio"
oc expose service "$APP_NAME" --overwrite >/dev/null 2>&1 || true

echo "[5/6] Lanzando build"
oc set env buildconfig/"$APP_NAME" NPM_RUN=build
oc start-build "$APP_NAME" --follow

echo "[6/6] Esperando rollout"
oc rollout status "$WORKLOAD" --timeout=300s

echo "Despliegue completado."
ROUTE_URL="http://$(oc get route "$APP_NAME" -o jsonpath='{.spec.host}')"
echo "URL frontend: $ROUTE_URL"
