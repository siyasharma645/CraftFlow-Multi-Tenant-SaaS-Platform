import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, ShoppingBag, TrendingUp, Clock } from 'lucide-react'
import { customersApi, ordersApi } from '../api'
import { Customer, Order, PageResponse } from '../types'
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../utils'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id!).then(r => r.data),
    enabled: !!id,
  })

  const { data: ordersData } = useQuery<PageResponse<Order>>({
    queryKey: ['customer-orders', id],
    queryFn: () => ordersApi.list({ customerId: id, size: 10 }).then(r => r.data),
    enabled: !!id,
  })

  if (isLoading) return <div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" /></div>
  if (!customer) return <div className="p-8 text-center text-gray-500">Customer not found</div>

  const orders = ordersData?.content ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="space-y-5">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{customer.fullName}</h2>
            <p className="text-gray-500 text-sm mt-1">Customer since {formatDate(customer.createdAt)}</p>

            <div className="mt-4 space-y-2 text-sm text-left">
              {customer.phone && (
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />{customer.phone}
                </div>
              )}
              {customer.whatsapp && (
                <div className="flex items-center gap-2.5 text-gray-700">
                  <MessageCircle size={14} className="text-green-500 flex-shrink-0" />{customer.whatsapp}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />{customer.email}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Lifetime Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1.5"><ShoppingBag size={13} />Total Orders</span>
                <span className="font-bold text-gray-900">{customer.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1.5"><TrendingUp size={13} />Total Spent</span>
                <span className="font-bold text-green-700">{formatCurrency(customer.totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Avg. Order</span>
                <span className="font-semibold text-gray-700">{formatCurrency(customer.averageOrderValue)}</span>
              </div>
              {customer.lastOrderAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5"><Clock size={13} />Last Order</span>
                  <span className="text-sm text-gray-700">{formatDate(customer.lastOrderAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Addresses</h3>
              {customer.addresses.map(addr => (
                <div key={addr.id} className={`p-3 rounded-lg text-sm ${addr.isDefault ? 'bg-brand-50 border border-brand-100' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{addr.label}</span>
                    {addr.isDefault && <span className="text-xs text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded">Default</span>}
                  </div>
                  <p className="text-gray-600">{addr.addressLine1}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                </div>
              ))}
            </div>
          )}

          {customer.notes && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Order History</h3>
              <Link to={`/orders/new`} className="btn-primary text-xs py-1.5">+ New Order</Link>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Order</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Amount</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">#{o.orderNumber}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-3 font-semibold">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-5 py-3">
                        <Link to={`/orders/${o.id}`} className="text-brand-600 hover:text-brand-700 text-xs">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
