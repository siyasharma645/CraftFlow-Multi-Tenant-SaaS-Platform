import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, ChevronRight, Zap, Clock } from 'lucide-react'
import { ordersApi } from '../api'
import { Order, OrderStatus, PageResponse } from '../types'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../utils'

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'All Orders' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'MATERIALS_READY', label: 'Materials Ready' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'QUALITY_CHECK', label: 'Quality Check' },
  { value: 'READY_TO_SHIP', label: 'Ready to Ship' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const status = searchParams.get('status') || ''
  const page = Number(searchParams.get('page') || 0)

  const { data, isLoading } = useQuery<PageResponse<Order>>({
    queryKey: ['orders', status, page],
    queryFn: () => ordersApi.list({ status: status || undefined, page, size: 20 })
      .then(r => r.data),
  })

  const orders = data?.content ?? []
  const total = data?.totalElements ?? 0

  function setStatus(s: string) {
    setSearchParams(s ? { status: s } : {})
  }

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber.includes(search) ||
        o.customerName?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total orders</p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          <Plus size={16} /> New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders or customers..."
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                status === s.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-3" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBagEmpty />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Due Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.isRushOrder && (
                          <span title="Rush order">
                            <Zap size={13} className="text-orange-500" />
                          </span>
                        )}
                        <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.customerName ?? <span className="text-gray-400">Walk-in</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        {order.isDelayed && (
                          <span title="Delayed" className="text-red-500"><Clock size={13} /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={order.isDelayed ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order.id}`} className="text-brand-600 hover:text-brand-700 p-1 rounded-lg hover:bg-brand-50">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page + 1} of {data!.totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setSearchParams({ page: String(page - 1) })}
                className="btn-secondary text-xs disabled:opacity-40">Prev</button>
              <button disabled={data?.last} onClick={() => setSearchParams({ page: String(page + 1) })}
                className="btn-secondary text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ShoppingBagEmpty() {
  return (
    <div className="text-gray-400">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Filter size={28} className="opacity-50" />
      </div>
      <p className="font-medium text-gray-600">No orders found</p>
      <p className="text-sm mt-1">Try changing filters or <Link to="/orders/new" className="text-brand-600 hover:underline">create a new order</Link></p>
    </div>
  )
}
