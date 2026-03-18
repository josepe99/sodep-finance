function normalizeBankText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toLowerCase() === 'null' ? '' : normalized
}

export function getCentrosServiciosItems(response) {
  if (!response || typeof response !== 'object' || !Array.isArray(response.ubicaciones)) {
    return []
  }

  return response.ubicaciones.map((ubicacion, index) => ({
    id: `${ubicacion.nombre || 'ubicacion'}-${index}`,
    titulo: normalizeBankText(ubicacion.titulo),
    nombre: normalizeBankText(ubicacion.nombre),
    descripcion: normalizeBankText(ubicacion.descripcion),
    direccion: normalizeBankText(ubicacion.direccion),
    ciudad: normalizeBankText(ubicacion.ciudad),
    departamento: normalizeBankText(ubicacion.departamento),
    barrio: normalizeBankText(ubicacion.barrio),
    tipo: normalizeBankText(ubicacion.tipo),
    latitud: ubicacion.latitud,
    longitud: ubicacion.longitud,
  }))
}
