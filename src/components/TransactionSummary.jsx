import { formatAmount } from '../utils/formatters'

export function TransactionSummary({ balance, incomeTotal, outgoingTotal }) {
  return (
    <section className="summary-grid">
      <article className="summary-card">
        <span>Ingresos</span>
        <strong>{formatAmount(incomeTotal)}</strong>
      </article>
      <article className="summary-card">
        <span>Egresos</span>
        <strong>{formatAmount(outgoingTotal)}</strong>
      </article>
      <article className="summary-card">
        <span>Balance</span>
        <strong>{balance === null ? '...' : formatAmount(balance)}</strong>
      </article>
    </section>
  )
}
