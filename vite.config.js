import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeTarget(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const transactionsHost = env.VITE_TRANSACTIONS_HOST || ''
  const analyticsHost = env.VITE_ANALYTICS_HOST || ''
  const bankHost = env.VITE_BANK_HOST || ''
  const sipapHost = env.VITE_SIPAP_HOST || ''
  const proxy = {}

  if (transactionsHost) {
    proxy['/api/transactions'] = {
      target: normalizeTarget(transactionsHost),
      changeOrigin: true,
    }
  }

  if (analyticsHost) {
    proxy['/api/balance'] = {
      target: normalizeTarget(analyticsHost),
      changeOrigin: true,
    }
  }

  if (bankHost) {
    proxy['/api/common/centros-servicios'] = {
      target: normalizeTarget(bankHost),
      changeOrigin: true,
    }

    proxy['/api/secure/common/parametros'] = {
      target: normalizeTarget(bankHost),
      changeOrigin: true,
    }
  }

  if (sipapHost) {
    proxy['/favorites'] = {
      target: normalizeTarget(sipapHost),
      changeOrigin: true,
    }
  }

  const serverConfig = Object.keys(proxy).length > 0 ? { proxy } : undefined

  return {
    plugins: [react()],
    server: serverConfig,
    preview: serverConfig,
  }
})
