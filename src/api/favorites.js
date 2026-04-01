import { buildApiUrl, getApiHost, hasApiHostConfigured } from './client'

const SIPAP_CONFIG_KEY = 'VITE_SIPAP_HOST'

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

export async function listFavorites() {
  const response = await fetch(buildApiUrl(SIPAP_CONFIG_KEY, '/favorites'))
  return parseFavoritesResponse(response)
}

export async function createFavorite(payload) {
  const response = await fetch(buildApiUrl(SIPAP_CONFIG_KEY, '/favorites'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseFavoritesResponse(response)
}
