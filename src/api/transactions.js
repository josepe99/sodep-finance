const runtimeConfig = window.__APP_CONFIG__ || {}

const configuredTransactionsHost =
  runtimeConfig.TRANSACTIONS_HOST ||
  import.meta.env.VITE_TRANSACTIONS_HOST ||
  import.meta.env.TRANSACTIONS_HOST ||
  ''

function buildUrl(pathname = '') {
  return pathname
}

async function parseResponse(response) {
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

export function getTransactionsHost() {
  return configuredTransactionsHost.trim()
}

export async function listTransactions() {
  const response = await fetch(buildUrl('/api/transactions'))
  const payload = await parseResponse(response)
  return payload.data
}

export async function getTransaction(id) {
  const response = await fetch(buildUrl(`/api/transactions/${id}`))
  const payload = await parseResponse(response)
  return payload.data
}

export async function createTransaction(transaction) {
  const response = await fetch(buildUrl('/api/transactions'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  })

  const payload = await parseResponse(response)
  return payload.data
}

export async function updateTransaction(id, transaction) {
  const response = await fetch(buildUrl(`/api/transactions/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  })

  const payload = await parseResponse(response)
  return payload.data
}

export async function deleteTransaction(id) {
  const response = await fetch(buildUrl(`/api/transactions/${id}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    const payload = await parseResponse(response)
    return payload
  }
}
