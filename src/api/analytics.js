import { buildApiUrl, parseJsonResponse } from './client'

export async function getBalance() {
  const response = await fetch(buildApiUrl('/api/balance'))
  const payload = await parseJsonResponse(response)
  return payload.data
}
