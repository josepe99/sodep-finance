export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="page-header">
      <div className="page-header-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </section>
  )
}
