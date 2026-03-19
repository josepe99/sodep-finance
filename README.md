# sodep-finance frontend

Frontend React + Vite con runtime configuration para OpenShift y Kubernetes.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
```

- `npm run dev`: usa `VITE_API_URL` desde `.env.local` solo para proxyear `/api` en el servidor de desarrollo.
- `npm start`: genera `dist/config.js` leyendo `VITE_API_URL` del entorno del contenedor antes de servir la SPA.

## Runtime configuration

- `index.html` carga `/config.js` antes de montar React.
- `scripts/start-runtime.sh` genera ese archivo con `window.__APP_CONFIG__.VITE_API_URL`.
- El código React lee `window.__APP_CONFIG__.VITE_API_URL` en runtime y consume Quarkus sin rebuild.

## Desarrollo local

Usa `env.sample` como plantilla y crea `.env.local` con:

```bash
VITE_API_URL=http://localhost:8080
```

En desarrollo, Vite proxya `/api/*` hacia esa URL.

## Kubernetes

Hay manifiestos listos en [`k8s/`](./k8s).

1. Ajusta [k8s/configmap.yaml](/home/jcardozo/sodep/sodep-finance/k8s/configmap.yaml) con la URL pública real de Quarkus.
2. Ajusta [k8s/deployment.yaml](/home/jcardozo/sodep/sodep-finance/k8s/deployment.yaml) con la imagen final.
3. Aplica `kubectl apply -k k8s`.

## OpenShift

La guía completa está en [DEPLOY.md](/home/jcardozo/sodep/sodep-finance/DEPLOY.md).
