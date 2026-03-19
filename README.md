# sodep-finance frontend

Frontend React + Vite con runtime configuration para OpenShift y Kubernetes.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
```

- `npm run dev`: usa `VITE_TRANSACTIONS_HOST`, `VITE_ANALYTICS_HOST` y `VITE_BANK_HOST` desde `.env.local` para proxyear `/api` en desarrollo.
- `npm start`: genera `dist/config.js` leyendo esas tres variables desde el entorno del contenedor antes de servir la SPA.

## Runtime configuration

- `index.html` carga `/config.js` antes de montar React.
- `scripts/start-runtime.sh` genera ese archivo con `window.__APP_CONFIG__`.
- El código React lee `window.__APP_CONFIG__.VITE_TRANSACTIONS_HOST`, `window.__APP_CONFIG__.VITE_ANALYTICS_HOST` y `window.__APP_CONFIG__.VITE_BANK_HOST` en runtime.

## Desarrollo local

Usa `env.sample` como plantilla y crea `.env.local` con:

```bash
VITE_TRANSACTIONS_HOST=http://localhost:8080
VITE_ANALYTICS_HOST=http://localhost:8081
VITE_BANK_HOST=http://localhost:8082
```

En desarrollo, Vite proxya cada endpoint `/api/*` al microservicio correspondiente.

## Kubernetes

Hay manifiestos listos en [`k8s/`](./k8s).

1. Ajusta [k8s/configmap.yaml](/home/jcardozo/sodep/sodep-finance/k8s/configmap.yaml) con las URLs públicas reales.
2. Ajusta [k8s/deployment.yaml](/home/jcardozo/sodep/sodep-finance/k8s/deployment.yaml) con la imagen final.
3. Aplica `kubectl apply -k k8s`.

## OpenShift

La guía completa está en [DEPLOY.md](/home/jcardozo/sodep/sodep-finance/DEPLOY.md).
