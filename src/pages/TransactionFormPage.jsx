import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { hasApiUrlConfigured } from '../api/client'
import {
  createTransaction,
  getTransaction,
  updateTransaction,
} from '../api/transactions'
import { PageHeader } from '../components/PageHeader'
import { TransactionForm } from '../components/TransactionForm'
import {
  EMPTY_TRANSACTION_FORM,
  getSubmitPayload,
  toDateTimeLocalValue,
} from '../utils/transactions'

export function TransactionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const hasApiUrl = hasApiUrlConfigured()

  const [form, setForm] = useState(EMPTY_TRANSACTION_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(isEditing ? 'loading' : 'ready')

  useEffect(() => {
    if (!hasApiUrl) {
      setStatus('error')
      setError('No hay VITE_API_URL configurado.')
      return
    }

    if (!isEditing) {
      setForm(EMPTY_TRANSACTION_FORM)
      setStatus('ready')
      setError('')
      return
    }

    let ignore = false

    async function loadTransaction() {
      setStatus('loading')
      setError('')

      try {
        const transaction = await getTransaction(id)

        if (ignore) {
          return
        }

        setForm({
          amount: String(transaction.amount),
          type: transaction.type,
          description: transaction.description || '',
          date: toDateTimeLocalValue(transaction.date),
        })
        setStatus('ready')
      } catch (requestError) {
        if (ignore) {
          return
        }

        setStatus('error')
        setError(requestError.message)
      }
    }

    void loadTransaction()

    return () => {
      ignore = true
    }
  }, [hasApiUrl, id, isEditing])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hasApiUrl) {
      setError('No hay VITE_API_URL configurado.')
      return
    }

    if (!form.amount || Number(form.amount) === 0) {
      setError('El monto debe ser distinto de 0.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = getSubmitPayload(form, isEditing)

      if (isEditing) {
        await updateTransaction(id, payload)
      } else {
        await createTransaction(payload)
      }

      navigate('/transactions')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Transacciones"
        title={isEditing ? `Editar transaccion #${id}` : 'Nueva transaccion'}
        description={
          isEditing
            ? 'Carga la transaccion por ID y actualiza sus datos.'
            : 'Crea una nueva transaccion usando el mismo contrato del backend.'
        }
        actions={
          <Link className="button-secondary button-link" to="/transactions">
            Volver al listado
          </Link>
        }
      />

      <section className="content-grid content-grid-single">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h3>{isEditing ? 'Formulario de edicion' : 'Formulario de alta'}</h3>
              <p>Usa `INCOME` o `OUTGOING` segun el contrato del backend.</p>
            </div>
          </div>

          {status === 'loading' && <p className="empty-state">Cargando transaccion...</p>}

          {status !== 'loading' && (
            <TransactionForm
              form={form}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitLabel={isEditing ? 'Actualizar transaccion' : 'Crear transaccion'}
            />
          )}

          {status === 'error' && isEditing && (
            <p className="empty-state">No se pudo cargar la transaccion solicitada.</p>
          )}

          {error && <p className="error">{error}</p>}
        </article>
      </section>
    </>
  )
}
