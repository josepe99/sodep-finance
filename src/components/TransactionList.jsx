import { Link } from 'react-router-dom'
import { formatAmount, formatDate } from '../utils/formatters'

export function TransactionList({ deletingId, onDelete, transactions }) {
  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <article className="transaction-item" key={transaction.id}>
          <div className="transaction-main">
            <div>
              <p className="transaction-type">{transaction.type}</p>
              <h3>{transaction.description || 'Sin descripcion'}</h3>
            </div>

            <strong className={transaction.type === 'INCOME' ? 'amount-income' : 'amount-outgoing'}>
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatAmount(transaction.amount)}
            </strong>
          </div>

          <dl className="transaction-meta">
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(transaction.date)}</dd>
            </div>
            <div>
              <dt>Actualizado</dt>
              <dd>{formatDate(transaction.updatedAt)}</dd>
            </div>
          </dl>

          <div className="row-actions">
            <Link className="button-secondary button-link" to={`/transactions/${transaction.id}`}>
              Editar
            </Link>
            <button
              type="button"
              className="button-danger"
              onClick={() => onDelete(transaction.id)}
              disabled={deletingId === transaction.id}
            >
              {deletingId === transaction.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
