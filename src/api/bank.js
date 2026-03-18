const runtimeConfig = window.__APP_CONFIG__ || {}

const configuredBankHost =
  runtimeConfig.BANK_HOST ||
  import.meta.env.VITE_BANK_HOST ||
  import.meta.env.BANK_HOST ||
  ''

function buildUrl(pathname, params) {
  const searchParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        searchParams.set(key, String(value))
      }
    })
  }

  const query = searchParams.toString()
  return query ? `${pathname}?${query}` : pathname
}

async function parseRawResponse(response) {
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

export function getBankHost() {
  return configuredBankHost.trim()
}

export async function getCentrosServicios(params = {}) {
  const response = await fetch(buildUrl('/api/common/centros-servicios', params))
  return parseRawResponse(response)
}

export async function getParametrosSipap(params = {}, options = {}) {
  const response = await fetch(buildUrl('/api/secure/common/parametros', params), {
    headers: options.authorization
      ? {
          Authorization: options.authorization,
        }
      : undefined,
  })

  return parseRawResponse(response)
}
