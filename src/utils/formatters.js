const numberFormatter = new Intl.NumberFormat('es-PY', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatAmount(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.replace('T', ' ')
  }

  return new Intl.DateTimeFormat('es-PY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export function formatRawData(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value, null, 2)
}
