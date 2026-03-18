import { Link } from 'react-router-dom'

export function TransactionForm({
  form,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
  cancelTo = '/transactions',
}) {
  return (
    <form className="transaction-form" onSubmit={onSubmit}>
      <label>
        <span>Monto</span>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={onChange}
          placeholder="1500.50"
          required
        />
      </label>

      <label>
        <span>Tipo</span>
        <select name="type" value={form.type} onChange={onChange}>
          <option value="INCOME">INCOME</option>
          <option value="OUTGOING">OUTGOING</option>
        </select>
      </label>

      <label className="field-wide">
        <span>Descripcion</span>
        <input
          name="description"
          type="text"
          value={form.description}
          onChange={onChange}
          placeholder="Salario, supermercado, servicios..."
        />
      </label>

      <label className="field-wide">
        <span>Fecha</span>
        <input name="date" type="datetime-local" value={form.date} onChange={onChange} />
      </label>

      <div className="form-actions">
        <Link className="button-secondary button-link" to={cancelTo}>
          Cancelar
        </Link>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
