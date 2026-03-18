# sodep-finance frontend

Frontend React + Vite con configuración dinámica en runtime para OpenShift.

## Comandos

```bash
npm install
npm run dev
npm run build
npm start
```

`npm start` genera `dist/config.js` a partir de `TRANSACTIONS_HOST`, `VITE_ANALYTICS_HOST` y `VITE_BANK_HOST`, sirve la SPA y además hace proxy de `/api/transactions*`, `/api/balance`, `/api/common/centros-servicios` y `/api/secure/common/parametros` para evitar CORS en el navegador.

## Variables

Usa `env.sample` como plantilla y crea `.env.local` para desarrollo local.
La app lee `TRANSACTIONS_HOST` para transacciones, `VITE_ANALYTICS_HOST` para analytics y `VITE_BANK_HOST` para bank.
En `npm run dev`, Vite proxya `/api/transactions*` a `TRANSACTIONS_HOST`, `/api/balance` a `VITE_ANALYTICS_HOST` y los endpoints bank a `VITE_BANK_HOST`.

## Despliegue en OpenShift

La documentación completa está en [DEPLOY.md](./DEPLOY.md).
