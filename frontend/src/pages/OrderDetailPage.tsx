import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ArrowLeft, ChevronRight, Zap, Clock, CheckCircle2,
  Package, User, Calendar, CreditCard, Loader2, AlertTriangle
} from 'lucide-react'
import { ordersApi } from '../api'
import { Order } from '../types'
import {
  formatCurrency, formatDate, formatDateTime,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, NEXT_STATUS,
  PAYMENT_STATUS_COLORS
} from '../utils'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusNotes, setStatusNotes] = useState('')
  const [showStatusForm, setShowStatusForm] = useState(false)

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!).then(r => r.data),
    enabled: !!id,
  })

  const updateStatus = useMutation({
    mutationFn: (data: any) => ordersApi.updateStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Order status updated')
      setShowStatusForm(false)
      setStatusNotes('')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  })

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-600" />
    </div>
  )

  if (!order) return (
    <div className="p-8 text-center text-gray-500">Order not found</div>
  )

  const nextStatus = NEXT_STATUS[order.status]

  const WORKFLOW_STEPS = [
    'RECEIVED','CONFIRMED','MATERIALS_READY','IN_PRODUCTION',
    'QUALITY_CHECK','READY_TO_SHIP','DELIVERED'
  ]
  const currentIdx = WORKFLOW_STEPS.indexOf(order.status)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">#{order.orderNumber}</h1>
            {order.isRushOrder && (
              <span className="badge bg-orange-100 text-orange-700 gap-1">
                <Zap size={11} /> Rush
              </span>
            )}
            {order.isDelayed && (
              <span className="badge bg-red-100 text-red-700 gap-1">
                <AlertTriangle size={11} /> Delayed
              </span>
            )}
            <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className={`badge ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
              {order.paymentStatus}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Created {formatDateTime(order.createdAt)}</p>
        </div>

        {nextStatus && order.status !== 'CANCELLED' && (
          <button onClick={() => setShowStatusForm(true)} className="btn-primary">
            Move to {ORDER_STATUS_LABELS[nextStatus]}
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Workflow */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-0">
          {WORKFLOW_STEPS.map((step, i) => {
            const done = i < currentIdx
            const active = i === currentIdx
            const cancelled = order.status === 'CANCELLED'
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    cancelled ? 'border-gray-200 bg-gray-100 text-gray-400' :
                    done ? 'border-green-500 bg-green-500 text-white' :
                    active ? 'border-brand-600 bg-brand-600 text-white ring-4 ring-brand-100' :
                    'border-gray-200 bg-white text-gray-400'
                  }`}>
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <p className={`text-[10px] mt-1 text-center leading-tight max-w-[60px] ${
                    active ? 'text-brand-700 font-semibold' : done ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {ORDER_STATUS_LABELS[step as any]}
                  </p>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${done && !cancelled ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Status update form */}
      {showStatusForm && nextStatus && (
        <div className="card p-5 mb-6 border-brand-200 border-2">
          <h3 className="font-semibold text-gray-800 mb-3">
            Confirm: Move to "{ORDER_STATUS_LABELS[nextStatus]}"
          </h3>
          <textarea
            value={statusNotes}
            onChange={e => setStatusNotes(e.target.value)}
            placeholder="Optional notes about this status change..."
            className="input resize-none h-20 mb-3"
          />
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus.mutate({ status: nextStatus, notes: statusNotes })}
              disabled={updateStatus.isPending}
              className="btn-primary"
            >
              {updateStatus.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Confirm Update
            </button>
            <button onClick={() => { setShowStatusForm(false); setStatusNotes('') }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} className="text-brand-600" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-gray-400">SKU: {item.productSku}</p>}
                    {item.customizationNotes && (
                      <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                        Note: {item.customizationNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    {item.discountPercent > 0 && (
                      <p className="text-xs text-green-600">-{item.discountPercent}% off</p>
                    )}
                    <p className="font-semibold text-gray-900">{formatCurrency(item.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {[
                { label: 'Subtotal', value: order.subtotal },
                order.discountAmount > 0 && { label: 'Discount', value: -order.discountAmount },
                order.taxAmount > 0 && { label: 'Tax', value: order.taxAmount },
                order.shippingAmount > 0 && { label: 'Shipping', value: order.shippingAmount },
              ].filter(Boolean).map((row: any) => (
                <div key={row.label} className="flex justify-between text-sm text-gray-600">
                  <span>{row.label}</span>
                  <span className={row.value < 0 ? 'text-green-600' : ''}>{formatCurrency(Math.abs(row.value))}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.amountPaid > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Paid</span>
                  <span>{formatCurrency(order.amountPaid)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    {i < order.statusHistory.length - 1 && (
                      <div className="w-px bg-gray-200 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-gray-800">
                      {h.fromStatus
                        ? `${ORDER_STATUS_LABELS[h.fromStatus as any] ?? h.fromStatus} → ${ORDER_STATUS_LABELS[h.toStatus as any] ?? h.toStatus}`
                        : `Order created (${ORDER_STATUS_LABELS[h.toStatus as any] ?? h.toStatus})`
                      }
                    </p>
                    {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {h.changedBy} · {formatDateTime(h.changedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Meta */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User size={16} className="text-brand-600" /> Customer
            </h2>
            {order.customerId ? (
              <div>
                <p className="font-medium text-gray-800">{order.customerName}</p>
                {order.customerPhone && <p className="text-sm text-gray-500 mt-1">{order.customerPhone}</p>}
                <Link to={`/customers/${order.customerId}`}
                  className="text-xs text-brand-600 hover:text-brand-700 mt-2 flex items-center gap-1">
                  View profile <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Walk-in customer</p>
            )}
          </div>

          {/* Delivery */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-brand-600" /> Delivery
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className={`font-medium ${order.isDelayed ? 'text-red-600' : 'text-gray-800'}`}>
                  {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
                </span>
              </div>
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span className="font-medium text-green-600">{formatDate(order.deliveredAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className="font-medium text-gray-800">{order.priority}/10</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-brand-600" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`badge ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(order.totalAmount - order.amountPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.customerNotes) && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Notes</h2>
              {order.customerNotes && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Customer Note</p>
                  <p className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">{order.customerNotes}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Internal Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
