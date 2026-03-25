import { buildApiUrl, getApiHost, hasApiHostConfigured, parseRawResponse } from './client'

const SIPAP_CONFIG_KEY = 'VITE_SIPAP_HOST'

export function getSipapHost() {
  return getApiHost(SIPAP_CONFIG_KEY)
}

export function hasSipapHostConfigured() {
  return hasApiHostConfigured(SIPAP_CONFIG_KEY)
}

export async function createFavorite(payload) {
  const response = await fetch(buildApiUrl(SIPAP_CONFIG_KEY, '/favorites'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseRawResponse(response)
}
