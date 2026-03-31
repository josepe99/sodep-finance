import { useState } from 'react'
import { getCentrosServicios, hasBankHostConfigured } from '../api/bank'
import { createFavorite, hasSipapHostConfigured } from '../api/favorites'
import { BankLocationsList } from '../components/BankLocationsList'
import { getCentrosServiciosItems } from '../utils/bank'

function getFavoriteSaveErrorMessage(error) {
  const rawMessage = String(error?.message || '').trim()

  if (!rawMessage) {
    return 'No se pudo guardar el favorito.'
  }

  if (/favorite/i.test(rawMessage)) {
    return 'Ya se ha agregado a favoritos'
  }

  return rawMessage
}

export function ServicesCenterPage() {
  const [query, setQuery] = useState('')
  const [bankError, setBankError] = useState('')
  const [favoritesError, setFavoritesError] = useState('')
  const [favoritesMessage, setFavoritesMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingFavorites, setIsSavingFavorites] = useState(false)
  const [rawResponse, setRawResponse] = useState(null)
  const [savedFavoriteIds, setSavedFavoriteIds] = useState([])
  const [selectedItemIds, setSelectedItemIds] = useState([])

  const hasBankHost = hasBankHostConfigured()
  const hasSipapHost = hasSipapHostConfigured()
  const items = getCentrosServiciosItems(rawResponse)
  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id))
  const savableSelectedItems = selectedItems.filter((item) => item.referenceId)

  function handleToggleSelection(itemId) {
    if (!itemId) {
      return
    }

    const selectedItem = items.find((item) => item.id === itemId)
    if (!selectedItem?.referenceId || savedFavoriteIds.includes(selectedItem.referenceId)) {
      return
    }

    setSelectedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hasBankHost) {
      setBankError('No hay VITE_BANK_HOST configurado.')
      return
    }

    setIsLoading(true)
    setBankError('')
    setFavoritesError('')
    setFavoritesMessage('')
    setSelectedItemIds([])

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

  async function handleSaveFavorites() {
    if (!hasSipapHost) {
      setFavoritesError('No hay VITE_SIPAP_HOST configurado.')
      return
    }

    if (selectedItems.length === 0) {
      setFavoritesError('Selecciona al menos un centro.')
      return
    }

    if (savableSelectedItems.length === 0) {
      setFavoritesError('Selecciona al menos un centro con identificador válido.')
      return
    }

    setIsSavingFavorites(true)
    setFavoritesError('')
    setFavoritesMessage('')

    try {
      const results = await Promise.allSettled(
        savableSelectedItems.map((item) =>
          createFavorite({
            type: 'CENTRO',
            referenceId: item.referenceId,
            description: item.favoriteDescription,
          }),
        ),
      )

      const successfulIds = []
      const failedMessages = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulIds.push(savableSelectedItems[index].referenceId)
          return
        }

        failedMessages.push(getFavoriteSaveErrorMessage(result.reason))
      })

      if (successfulIds.length > 0) {
        setSavedFavoriteIds((currentIds) => [...new Set([...currentIds, ...successfulIds])])
        setSelectedItemIds((currentIds) =>
          currentIds.filter((itemId) => {
            const currentItem = items.find((item) => item.id === itemId)
            return currentItem && !successfulIds.includes(currentItem.referenceId)
          }),
        )
        setFavoritesMessage(
          successfulIds.length === 1
            ? 'Se guardo 1 favorito.'
            : `Se guardaron ${successfulIds.length} favoritos.`,
        )
      }

      if (selectedItems.length > savableSelectedItems.length) {
        failedMessages.push('Algunos seleccionados no tienen referenceId y no se pudieron guardar.')
      }

      if (failedMessages.length > 0) {
        setFavoritesError([...new Set(failedMessages)].join(' | '))
      }
    } finally {
      setIsSavingFavorites(false)
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
            <button
              type="button"
              className="button-secondary"
              disabled={isSavingFavorites || selectedItems.length === 0}
              onClick={handleSaveFavorites}
            >
              {isSavingFavorites
                ? 'Guardando...'
                : selectedItems.length > 0
                  ? `Guardar favoritos (${selectedItems.length})`
                  : 'Guardar favoritos'}
            </button>
          </div>

          {rawResponse === null && <p className="empty-state">Todavia no hay respuesta capturada.</p>}
          {favoritesMessage && <p className="success">{favoritesMessage}</p>}
          {favoritesError && <p className="error">{favoritesError}</p>}
          {items.some((item) => !item.referenceId) && (
            <p className="empty-state">
              Algunos resultados no tienen identificador y no se pueden guardar como favoritos.
            </p>
          )}

          {items.length > 0 && (
            <BankLocationsList
              items={items}
              onToggleSelection={handleToggleSelection}
              savedIds={savedFavoriteIds}
              selectable
              selectedIds={selectedItemIds}
            />
          )}
        </article>
      </section>
    </>
  )
}
