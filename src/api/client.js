const runtimeConfig = window.__APP_CONFIG__ || {}

function normalizeBaseUrl(url = '') {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function getApiHost(configKey) {
  return normalizeBaseUrl(String(runtimeConfig[configKey] || '').trim())
}

export function hasApiHostConfigured(configKey) {
  return getApiHost(configKey).length > 0 || import.meta.env.DEV
}

export function buildApiUrl(configKey, pathname, params = {}) {
  const baseUrl = getApiHost(configKey)
  const query = buildQuery(params)

  if (!baseUrl) {
    return `${pathname}${query}`
  }

  return `${baseUrl}${pathname}${query}`
}

export async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `La solicitud falló con estado ${response.status}.`
    throw new Error(message)
  }

  return payload
}

export async function parseRawResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null
        ? payload.message || payload.error || `La solicitud falló con estado ${response.status}.`
        : `La solicitud falló con estado ${response.status}.`
    throw new Error(message)
  }

  return payload
}
