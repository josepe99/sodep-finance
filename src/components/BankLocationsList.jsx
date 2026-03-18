export function BankLocationsList({ items }) {
  return (
    <div className="bank-location-list">
      {items.map((ubicacion) => (
        <article className="bank-location-item" key={ubicacion.id}>
          <div className="bank-location-row">
            <div className="bank-location-copy">
              <p className="bank-location-title">
                {ubicacion.titulo || ubicacion.nombre || 'Ubicacion sin titulo'}
              </p>
              <p className="bank-location-subtitle">
                {[ubicacion.tipo, ubicacion.nombre].filter(Boolean).join(' · ')}
              </p>
            </div>

            <div className="bank-location-tags">
              {ubicacion.ciudad && <span>{ubicacion.ciudad}</span>}
              {ubicacion.departamento && <span>{ubicacion.departamento}</span>}
            </div>
          </div>

          <div className="bank-location-row bank-location-row-details">
            <p>
              <strong>Direccion:</strong> {ubicacion.direccion || 'Sin direccion'}
            </p>
            {ubicacion.barrio && (
              <p>
                <strong>Barrio:</strong> {ubicacion.barrio}
              </p>
            )}
            <p>
              <strong>Coords:</strong>{' '}
              {ubicacion.latitud !== undefined && ubicacion.longitud !== undefined
                ? `${ubicacion.latitud}, ${ubicacion.longitud}`
                : 'Sin coordenadas'}
            </p>
            {ubicacion.descripcion && (
              <p>
                <strong>Descripcion:</strong> {ubicacion.descripcion}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
