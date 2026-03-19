# DEPLOY

## Como se resolvio

El problema es que React con Vite toma las variables `VITE_*` en build time. Si la URL del backend se define ahi, queda fija en la imagen y obliga a reconstruirla para cada ambiente.

Para evitar eso, se uso un script de arranque del contenedor:

1. El Pod recibe las variables de entorno desde OpenShift.
2. Al iniciar, `scripts/start-runtime.sh` genera `dist/config.js`.
3. `index.html` carga `config.js` antes de levantar React.
4. React lee esas variables en runtime desde `window.__APP_CONFIG__`.

No se uso `envsubst` ni un proxy intermedio. Se uso `config.js` dinamico en el arranque del contenedor.

## Variables usadas

Como el backend esta separado en microservicios, no se usa una sola URL:

- `VITE_TRANSACTIONS_HOST`
- `VITE_ANALYTICS_HOST`
- `VITE_BANK_HOST`

## OpenShift

Se usa la imagen S2I de Node.js con `oc new-app` apuntando al repositorio Git.

El `ConfigMap` se llama `frontend-config` y se inyecta en el Deployment como variables de entorno.

## Verificacion

Si cambias una URL en el `ConfigMap` y reinicias el Pod, el contenedor genera un nuevo `config.js` y React intenta conectarse a la nueva direccion sin reconstruir la imagen.
