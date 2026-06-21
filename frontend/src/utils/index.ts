import { OrderStatus } from '../types'

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Received',
  CONFIRMED: 'Confirmed',
  MATERIALS_READY: 'Materials Ready',
  IN_PRODUCTION: 'In Production',
  QUALITY_CHECK: 'Quality Check',
  READY_TO_SHIP: 'Ready to Ship',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  RECEIVED:        'bg-gray-100 text-gray-700',
  CONFIRMED:       'bg-blue-100 text-blue-700',
  MATERIALS_READY: 'bg-yellow-100 text-yellow-700',
  IN_PRODUCTION:   'bg-orange-100 text-orange-700',
  QUALITY_CHECK:   'bg-purple-100 text-purple-700',
  READY_TO_SHIP:   'bg-teal-100 text-teal-700',
  DELIVERED:       'bg-green-100 text-green-700',
  CANCELLED:       'bg-red-100 text-red-700',
}

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEIVED:        'CONFIRMED',
  CONFIRMED:       'MATERIALS_READY',
  MATERIALS_READY: 'IN_PRODUCTION',
  IN_PRODUCTION:   'QUALITY_CHECK',
  QUALITY_CHECK:   'READY_TO_SHIP',
  READY_TO_SHIP:   'DELIVERED',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  PARTIAL:  'bg-blue-100 text-blue-700',
  PAID:     'bg-green-100 text-green-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
  FAILED:   'bg-red-100 text-red-700',
}

export function clsx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateSku(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) + '-' + Math.floor(1000 + Math.random() * 9000)
}
