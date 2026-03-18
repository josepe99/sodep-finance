# DEPLOY - React + Vite en OpenShift con Runtime Configuration

## 1) Problema y solución

En Vite, `import.meta.env.VITE_*` se resuelve en build time. Para cumplir `Build once, deploy anywhere`, la URL del backend no se hardcodea en el bundle.

Se implementó este patrón:

1. `index.html` carga `/config.js` antes de `main.jsx`.
2. Al iniciar el contenedor, `scripts/start-runtime.sh` genera `dist/config.js` leyendo `VITE_API_URL` desde variables de entorno del Pod.
3. React lee `window.__APP_CONFIG__.VITE_API_URL` y usa ese valor para el `fetch`.

Resultado: la misma imagen sirve para Dev/QA/Prod. Solo cambia `ConfigMap` + reinicio de Pod.

## 2) Archivos clave

- `index.html`: agrega `<script src="/config.js"></script>`.
- `public/config.js`: fallback para desarrollo local.
- `src/App.jsx`: consume `window.__APP_CONFIG__.VITE_API_URL`.
- `scripts/start-runtime.sh`: genera `dist/config.js` en runtime.
- `server.cjs`: servidor SPA para producción.
- `scripts/oc-deploy.sh`: crea ambiente completo en OpenShift.
- `scripts/oc-destroy.sh`: destruye ambiente.

## 3) Variables de entorno

Plantilla en `env.sample`:

```bash
VITE_API_URL=
```

Ejemplo local en `.env.local`:

```bash
VITE_API_URL=http://localhost:8080/api
```

## 4) Ejecución local

```bash
npm install
npm run dev
```

Para simular runtime config del contenedor:

```bash
npm run build
VITE_API_URL=http://localhost:8080/api npm start
```

## 5) Despliegue manual en OpenShift (CLI)

```bash
# 1. ConfigMap con URL de Quarkus
oc create configmap frontend-config \
  --from-literal=VITE_API_URL=https://<route-quarkus>/api \
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

## 6) Automatización (simulando pipeline)

```bash
# Crear/actualizar ambiente completo
API_URL=https://<route-quarkus>/api GIT_URL=<url-repo-git> ./scripts/oc-deploy.sh

# Destruir ambiente
./scripts/oc-destroy.sh
```

## 7) Verificación de runtime config

1. Cambiar valor en ConfigMap:

```bash
oc create configmap frontend-config \
  --from-literal=VITE_API_URL=https://<nueva-route-quarkus>/api \
  --dry-run=client -o yaml | oc apply -f -
```

2. Reiniciar rollout:

```bash
oc rollout restart deployment/mi-frontend || oc rollout latest dc/mi-frontend
```

3. Abrir frontend y confirmar que intenta consumir la nueva URL (visible en pantalla y en Network).

## 8) Evidencias solicitadas

- Captura de la app mostrando respuesta de backend.
- Captura de consola con:
  - `oc get pods`
  - `oc get route mi-frontend`
  - URL usada en `frontend-config`
