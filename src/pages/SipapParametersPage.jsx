import { useState } from 'react'
import { getParametrosSipap } from '../api/bank'
import { hasApiUrlConfigured } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { formatRawData } from '../utils/formatters'

export function SipapParametersPage() {
  const [bankError, setBankError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rawResponse, setRawResponse] = useState(null)

  const hasApiUrl = hasApiUrlConfigured()

  async function handleLoadParametros() {
    if (!hasApiUrl) {
      setBankError('No hay VITE_API_URL configurado.')
      return
    }

    setIsLoading(true)
    setBankError('')

    try {
      const response = await getParametrosSipap()
      setRawResponse(response)
    } catch (requestError) {
      setBankError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Bank"
        title="Parametros SIPAP"
        description="Consulta de `/api/secure/common/parametros` separada del resto del flujo."
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Respuesta</h3>
            <p>Ejecuta la consulta cuando necesites inspeccionar los parametros actuales.</p>
          </div>
          <button type="button" onClick={handleLoadParametros} disabled={isLoading}>
            {isLoading ? 'Consultando...' : 'Cargar parametros'}
          </button>
        </div>

        <pre className="response-box">
          {rawResponse === null ? 'Todavia no hay respuesta capturada.' : formatRawData(rawResponse)}
        </pre>

        {bankError && <p className="error">{bankError}</p>}
      </section>
    </>
  )
}
