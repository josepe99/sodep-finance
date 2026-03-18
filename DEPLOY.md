# DEPLOY - React + Vite con Runtime Configuration

## 1) Problema y solución

En Vite, `import.meta.env.VITE_*` se resuelve en build time. Para cumplir `Build once, deploy anywhere`, la URL del backend no se hardcodea en el bundle.

Se implementó este patrón:

1. `index.html` carga `/config.js` antes de `main.jsx`.
2. Al iniciar el contenedor, `scripts/start-runtime.sh` genera `dist/config.js` leyendo `TRANSACTIONS_HOST`, `ANALYTICS_HOST` y `BANK_HOST` desde variables de entorno del Pod.
3. Los módulos de API en React leen `window.__APP_CONFIG__` y usan esos hosts para consumir backend sin rebuild.

Resultado: la misma imagen sirve para Dev/QA/Prod. Solo cambia `ConfigMap` + reinicio de Pod.

## 2) Archivos clave

- `index.html`: agrega `<script src="/config.js"></script>`.
- `public/config.js`: fallback para desarrollo local.
- `src/api/transactions.js`: resuelve `TRANSACTIONS_HOST`.
- `src/api/bank.js`: resuelve `BANK_HOST`.
- `scripts/start-runtime.sh`: genera `dist/config.js` en runtime.
- `server.cjs`: servidor SPA para producción.
- `scripts/oc-deploy.sh`: crea ambiente completo en OpenShift.
- `scripts/oc-destroy.sh`: destruye ambiente.

## 3) Variables de entorno

Plantilla en `env.sample`:

```bash
TRANSACTIONS_HOST=
ANALYTICS_HOST=
BANK_HOST=
```

Ejemplo local en `.env.local`:

```bash
TRANSACTIONS_HOST=http://localhost:8080
ANALYTICS_HOST=http://localhost:8081
BANK_HOST=http://localhost:8082
```

## 4) Ejecución local

```bash
npm install
npm run dev
```

Para simular runtime config del contenedor:

```bash
npm run build
TRANSACTIONS_HOST=http://localhost:8080 \
ANALYTICS_HOST=http://localhost:8081 \
BANK_HOST=http://localhost:8082 \
npm start
```

## 5) Despliegue manual en OpenShift (CLI)

```bash
# 1. ConfigMap con hosts de backend
oc create configmap frontend-config \
  --from-literal=TRANSACTIONS_HOST=https://<route-transactions> \
  --from-literal=ANALYTICS_HOST=https://<route-analytics> \
  --from-literal=BANK_HOST=https://<route-bank> \
  --dry-run=client -o yaml | oc apply -f -

# 2. S2I Node.js desde Git
oc new-app nodejs:20-ubi9~<url-repo-git> --name mi-frontend --build-env NPM_RUN=build

# 3. Inyectar ConfigMap en Deployment/DeploymentConfig
oc set env deployment/mi-frontend --from=configmap/frontend-config || \
oc set env dc/mi-frontend --from=configmap/frontend-config

# 4. Resource requests/limits
oc set resources deployment/mi-frontend \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi || \
oc set resources dc/mi-frontend \
  --requests=cpu=250m,memory=256Mi \
  --limits=cpu=500m,memory=512Mi

# 5. Exponer ruta y validar
oc expose service mi-frontend
oc get pods
oc get route mi-frontend
```

## 6) Kubernetes estándar

### Construcción de imagen

```bash
docker build -t sodep-finance:local .
```

Si usas `kind`, carga la imagen:

```bash
kind load docker-image sodep-finance:local
```

Si usas un registry remoto:

```bash
docker tag sodep-finance:local <registry>/sodep-finance:<tag>
docker push <registry>/sodep-finance:<tag>
```

### Manifiestos incluidos

- `k8s/configmap.yaml`: hosts runtime de transactions, analytics y bank.
- `k8s/deployment.yaml`: despliegue del frontend en puerto `8080`.
- `k8s/service.yaml`: expone el Pod internamente.
- `k8s/ingress.yaml`: publica el frontend con un host configurable.
- `k8s/kustomization.yaml`: permite aplicar todo con `kubectl apply -k k8s`.

### Despliegue

1. Edita `k8s/deployment.yaml` y reemplaza `sodep-finance:local` por tu imagen real si el cluster no comparte el daemon Docker local.
2. Edita `k8s/configmap.yaml` con las URLs internas o externas correctas de los servicios backend.
3. Edita `k8s/ingress.yaml` con el host público de tu controlador Ingress.
4. Aplica los recursos:

```bash
kubectl apply -k k8s
kubectl rollout status deployment/sodep-finance
kubectl get ingress sodep-finance
```

### Verificación

```bash
kubectl get pods
kubectl port-forward svc/sodep-finance 8080:80
curl http://127.0.0.1:8080/healthz
curl http://127.0.0.1:8080/readyz
```

## 7) Automatización (simulando pipeline)

```bash
# Crear/actualizar ambiente completo
TRANSACTIONS_HOST=https://<route-transactions> \
ANALYTICS_HOST=https://<route-analytics> \
BANK_HOST=https://<route-bank> \
GIT_URL=<url-repo-git> \
./scripts/oc-deploy.sh

# Destruir ambiente
./scripts/oc-destroy.sh
```

## 8) Verificación de runtime config

1. Cambiar valor en ConfigMap:

```bash
oc create configmap frontend-config \
  --from-literal=TRANSACTIONS_HOST=https://<nueva-route-transactions> \
  --from-literal=ANALYTICS_HOST=https://<nueva-route-analytics> \
  --from-literal=BANK_HOST=https://<nueva-route-bank> \
  --dry-run=client -o yaml | oc apply -f -
```

2. Reiniciar rollout:

```bash
oc rollout restart deployment/mi-frontend || oc rollout latest dc/mi-frontend
```

3. Abrir frontend y confirmar que intenta consumir la nueva URL (visible en pantalla y en Network).

## 9) Evidencias solicitadas

- Captura de la app mostrando respuesta de backend.
- Captura de consola con:
  - `oc get pods`
  - `oc get route mi-frontend`
  - URL usada en `frontend-config`
