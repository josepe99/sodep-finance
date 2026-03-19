import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeTarget(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiUrl = env.VITE_API_URL || ''
  const serverConfig = apiUrl
    ? {
        proxy: {
          '/api': {
            target: normalizeTarget(apiUrl),
            changeOrigin: true,
          },
        },
      }
    : undefined

  return {
    plugins: [react()],
    server: serverConfig,
    preview: serverConfig,
  }
})
