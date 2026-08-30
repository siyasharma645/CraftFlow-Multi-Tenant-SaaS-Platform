import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Factory, Clock, AlertTriangle, Zap, ChevronRight, Calendar, TrendingUp } from 'lucide-react'
import { ordersApi } from '../api'
import { Order } from '../types'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils'

const PRODUCTION_STATUSES = ['RECEIVED','CONFIRMED','MATERIALS_READY','IN_PRODUCTION','QUALITY_CHECK','READY_TO_SHIP']

const STAGE_COLORS: Record<string, string> = {
  RECEIVED:        'bg-gray-50 border-gray-200',
  CONFIRMED:       'bg-blue-50 border-blue-200',
  MATERIALS_READY: 'bg-yellow-50 border-yellow-200',
  IN_PRODUCTION:   'bg-orange-50 border-orange-200',
  QUALITY_CHECK:   'bg-purple-50 border-purple-200',
  READY_TO_SHIP:   'bg-teal-50 border-teal-200',
}

export default function ProductionPage() {
  const { data: queue = [], isLoading } = useQuery<Order[]>({
    queryKey: ['production-queue'],
    queryFn: () => ordersApi.queue().then(r => r.data),
    refetchInterval: 30000,
  })

  const delayed = queue.filter(o => o.isDelayed)
  const rushOrders = queue.filter(o => o.isRushOrder && !o.isDelayed)
  const dueToday = queue.filter(o => {
    if (!o.deliveryDate) return false
    const today = new Date().toISOString().split('T')[0]
    return o.deliveryDate === today
  })

  const byStatus = PRODUCTION_STATUSES.reduce((acc, s) => {
    acc[s] = queue.filter(o => o.status === s)
    return acc
  }, {} as Record<string, Order[]>)

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory size={24} className="text-brand-600" /> Production Planning
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{queue.length} active orders in production pipeline</p>
        </div>
        <Link to="/kanban" className="btn-secondary text-sm">Open Kanban →</Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Factory size={16} className="text-brand-600" />
            <p className="text-sm text-gray-500 font-medium">Queue Size</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{queue.length}</p>
          <p className="text-xs text-gray-400 mt-1">active orders</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-orange-500" />
            <p className="text-sm text-gray-500 font-medium">Due Today</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{dueToday.length}</p>
          <p className="text-xs text-gray-400 mt-1">need completion</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm text-gray-500 font-medium">Delayed</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{delayed.length}</p>
          <p className="text-xs text-gray-400 mt-1">past due date</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-orange-500" />
            <p className="text-sm text-gray-500 font-medium">Rush Orders</p>
          </div>
          <p className="text-3xl font-bold text-orange-700">{rushOrders.length}</p>
          <p className="text-xs text-gray-400 mt-1">priority orders</p>
        </div>
      </div>

      {/* Delayed Alert */}
      {delayed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle size={18} /> {delayed.length} Delayed Order{delayed.length > 1 ? 's' : ''} — Action Required
          </h3>
          <div className="space-y-2">
            {delayed.map(o => (
              <Link key={o.id} to={`/orders/${o.id}`}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100 hover:border-red-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">#{o.orderNumber}</span>
                  {o.customerName && <span className="text-gray-600 text-sm">{o.customerName}</span>}
                  <span className={`badge ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-600 text-sm font-medium">Due: {formatDate(o.deliveryDate)}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Production Queue by Stage */}
      <div className="space-y-4">
        {PRODUCTION_STATUSES.map(status => {
          const orders = byStatus[status] ?? []
          if (orders.length === 0) return null
          return (
            <div key={status} className={`card border ${STAGE_COLORS[status]} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-inherit flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`badge ${ORDER_STATUS_COLORS[status as any]}`}>{ORDER_STATUS_LABELS[status as any]}</span>
                  <span className="text-sm font-semibold text-gray-700">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  {formatCurrency(orders.reduce((s, o) => s + o.totalAmount, 0))} total value
                </p>
              </div>
              <div className="divide-y divide-white/60">
                {orders.map(order => (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/80 transition-colors group">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {order.isRushOrder && <Zap size={14} className="text-orange-500 flex-shrink-0" />}
                      {order.isDelayed && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                      <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                      {order.customerName && (
                        <span className="text-gray-600 text-sm truncate">{order.customerName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      {order.deliveryDate && (
                        <span className={`flex items-center gap-1 ${order.isDelayed ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          <Clock size={12} />{formatDate(order.deliveryDate)}
                        </span>
                      )}
                      <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {queue.length === 0 && (
          <div className="card p-16 text-center text-gray-400">
            <Factory size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-600">No active production orders</p>
            <p className="text-sm mt-1">
              <Link to="/orders/new" className="text-brand-600 hover:underline">Create a new order</Link> to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
