import { buildApiUrl, getApiHost, hasApiHostConfigured, parseJsonResponse } from './client'

const ANALYTICS_CONFIG_KEY = 'VITE_ANALYTICS_HOST'

export function getAnalyticsHost() {
  return getApiHost(ANALYTICS_CONFIG_KEY)
}

export function hasAnalyticsHostConfigured() {
  return hasApiHostConfigured(ANALYTICS_CONFIG_KEY)
}

export async function getBalance() {
  const response = await fetch(buildApiUrl(ANALYTICS_CONFIG_KEY, '/api/balance'))
  const payload = await parseJsonResponse(response)
  return payload.data
}
