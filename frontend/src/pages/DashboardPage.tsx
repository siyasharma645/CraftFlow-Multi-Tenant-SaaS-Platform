import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Clock, Factory, AlertTriangle,
  TrendingUp, Calendar, Package, ChevronRight, Zap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { dashboardApi, ordersApi, inventoryApi } from '../api'
import { DashboardData, Order } from '../types'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const STATUS_ORDER = [
  'RECEIVED','CONFIRMED','MATERIALS_READY','IN_PRODUCTION',
  'QUALITY_CHECK','READY_TO_SHIP','DELIVERED'
]
const STATUS_CHART_COLORS = [
  '#94a3b8','#60a5fa','#fbbf24','#f97316',
  '#a78bfa','#2dd4bf','#22c55e'
]

function StatCard({ icon: Icon, label, value, sub, color, to }: any) {
  const card = (
    <div className={`card p-5 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{card}</Link> : card
}

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth)

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data),
    refetchInterval: 60000,
  })

  const { data: queueData } = useQuery({
    queryKey: ['production-queue'],
    queryFn: () => ordersApi.queue().then(r => r.data as Order[]),
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock-inventory'],
    queryFn: () => inventoryApi.lowStock().then(r => r.data),
  })

  const chartData = STATUS_ORDER.map((status, i) => ({
    name: ORDER_STATUS_LABELS[status as any] ?? status,
    count: dashboard?.statusBreakdown?.[status] ?? 0,
    color: STATUS_CHART_COLORS[i],
  })).filter(d => d.count > 0)

  const queue: Order[] = queueData ?? []
  const lowStock: any[] = lowStockData ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-0.5">Here's what's happening with {user?.businessName} today.</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard icon={ShoppingBag} label="Total Orders" value={dashboard?.totalOrders ?? 0}
            color="bg-blue-50 text-blue-600" to="/orders" />
          <StatCard icon={Clock} label="Pending Orders" value={dashboard?.pendingOrders ?? 0}
            sub="Awaiting confirmation" color="bg-yellow-50 text-yellow-600" to="/orders?status=RECEIVED" />
          <StatCard icon={Factory} label="In Production" value={dashboard?.inProductionOrders ?? 0}
            color="bg-orange-50 text-orange-600" to="/kanban" />
          <StatCard icon={AlertTriangle} label="Delayed Orders" value={dashboard?.delayedOrders ?? 0}
            color="bg-red-50 text-red-600" />
          <StatCard icon={Calendar} label="Due Today" value={dashboard?.ordersDueToday ?? 0}
            color="bg-purple-50 text-purple-600" />
          <StatCard icon={Calendar} label="Due This Week" value={dashboard?.ordersDueThisWeek ?? 0}
            color="bg-teal-50 text-teal-600" />
          <StatCard icon={TrendingUp} label="Monthly Revenue"
            value={formatCurrency(dashboard?.monthlyRevenue ?? 0)}
            color="bg-green-50 text-green-600" />
          <StatCard icon={Package} label="Low Stock Alerts" value={lowStock.length}
            color="bg-rose-50 text-rose-600" to="/inventory" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4">Orders by Status</h2>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Low Stock Alerts</h2>
            <Link to="/inventory" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Package size={28} className="mb-2 opacity-40" />
              <p className="text-sm">All stock levels OK</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 6).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold text-red-600">{item.availableQuantity} {item.unit}</p>
                    <p className="text-xs text-gray-400">min {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Production Queue */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-brand-600" />
              <h2 className="font-semibold text-gray-800">Production Queue</h2>
              {queue.length > 0 && (
                <span className="badge bg-brand-100 text-brand-700">{queue.length}</span>
              )}
            </div>
            <Link to="/production" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Full view <ChevronRight size={12} />
            </Link>
          </div>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-gray-400">
              <p className="text-sm">No active production orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-gray-500 font-medium">Order</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Customer</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Due</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Amount</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queue.slice(0, 8).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {order.isRushOrder && <Zap size={12} className="text-orange-500" />}
                          #{order.orderNumber}
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-600">{order.customerName ?? '—'}</td>
                      <td className="py-2.5">
                        <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={order.isDelayed ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-2.5">
                        <Link to={`/orders/${order.id}`}
                          className="text-brand-600 hover:text-brand-700">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
