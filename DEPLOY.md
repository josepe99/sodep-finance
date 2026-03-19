# DEPLOY - Runtime Configuration con `VITE_API_URL`

## 1) Objetivo

El frontend se construye una sola vez y la URL de Quarkus se inyecta en runtime desde el Pod.

Patrón implementado:

1. `index.html` carga `/config.js` antes de iniciar React.
2. `scripts/start-runtime.sh` genera `dist/config.js` en el arranque del contenedor.
3. `config.js` expone `window.__APP_CONFIG__.VITE_API_URL`.
4. React lee esa variable en runtime y arma las requests hacia Quarkus sin usar valores `.env` embebidos en el bundle.

## 2) Archivos clave

- `index.html`
- `public/config.js`
- `src/api/client.js`
- `scripts/start-runtime.sh`
- `server.cjs`
- `scripts/oc-deploy.sh`
- `k8s/configmap.yaml`
- `k8s/deployment.yaml`

## 3) Variables

Usa `env.sample` como plantilla:

```bash
VITE_API_URL=
```

Para desarrollo local:

```bash
VITE_API_URL=http://localhost:8080
```

## 4) Desarrollo local

```bash
npm install
npm run dev
```

En `npm run dev`, Vite proxya `/api/*` a `VITE_API_URL`.

Para simular runtime del contenedor:

```bash
npm run build
VITE_API_URL=http://localhost:8080 npm start
```

## 5) Despliegue manual en OpenShift

### Crear ConfigMap

```bash
oc create configmap frontend-config \
  --from-literal=VITE_API_URL=https://<route-publica-de-quarkus> \
  --dry-run=client -o yaml | oc apply -f -
```

### Crear app con S2I Node.js

```bash
oc new-app nodejs:20-ubi9~<url-repo-git> \
  --name mi-frontend \
  --build-env NPM_RUN=build
```

### Inyectar ConfigMap al Deployment

```bash
oc set env deployment/mi-frontend --from=configmap/frontend-config || \
oc set env dc/mi-frontend --from=configmap/frontend-config
```

### Ajustar recursos y exponer la app

```bash
oc set resources deployment/mi-frontend \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi || \
oc set resources dc/mi-frontend \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi

oc expose service mi-frontend
oc get pods
oc get route mi-frontend
```

## 6) Script de automatización

```bash
VITE_API_URL=https://<route-publica-de-quarkus> \
GIT_URL=<url-repo-git> \
./scripts/oc-deploy.sh
```

## 7) Verificación solicitada

1. Cambia la URL en el `ConfigMap`:

```bash
oc create configmap frontend-config \
  --from-literal=VITE_API_URL=https://<nueva-route-publica-de-quarkus> \
  --dry-run=client -o yaml | oc apply -f -
```

2. Reinicia el rollout:

```bash
oc rollout restart deployment/mi-frontend || oc rollout latest dc/mi-frontend
```

3. Abre el frontend y confirma en Network que las requests salen hacia la nueva URL de Quarkus.

No hace falta reconstruir la imagen.
