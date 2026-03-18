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

export async function getBalance() {
  const response = await fetch('/api/balance')
  const payload = await parseResponse(response)
  return payload.data
}
