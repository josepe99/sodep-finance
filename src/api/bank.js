import { buildApiUrl, getApiHost, hasApiHostConfigured, parseRawResponse } from './client'

const BANK_CONFIG_KEY = 'VITE_BANK_HOST'

export function getBankHost() {
  return getApiHost(BANK_CONFIG_KEY)
}

export function hasBankHostConfigured() {
  return hasApiHostConfigured(BANK_CONFIG_KEY)
}

export async function getCentrosServicios(params = {}) {
  const response = await fetch(buildApiUrl(BANK_CONFIG_KEY, '/api/common/centros-servicios', params))
  return parseRawResponse(response)
}

export async function getParametrosSipap(params = {}, options = {}) {
  const response = await fetch(buildApiUrl(BANK_CONFIG_KEY, '/api/secure/common/parametros', params), {
    headers: options.authorization
      ? {
          Authorization: options.authorization,
        }
      : undefined,
  })

  return parseRawResponse(response)
}
