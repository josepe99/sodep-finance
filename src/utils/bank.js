function normalizeBankText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toLowerCase() === 'null' ? '' : normalized
}

function normalizeBankValue(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeBankValue)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((normalizedObject, key) => {
        const normalizedValue = normalizeBankValue(value[key])

        if (normalizedValue !== undefined) {
          normalizedObject[key] = normalizedValue
        }

        return normalizedObject
      }, {})
  }

  if (typeof value === 'string') {
    return normalizeBankText(value)
  }

  return value
}

function hashString(value) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

function buildReferenceIdFromObject(ubicacion) {
  if (!ubicacion || typeof ubicacion !== 'object') {
    return ''
  }

  const normalizedObject = normalizeBankValue(ubicacion)
  return `centro-${hashString(JSON.stringify(normalizedObject))}`
}

export function getCentrosServiciosItems(response) {
  if (!response || typeof response !== 'object' || !Array.isArray(response.ubicaciones)) {
    return []
  }

  return response.ubicaciones.map((ubicacion, index) => {
    const titulo = normalizeBankText(ubicacion.titulo)
    const nombre = normalizeBankText(ubicacion.nombre)
    const direccion = normalizeBankText(ubicacion.direccion)
    const referenceId = buildReferenceIdFromObject(ubicacion)
    const sourceReferenceId = normalizeBankText(
      ubicacion.referenceId ??
        ubicacion.id ??
        ubicacion.centroId ??
        ubicacion.codigo ??
        ubicacion.codigoCentro,
    )

    return {
      id: referenceId || `${ubicacion.nombre || 'ubicacion'}-${index}`,
      referenceId,
      sourceReferenceId,
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
