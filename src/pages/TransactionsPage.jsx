import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBalance, hasAnalyticsHostConfigured } from '../api/analytics'
import {
  deleteTransaction,
  hasTransactionsHostConfigured,
  listTransactions,
} from '../api/transactions'
import { PageHeader } from '../components/PageHeader'
import { TransactionList } from '../components/TransactionList'
import { TransactionSummary } from '../components/TransactionSummary'
import { sortTransactions } from '../utils/transactions'

async function loadDashboardData() {
  const [items, balance] = await Promise.all([listTransactions(), getBalance()])
  return {
    items: sortTransactions(items),
    balance,
  }
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const hasTransactionsHost = hasTransactionsHostConfigured()
  const hasAnalyticsHost = hasAnalyticsHostConfigured()
  const hasRequiredHosts = hasTransactionsHost && hasAnalyticsHost
  const missingHosts = []

  if (!hasTransactionsHost) {
    missingHosts.push('VITE_TRANSACTIONS_HOST')
  }

  if (!hasAnalyticsHost) {
    missingHosts.push('VITE_ANALYTICS_HOST')
  }

  const missingHostsMessage = `No hay ${missingHosts.join(' y ')} configurado${missingHosts.length > 1 ? 's' : ''}.`

  useEffect(() => {
    if (!hasRequiredHosts) {
      setStatus('error')
      setError(missingHostsMessage)
      setTransactions([])
      setBalance(null)
      return
    }

    let ignore = false

    async function loadTransactions() {
      setStatus('loading')
      setError('')

      try {
        const dashboardData = await loadDashboardData()

        if (ignore) {
          return
        }

        setTransactions(dashboardData.items)
        setBalance(dashboardData.balance)
        setStatus('success')
      } catch (requestError) {
        if (ignore) {
          return
        }

        setStatus('error')
        setTransactions([])
        setBalance(null)
        setError(requestError.message)
      }
    }

    void loadTransactions()

    return () => {
      ignore = true
    }
  }, [hasRequiredHosts, missingHostsMessage])

  async function handleRefresh() {
    if (!hasRequiredHosts) {
      setError(missingHostsMessage)
      return
    }

    setStatus('loading')
    setError('')

    try {
      const dashboardData = await loadDashboardData()
      setTransactions(dashboardData.items)
      setBalance(dashboardData.balance)
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setTransactions([])
      setBalance(null)
      setError(requestError.message)
    }
  }

  async function handleDelete(transactionId) {
    const shouldDelete = window.confirm('Esta accion eliminara la transaccion seleccionada.')

    if (!shouldDelete) {
      return
    }

    setDeletingId(transactionId)
    setError('')

    try {
      await deleteTransaction(transactionId)
      await handleRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

  const incomeTotal = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const outgoingTotal = transactions
    .filter((transaction) => transaction.type === 'OUTGOING')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  return (
    <>
      <PageHeader
        eyebrow="Transacciones"
        title="Listado de transacciones"
        description="Vista principal para consultar el balance, revisar movimientos y entrar a alta o edicion."
        actions={
          <div className="header-actions">
            <Link className="button-link" to="/transactions/new">
              Nueva transaccion
            </Link>
            <button type="button" className="button-secondary" onClick={handleRefresh}>
              Recargar
            </button>
          </div>
        }
      />

      {error && <p className="error page-error">{error}</p>}

      <TransactionSummary balance={balance} incomeTotal={incomeTotal} outgoingTotal={outgoingTotal} />

      <section className="panel section-stack">
        <div className="panel-header">
          <div>
            <h3>Movimientos</h3>
            <p>{transactions.length} transacciones activas</p>
          </div>
        </div>

        {status === 'loading' && transactions.length === 0 && (
          <p className="empty-state">Cargando transacciones...</p>
        )}

        {status === 'success' && transactions.length === 0 && (
          <p className="empty-state">No hay transacciones activas para mostrar.</p>
        )}

        {transactions.length > 0 && (
          <TransactionList deletingId={deletingId} onDelete={handleDelete} transactions={transactions} />
        )}
      </section>
    </>
  )
}
