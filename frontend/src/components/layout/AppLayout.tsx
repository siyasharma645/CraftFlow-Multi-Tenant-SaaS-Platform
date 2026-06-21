import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Archive,
  Trello, Factory, Bell, LogOut, Menu, X, ChevronRight,
  Scissors, AlertTriangle
} from 'lucide-react'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../../api'
import { clsx } from '../../utils'

const NAV = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/orders',      label: 'Orders',      icon: ShoppingBag },
  { to: '/kanban',      label: 'Kanban Board',icon: Trello },
  { to: '/production',  label: 'Production',  icon: Factory },
  { to: '/products',    label: 'Products',    icon: Package },
  { to: '/customers',   label: 'Customers',   icon: Users },
  { to: '/inventory',   label: 'Inventory',   icon: Archive },
  { to: '/notifications', label: 'Notifications', icon: Bell },
]

export default function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s: RootState) => s.auth)
  const { sidebarOpen } = useSelector((s: RootState) => s.ui)

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 30000,
  })

  const unread = unreadData?.count ?? 0

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={clsx(
        'flex flex-col bg-white border-r border-gray-100 transition-all duration-300 z-20 flex-shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <Scissors size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-gray-900 text-sm leading-tight">CraftFlow</p>
              <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.businessName}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} />
                {label === 'Notifications' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              {sidebarOpen && <span className="truncate">{label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div className={clsx(
            'flex items-center gap-3 px-2 py-2 rounded-xl',
            sidebarOpen && 'hover:bg-gray-50 cursor-pointer'
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role?.replace('ROLE_', '')}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Logout">
                <LogOut size={16} />
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button onClick={handleLogout} className="w-full flex justify-center py-2 text-gray-400 hover:text-red-500 transition-colors mt-1" title="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          {unread > 0 && (
            <NavLink to="/notifications" className="flex items-center gap-1.5 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-medium">
              <AlertTriangle size={14} />
              {unread} alert{unread > 1 ? 's' : ''}
            </NavLink>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
