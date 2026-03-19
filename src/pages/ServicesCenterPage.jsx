import { useState } from 'react'
import { getCentrosServicios, hasBankHostConfigured } from '../api/bank'
import { BankLocationsList } from '../components/BankLocationsList'
import { getCentrosServiciosItems } from '../utils/bank'

export function ServicesCenterPage() {
  const [query, setQuery] = useState('')
  const [bankError, setBankError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rawResponse, setRawResponse] = useState(null)

  const hasBankHost = hasBankHostConfigured()
  const items = getCentrosServiciosItems(rawResponse)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hasBankHost) {
      setBankError('No hay VITE_BANK_HOST configurado.')
      return
    }

    setIsLoading(true)
    setBankError('')

    try {
      const response = await getCentrosServicios({
        nombreODireccion: query,
      })
      setRawResponse(response)
    } catch (requestError) {
      setBankError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="bank-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h3>Busqueda</h3>
              <p>Filtra por nombre o direccion.</p>
            </div>
          </div>

          <form className="bank-form" onSubmit={handleSubmit}>
            <label className="field-wide">
              <span>Nombre o direccion</span>
              <input
                name="nombreODireccion"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="asuncion"
              />
            </label>

            <div className="form-actions form-actions-end">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Consultando...' : 'Buscar centros'}
              </button>
            </div>
          </form>

          {bankError && <p className="error">{bankError}</p>}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h3>Resultados</h3>
              <p>{items.length > 0 ? `${items.length} ubicaciones encontradas` : 'Sin resultados listados'}</p>
            </div>
          </div>

          {rawResponse === null && <p className="empty-state">Todavia no hay respuesta capturada.</p>}

          {items.length > 0 && <BankLocationsList items={items} />}
        </article>
      </section>
    </>
  )
}
