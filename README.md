# sodep-finance frontend

Frontend React + Vite con configuración dinámica en runtime para OpenShift y Kubernetes.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
```

`npm start` genera `dist/config.js` a partir de `TRANSACTIONS_HOST`, `VITE_ANALYTICS_HOST` y `VITE_BANK_HOST`, sirve la SPA y además hace proxy de `/api/transactions*`, `/api/balance`, `/api/common/centros-servicios` y `/api/secure/common/parametros` para evitar CORS en el navegador.

## Docker

```bash
docker build -t sodep-finance:local .
docker run --rm -p 8080:8080 \
  -e TRANSACTIONS_HOST=http://service-transactions:8080 \
  -e ANALYTICS_HOST=http://service-analytics:8080 \
  -e BANK_HOST=http://service-bank:8080 \
  sodep-finance:local
```

## Kubernetes

Hay manifiestos listos en [`k8s/`](./k8s).

1. Construye y publica la imagen que vas a usar en el cluster.
2. Ajusta en `k8s/deployment.yaml` la imagen final.
3. Ajusta en `k8s/configmap.yaml` los hosts de tus backends dentro del cluster.
4. Ajusta en `k8s/ingress.yaml` el host público.
5. Aplica todo con:

```bash
kubectl apply -k k8s
```

## Variables

Usa `env.sample` como plantilla y crea `.env.local` para desarrollo local.
La app lee `TRANSACTIONS_HOST` para transacciones, `VITE_ANALYTICS_HOST` para analytics y `VITE_BANK_HOST` para bank.
En `npm run dev`, Vite proxya `/api/transactions*` a `TRANSACTIONS_HOST`, `/api/balance` a `VITE_ANALYTICS_HOST` y los endpoints bank a `VITE_BANK_HOST`.

## Despliegue en OpenShift y Kubernetes

La documentación completa está en [DEPLOY.md](./DEPLOY.md).
