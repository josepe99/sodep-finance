# DEPLOY - Runtime Configuration con múltiples microservicios

## 1) Objetivo

El frontend se construye una sola vez y las URLs de los tres microservicios se inyectan en runtime desde el Pod:

- `VITE_TRANSACTIONS_HOST`
- `VITE_ANALYTICS_HOST`
- `VITE_BANK_HOST`

El problema original es que en Vite/React las variables `import.meta.env.VITE_*` se resuelven durante el build. Si esas URLs se definen ahí para producción, quedan embebidas en el bundle y obligan a reconstruir la imagen para cada ambiente.

## 2) Solución implementada

Se implementó un esquema de runtime configuration basado en un script de entrada del contenedor.

Mecanismo elegido:

1. La imagen se construye una sola vez con `pnpm build`.
2. Cuando el contenedor arranca, `scripts/start-runtime.sh` lee `VITE_TRANSACTIONS_HOST`, `VITE_ANALYTICS_HOST` y `VITE_BANK_HOST` desde las variables de entorno inyectadas en el Pod.
3. Ese script genera dinámicamente `dist/config.js`.
4. `index.html` carga `/config.js` antes de iniciar React.
5. El frontend lee `window.__APP_CONFIG__` en tiempo de ejecución y arma las requests HTTP con la URL correcta para cada microservicio.

En otras palabras: usé un script de entrada. No usé `envsubst` con Nginx y tampoco un servidor Express intermedio para proxyear Quarkus.

## 3) Por qué esta solución cumple el requisito

- Ninguna URL de backend queda hardcodeada en el bundle.
- La app React no depende de los `.env` usados durante el build para producción.
- OpenShift puede cambiar cualquiera de las tres URLs vía `ConfigMap`.
- Con reiniciar el Pod alcanza para que se regenere `config.js`.
- No hace falta reconstruir la imagen.

## 4) Archivos clave

- `index.html`
- `public/config.js`
- `src/api/client.js`
- `src/api/transactions.js`
- `src/api/analytics.js`
- `src/api/bank.js`
- `scripts/start-runtime.sh`
- `server.cjs`
- `scripts/oc-deploy.sh`
- `k8s/configmap.yaml`
- `k8s/deployment.yaml`

## 5) Qué hace cada archivo

- `scripts/start-runtime.sh`: actúa como entrypoint. Lee las tres variables del entorno y escribe `dist/config.js`.
- `public/config.js`: fallback vacío para desarrollo y para que el archivo exista antes del reemplazo en runtime.
- `index.html`: garantiza que `config.js` se cargue antes que React.
- `src/api/client.js`: centraliza la lectura de `window.__APP_CONFIG__` y construye las URLs finales.
- `src/api/transactions.js`: usa `VITE_TRANSACTIONS_HOST`.
- `src/api/analytics.js`: usa `VITE_ANALYTICS_HOST`.
- `src/api/bank.js`: usa `VITE_BANK_HOST`.
- `server.cjs`: sirve la SPA y `config.js`; no inyecta variables en build ni hace proxy runtime.

## 6) Variables

Usa `env.sample` como plantilla:

```bash
VITE_TRANSACTIONS_HOST=
VITE_ANALYTICS_HOST=
VITE_BANK_HOST=
```

Para desarrollo local:

```bash
VITE_TRANSACTIONS_HOST=http://localhost:8080
VITE_ANALYTICS_HOST=http://localhost:8081
VITE_BANK_HOST=http://localhost:8082
```

## 7) Desarrollo local

```bash
npm install
npm run dev
```

En `npm run dev`, Vite proxya:

- `/api/transactions*` a `VITE_TRANSACTIONS_HOST`
- `/api/balance` a `VITE_ANALYTICS_HOST`
- `/api/common/centros-servicios` y `/api/secure/common/parametros` a `VITE_BANK_HOST`

Para simular runtime del contenedor:

```bash
npm run build
VITE_TRANSACTIONS_HOST=http://localhost:8080 \
VITE_ANALYTICS_HOST=http://localhost:8081 \
VITE_BANK_HOST=http://localhost:8082 \
npm start
```

## 8) Despliegue manual en OpenShift

### Crear ConfigMap

```bash
oc create configmap frontend-config \
  --from-literal=VITE_TRANSACTIONS_HOST=https://<route-transactions> \
  --from-literal=VITE_ANALYTICS_HOST=https://<route-analytics> \
  --from-literal=VITE_BANK_HOST=https://<route-bank> \
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

## 9) Script de automatización

```bash
VITE_TRANSACTIONS_HOST=https://<route-transactions> \
VITE_ANALYTICS_HOST=https://<route-analytics> \
VITE_BANK_HOST=https://<route-bank> \
GIT_URL=<url-repo-git> \
./scripts/oc-deploy.sh
```

## 10) Verificación solicitada

1. Cambia una o más URLs en el `ConfigMap`:

```bash
oc create configmap frontend-config \
  --from-literal=VITE_TRANSACTIONS_HOST=https://<nueva-route-transactions> \
  --from-literal=VITE_ANALYTICS_HOST=https://<nueva-route-analytics> \
  --from-literal=VITE_BANK_HOST=https://<nueva-route-bank> \
  --dry-run=client -o yaml | oc apply -f -
```

2. Reinicia el rollout:

```bash
oc rollout restart deployment/mi-frontend || oc rollout latest dc/mi-frontend
```

3. Abre el frontend y confirma en Network que las requests salen hacia las nuevas URLs correspondientes.

No hace falta reconstruir la imagen.
