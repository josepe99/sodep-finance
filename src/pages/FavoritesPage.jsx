import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hasSipapHostConfigured, listFavorites } from '../api/favorites'
import { PageHeader } from '../components/PageHeader'
import { formatDate } from '../utils/formatters'

function normalizeFavoriteText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toLowerCase() === 'null' ? '' : normalized
}

function getFavoriteEntries(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const arrayCandidates = [
    payload.favorites,
    payload.items,
    payload.data,
    payload.results,
    payload.content,
    payload.rows,
  ]

  const matchedArray = arrayCandidates.find(Array.isArray)
  if (matchedArray) {
    return matchedArray
  }

  if (payload.data && typeof payload.data === 'object') {
    const nestedArrayCandidates = [
      payload.data.favorites,
      payload.data.items,
      payload.data.results,
      payload.data.content,
      payload.data.rows,
    ]

    const matchedNestedArray = nestedArrayCandidates.find(Array.isArray)
    if (matchedNestedArray) {
      return matchedNestedArray
    }
  }

  return []
}

function normalizeFavoriteItem(item, index) {
  if (!item || typeof item !== 'object') {
    const description = normalizeFavoriteText(item)

    return {
      id: `favorito-${index}`,
      referenceId: '',
      description,
      type: '',
      createdAt: '',
      status: '',
      raw: item,
    }
  }

  return {
    id:
      normalizeFavoriteText(item.id ?? item.favoriteId ?? item.referenceId ?? item.reference_id) ||
      `favorito-${index}`,
    referenceId: normalizeFavoriteText(
      item.referenceId ?? item.reference_id ?? item.idReference ?? item.refId,
    ),
    description: normalizeFavoriteText(
      item.description ?? item.descripcion ?? item.name ?? item.nombre,
    ),
    type: normalizeFavoriteText(item.type ?? item.tipo),
    createdAt: normalizeFavoriteText(
      item.createdAt ?? item.created_at ?? item.creationDate ?? item.fechaCreacion,
    ),
    status: normalizeFavoriteText(item.status ?? item.estado),
    raw: item,
  }
}

export function FavoritesPage() {
  const hasSipapHost = hasSipapHostConfigured()
  const [rawResponse, setRawResponse] = useState(null)
  const [status, setStatus] = useState(hasSipapHost ? 'loading' : 'error')
  const [error, setError] = useState(hasSipapHost ? '' : 'No hay VITE_SIPAP_HOST configurado.')
  const items = getFavoriteEntries(rawResponse).map(normalizeFavoriteItem)

  async function handleLoadFavorites() {
    if (!hasSipapHost) {
      setStatus('error')
      setError('No hay VITE_SIPAP_HOST configurado.')
      setRawResponse(null)
      return
    }

    setStatus('loading')
    setError('')

    try {
      const response = await listFavorites()
      setRawResponse(response)
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setRawResponse(null)
      setError(requestError.message)
    }
  }

  useEffect(() => {
    if (!hasSipapHost) {
      return
    }

    let ignore = false

    async function loadFavoritesOnMount() {
      try {
        const response = await listFavorites()

        if (ignore) {
          return
        }

        setRawResponse(response)
        setStatus('success')
      } catch (requestError) {
        if (ignore) {
          return
        }

        setStatus('error')
        setRawResponse(null)
        setError(requestError.message)
      }
    }

    void loadFavoritesOnMount()

    return () => {
      ignore = true
    }
  }, [hasSipapHost])

  return (
    <>
      <PageHeader
        eyebrow="SIPAP"
        title="Favoritos"
        description="Consulta de favoritos usando GET sobre el mismo endpoint de alta."
        actions={
          <div className="header-actions">
            <Link className="button-secondary button-link" to="/services-center">
              Volver a centros
            </Link>
            <button type="button" onClick={handleLoadFavorites} disabled={status === 'loading'}>
              {status === 'loading' ? 'Consultando...' : 'Recargar'}
            </button>
          </div>
        }
      />

      {error && <p className="error page-error">{error}</p>}

      <section className="panel section-stack">
        <div className="panel-header">
          <div>
            <h3>Listado</h3>
            <p>{items.length > 0 ? `${items.length} favoritos encontrados` : 'Sin favoritos listados'}</p>
          </div>
        </div>

        {status === 'loading' && items.length === 0 && (
          <p className="empty-state">Cargando favoritos...</p>
        )}

        {status === 'success' && items.length === 0 && (
          <p className="empty-state">No hay favoritos para mostrar.</p>
        )}

        {items.length > 0 && (
          <div className="bank-location-list">
            {items.map((item) => (
              <article key={item.id} className="bank-location-item">
                <div className="bank-location-row">
                  <div className="bank-location-copy">
                    <p className="bank-location-title">{item.description || 'Favorito sin descripcion'}</p>
                    <p className="bank-location-subtitle">
                      {[item.type, item.status].filter(Boolean).join(' · ') || 'Favorito'}
                    </p>
                  </div>
                </div>

                <div className="bank-location-row bank-location-row-details">
                  <p>
                    <strong>Reference ID:</strong> {item.referenceId || 'No disponible'}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {item.createdAt ? formatDate(item.createdAt) : 'No disponible'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
