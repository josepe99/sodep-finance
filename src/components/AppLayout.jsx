import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/transactions', label: 'Transacciones' },
  { to: '/services-center', label: 'Centros de servicios' },
  { to: '/sipap-parameters', label: 'Parámetros SIPAP' },
]

function getNavLinkClassName({ isActive }) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link'
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <div className="site-brand">
            <p className="eyebrow">Sodep Finance</p>
            <strong>Panel operativo</strong>
          </div>

          <nav className="site-nav" aria-label="Navegacion principal">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container page-shell">
        <Outlet />
      </main>
    </div>
  )
}
