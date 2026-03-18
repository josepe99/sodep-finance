export const EMPTY_TRANSACTION_FORM = {
  amount: '',
  type: 'INCOME',
  description: '',
  date: '',
}

export function toDateTimeLocalValue(value) {
  return value ? value.slice(0, 16) : ''
}

export function getSubmitPayload(form, isEditing) {
  const description = form.description.trim()
  const basePayload = {
    amount: Number(form.amount),
    type: form.type,
    description: description ? description : null,
  }

  if (isEditing) {
    return {
      ...basePayload,
      date: form.date || null,
    }
  }

  if (form.date) {
    return {
      ...basePayload,
      date: form.date,
    }
  }

  return basePayload
}

export function sortTransactions(items) {
  return [...items].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime()
  })
}
