import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CreateOrderPage from './pages/CreateOrderPage'
import KanbanPage from './pages/KanbanPage'
import ProductsPage from './pages/ProductsPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import InventoryPage from './pages/InventoryPage'
import ProductionPage from './pages/ProductionPage'
import NotificationsPage from './pages/NotificationsPage'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="kanban" element={<KanbanPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
