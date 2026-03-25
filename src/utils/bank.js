function normalizeBankText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toLowerCase() === 'null' ? '' : normalized
}

function getUbicacionReferenceId(ubicacion) {
  return normalizeBankText(
    ubicacion.referenceId ??
      ubicacion.id ??
      ubicacion.centroId ??
      ubicacion.codigo ??
      ubicacion.codigoCentro,
  )
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
