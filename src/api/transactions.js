import { buildApiUrl, getApiHost, hasApiHostConfigured, parseJsonResponse } from './client'

const TRANSACTIONS_CONFIG_KEY = 'VITE_TRANSACTIONS_HOST'

export function getTransactionsHost() {
  return getApiHost(TRANSACTIONS_CONFIG_KEY)
}

export function hasTransactionsHostConfigured() {
  return hasApiHostConfigured(TRANSACTIONS_CONFIG_KEY)
}

export async function listTransactions() {
  const response = await fetch(buildApiUrl(TRANSACTIONS_CONFIG_KEY, '/api/transactions'))
  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function getTransaction(id) {
  const response = await fetch(buildApiUrl(TRANSACTIONS_CONFIG_KEY, `/api/transactions/${id}`))
  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function createTransaction(transaction) {
  const response = await fetch(buildApiUrl(TRANSACTIONS_CONFIG_KEY, '/api/transactions'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  })

  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function updateTransaction(id, transaction) {
  const response = await fetch(buildApiUrl(TRANSACTIONS_CONFIG_KEY, `/api/transactions/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  })

  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function deleteTransaction(id) {
  const response = await fetch(buildApiUrl(TRANSACTIONS_CONFIG_KEY, `/api/transactions/${id}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    const payload = await parseJsonResponse(response)
    return payload
  }
}
