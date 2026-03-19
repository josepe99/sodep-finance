import { buildApiUrl, parseRawResponse } from './client'

export async function getCentrosServicios(params = {}) {
  const response = await fetch(buildApiUrl('/api/common/centros-servicios', params))
  return parseRawResponse(response)
}

export async function getParametrosSipap(params = {}, options = {}) {
  const response = await fetch(buildApiUrl('/api/secure/common/parametros', params), {
    headers: options.authorization
      ? {
          Authorization: options.authorization,
        }
      : undefined,
  })

  return parseRawResponse(response)
}
