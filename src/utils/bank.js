function normalizeBankText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toLowerCase() === 'null' ? '' : normalized
}

function normalizeCoordinatePart(value) {
  const normalized = normalizeBankText(value)

  if (!normalized) {
    return null
  }

  const unsignedValue = normalized.startsWith('-') ? normalized.slice(1) : normalized
  const digitsOnly = unsignedValue.replace('.', '')

  if (!/^\d+$/.test(digitsOnly)) {
    return null
  }

  return Number(digitsOnly)
}

function buildReferenceIdFromCoordinates(ubicacion) {
  const latitudePart = normalizeCoordinatePart(ubicacion.latitud)
  const longitudePart = normalizeCoordinatePart(ubicacion.longitud)

  if (latitudePart === null || longitudePart === null) {
    return ''
  }

  return String(latitudePart + longitudePart)
}

function getUbicacionReferenceId(ubicacion) {
  return normalizeBankText(
    ubicacion.referenceId ??
      ubicacion.id ??
      ubicacion.centroId ??
      ubicacion.codigo ??
      ubicacion.codigoCentro,
  )
    || buildReferenceIdFromCoordinates(ubicacion)
}

export function getCentrosServiciosItems(response) {
  if (!response || typeof response !== 'object' || !Array.isArray(response.ubicaciones)) {
    return []
  }

  return response.ubicaciones.map((ubicacion, index) => {
    const titulo = normalizeBankText(ubicacion.titulo)
    const nombre = normalizeBankText(ubicacion.nombre)
    const direccion = normalizeBankText(ubicacion.direccion)
    const referenceId = getUbicacionReferenceId(ubicacion)

    return {
      id: referenceId || `${ubicacion.nombre || 'ubicacion'}-${index}`,
      referenceId,
      titulo,
      nombre,
      descripcion: normalizeBankText(ubicacion.descripcion),
      direccion,
      ciudad: normalizeBankText(ubicacion.ciudad),
      departamento: normalizeBankText(ubicacion.departamento),
      barrio: normalizeBankText(ubicacion.barrio),
      tipo: normalizeBankText(ubicacion.tipo),
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      favoriteDescription: [titulo, nombre, direccion].filter(Boolean).join(' · ') || 'Centro favorito',
    }
  })
}
