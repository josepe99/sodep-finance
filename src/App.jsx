import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'
import { ServicesCenterPage } from './pages/ServicesCenterPage'
import { SipapParametersPage } from './pages/SipapParametersPage'
import { TransactionFormPage } from './pages/TransactionFormPage'
import { TransactionsPage } from './pages/TransactionsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/transactions" replace />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<TransactionFormPage />} />
          <Route path="/transactions/:id" element={<TransactionFormPage />} />
          <Route path="/services-center" element={<ServicesCenterPage />} />
          <Route path="/sipap-parameters" element={<SipapParametersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
