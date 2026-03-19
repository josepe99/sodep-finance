import { buildApiUrl, parseJsonResponse } from './client'

export async function listTransactions() {
  const response = await fetch(buildApiUrl('/api/transactions'))
  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function getTransaction(id) {
  const response = await fetch(buildApiUrl(`/api/transactions/${id}`))
  const payload = await parseJsonResponse(response)
  return payload.data
}

export async function createTransaction(transaction) {
  const response = await fetch(buildApiUrl('/api/transactions'), {
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
  const response = await fetch(buildApiUrl(`/api/transactions/${id}`), {
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
  const response = await fetch(buildApiUrl(`/api/transactions/${id}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    const payload = await parseJsonResponse(response)
    return payload
  }
}
