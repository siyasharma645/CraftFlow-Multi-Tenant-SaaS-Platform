export interface AuthUser {
  token: string
  userId: string
  tenantId: string
  tenantSlug: string
  firstName: string
  lastName: string
  email: string
  role: string
  businessName: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  amountPaid: number
  currency: string
  deliveryDate?: string
  deliveredAt?: string
  notes?: string
  isRushOrder: boolean
  priority: number
  isDelayed: boolean
  items: OrderItem[]
  statusHistory: StatusHistory[]
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'RECEIVED' | 'CONFIRMED' | 'MATERIALS_READY' | 'IN_PRODUCTION'
  | 'QUALITY_CHECK' | 'READY_TO_SHIP' | 'DELIVERED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface OrderItem {
  id: string
  productName: string
  productSku?: string
  quantity: number
  unitPrice: number
  discountPercent: number
  lineTotal: number
  customizationNotes?: string
  productionStatus: string
  productId?: string
}

export interface StatusHistory {
  fromStatus?: string
  toStatus: string
  changedBy: string
  notes?: string
  changedAt: string
}

export interface Product {
  id: string
  sku?: string
  name: string
  description?: string
  price: number
  costPrice?: number
  unit: string
  productionTimeHours: number
  stockQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  isActive: boolean
  isLowStock: boolean
  categoryId?: string
  categoryName?: string
  categoryColor?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  whatsapp?: string
  notes?: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderAt?: string
  isActive: boolean
  addresses: CustomerAddress[]
  createdAt: string
}

export interface CustomerAddress {
  id: string
  label: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface InventoryItem {
  id: string
  type: string
  name: string
  description?: string
  sku?: string
  unit: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lowStockThreshold: number
  unitCost?: number
  supplierName?: string
  location?: string
  isLowStock: boolean
  lastRestockedAt?: string
  createdAt: string
}

export interface DashboardData {
  totalOrders: number
  pendingOrders: number
  inProductionOrders: number
  delayedOrders: number
  ordersDueToday: number
  ordersDueThisWeek: number
  monthlyRevenue: number
  statusBreakdown: Record<string, number>
  lowStockAlerts: number
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  last: boolean
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}
