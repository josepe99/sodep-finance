import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ruta"
        title="Pagina no encontrada"
        description="La ruta solicitada no existe dentro del panel."
        actions={
          <Link className="button-link" to="/transactions">
            Ir a transacciones
          </Link>
        }
      />

      <section className="panel">
        <p className="empty-state">Usa el menu superior para navegar a una seccion valida.</p>
      </section>
    </>
  )
}
