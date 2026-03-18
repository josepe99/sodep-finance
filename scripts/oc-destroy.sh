#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-mi-frontend}"

echo "Eliminando recursos de ${APP_NAME} en proyecto $(oc project -q)..."
oc delete route "$APP_NAME" --ignore-not-found
oc delete service "$APP_NAME" --ignore-not-found
oc delete deployment "$APP_NAME" --ignore-not-found
oc delete deploymentconfig "$APP_NAME" --ignore-not-found
oc delete buildconfig "$APP_NAME" --ignore-not-found
oc delete imagestream "$APP_NAME" --ignore-not-found
oc delete configmap frontend-config --ignore-not-found

echo "Limpieza finalizada."
