import { buildApiUrl, getApiHost, hasApiHostConfigured } from './client'

const SIPAP_CONFIG_KEY = 'VITE_SIPAP_HOST'
const SIPAP_PROXY_PATH = '/api/sipap/favorites'
const SIPAP_API_PATH = '/favorites'

async function parseFavoritesResponse(response) {
  const rawPayload = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let parsedPayload = rawPayload

  if (isJson && rawPayload) {
    try {
      parsedPayload = JSON.parse(rawPayload)
    } catch {
      parsedPayload = rawPayload
    }
  }

  if (!response.ok) {
    const message =
      typeof parsedPayload === 'object' && parsedPayload !== null
        ? parsedPayload.message || parsedPayload.error || `La solicitud falló con estado ${response.status}.`
        : rawPayload.trim() || `La solicitud falló con estado ${response.status}.`

    throw new Error(message)
  }

  return parsedPayload
}

export function getSipapHost() {
  return getApiHost(SIPAP_CONFIG_KEY)
}

export function hasSipapHostConfigured() {
  return hasApiHostConfigured(SIPAP_CONFIG_KEY)
}

function buildFavoritesUrl() {
  return buildApiUrl(
    SIPAP_CONFIG_KEY,
    getSipapHost() ? SIPAP_API_PATH : SIPAP_PROXY_PATH,
  )
}

export async function listFavorites() {
  const response = await fetch(buildFavoritesUrl())
  return parseFavoritesResponse(response)
}

export async function createFavorite(payload) {
  const response = await fetch(buildFavoritesUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseFavoritesResponse(response)
}
