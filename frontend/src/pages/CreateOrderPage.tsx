import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Plus, Trash2, Search, User, Package,
  Loader2, Zap, Calendar, StickyNote
} from 'lucide-react'
import { ordersApi, customersApi, productsApi } from '../api'
import { Customer, Product } from '../types'
import { formatCurrency } from '../utils'

interface OrderFormValues {
  customerId: string
  deliveryDate: string
  isRushOrder: boolean
  notes: string
  customerNotes: string
  paymentMethod: string
  taxAmount: string
  shippingAmount: string
  discountAmount: string
  items: { productId: string; quantity: number; discountPercent: string; customizationNotes: string; _name?: string; _price?: number }[]
}

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [showProductList, setShowProductList] = useState<number | null>(null)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormValues>({
    defaultValues: {
      items: [{ productId: '', quantity: 1, discountPercent: '0', customizationNotes: '' }],
      isRushOrder: false, taxAmount: '0', shippingAmount: '0', discountAmount: '0',
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const isRushOrder = watch('isRushOrder')

  const { data: customersData } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch, size: 10 }).then(r => r.data.content as Customer[]),
    enabled: showCustomerList,
  })

  const { data: productsData } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => productsApi.list({ search: productSearch, size: 20 }).then(r => r.data.content as Product[]),
  })

  const createOrder = useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Order #${res.data.orderNumber} created!`)
      navigate(`/orders/${res.data.id}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create order'),
  })

  const selectedCustomerId = watch('customerId')

  function selectCustomer(c: Customer) {
    setValue('customerId', c.id)
    setCustomerSearch(c.fullName)
    setShowCustomerList(false)
  }

  function selectProduct(index: number, p: Product) {
    setValue(`items.${index}.productId`, p.id)
    setValue(`items.${index}._name`, p.name)
    setValue(`items.${index}._price`, p.price)
    setShowProductList(null)
    setProductSearch('')
  }

  function computeSubtotal() {
    return items.reduce((sum, item) => {
      if (!item._price) return sum
      const base = (item._price || 0) * (item.quantity || 0)
      const disc = base * (Number(item.discountPercent) / 100)
      return sum + base - disc
    }, 0)
  }

  function onSubmit(data: OrderFormValues) {
    const validItems = data.items.filter(i => i.productId)
    if (validItems.length === 0) { toast.error('Add at least one product'); return }

    createOrder.mutate({
      customerId: data.customerId || null,
      deliveryDate: data.deliveryDate || null,
      isRushOrder: data.isRushOrder,
      notes: data.notes,
      customerNotes: data.customerNotes,
      paymentMethod: data.paymentMethod,
      taxAmount: Number(data.taxAmount) || 0,
      shippingAmount: Number(data.shippingAmount) || 0,
      discountAmount: Number(data.discountAmount) || 0,
      items: validItems.map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        discountPercent: Number(i.discountPercent) || 0,
        customizationNotes: i.customizationNotes,
      }))
    })
  }

  const subtotal = computeSubtotal()
  const tax = Number(watch('taxAmount')) || 0
  const shipping = Number(watch('shippingAmount')) || 0
  const discount = Number(watch('discountAmount')) || 0
  const total = subtotal + tax + shipping - discount

  const customers = customersData ?? []
  const products = productsData ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={16} className="text-brand-600" /> Customer (Optional)
              </h2>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setShowCustomerList(true) }}
                  onFocus={() => setShowCustomerList(true)}
                  placeholder="Search customer by name, email, phone..."
                  className="input pl-9"
                />
                {showCustomerList && customers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {customers.map(c => (
                      <button key={c.id} type="button" onClick={() => selectCustomer(c)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <p className="font-medium text-sm text-gray-800">{c.fullName}</p>
                        <p className="text-xs text-gray-400">{c.phone} · {c.totalOrders} orders</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCustomerId && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  ✓ Customer selected
                </p>
              )}
            </div>

            {/* Products */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package size={16} className="text-brand-600" /> Order Items
              </h2>

              {/* Product search bar */}
              <div className="relative mb-4">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="input pl-9"
                />
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const item = items[index]
                  return (
                    <div key={field.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
                      {/* Product selector */}
                      <div className="relative">
                        <label className="label">Product *</label>
                        {item._name ? (
                          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item._name}</p>
                              <p className="text-xs text-gray-400">{formatCurrency(item._price || 0)} each</p>
                            </div>
                            <button type="button" onClick={() => {
                              setValue(`items.${index}._name`, '')
                              setValue(`items.${index}.productId`, '')
                            }} className="text-xs text-gray-400 hover:text-red-500">Change</button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button type="button" onClick={() => setShowProductList(index === showProductList ? null : index)}
                              className="input text-left flex items-center gap-2 text-gray-400 w-full">
                              <Package size={14} /> Select a product
                            </button>
                            {showProductList === index && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                                {products.filter(p =>
                                  !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
                                ).map(p => (
                                  <button key={p.id} type="button" onClick={() => selectProduct(index, p)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                      <p className="text-xs text-gray-400">Stock: {p.stockQuantity}</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(p.price)}</span>
                                  </button>
                                ))}
                                {products.length === 0 && (
                                  <p className="text-center py-4 text-sm text-gray-400">No products found</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <input type="hidden" {...register(`items.${index}.productId`, { required: 'Select a product' })} />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="label">Qty</label>
                          <input type="number" min={1} {...register(`items.${index}.quantity`, { min: 1, valueAsNumber: true })}
                            className="input" />
                        </div>
                        <div>
                          <label className="label">Discount %</label>
                          <input type="number" min={0} max={100} step={0.5}
                            {...register(`items.${index}.discountPercent`)} className="input" />
                        </div>
                        <div className="flex items-end">
                          <p className="text-sm font-semibold text-gray-800 pb-2">
                            = {formatCurrency(
                              (item._price || 0) * (item.quantity || 0) *
                              (1 - (Number(item.discountPercent) || 0) / 100)
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="label">Customization Notes</label>
                        <input {...register(`items.${index}.customizationNotes`)}
                          placeholder="e.g. Blue ribbon, personalized text..." className="input" />
                      </div>

                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Trash2 size={12} /> Remove item
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, discountPercent: '0', customizationNotes: '' })}
                className="mt-3 text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
              >
                <Plus size={15} /> Add another item
              </button>
            </div>

            {/* Notes */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <StickyNote size={16} className="text-brand-600" /> Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Customer Notes</label>
                  <textarea {...register('customerNotes')} rows={3}
                    className="input resize-none" placeholder="Special requests from customer..." />
                </div>
                <div>
                  <label className="label">Internal Notes</label>
                  <textarea {...register('notes')} rows={3}
                    className="input resize-none" placeholder="Private notes for your team..." />
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Delivery */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-brand-600" /> Delivery
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Delivery Date</label>
                  <input type="date" {...register('deliveryDate')} className="input"
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select {...register('paymentMethod')} className="input">
                    <option value="">Select...</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" {...register('isRushOrder')} className="w-4 h-4 rounded accent-orange-500" />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Zap size={14} className="text-orange-500" /> Rush Order
                  </span>
                </label>
              </div>
            </div>

            {/* Pricing */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Pricing</h2>
              <div className="space-y-3">
                <div>
                  <label className="label">Tax Amount (₹)</label>
                  <input type="number" min={0} step={0.01} {...register('taxAmount')} className="input" />
                </div>
                <div>
                  <label className="label">Shipping (₹)</label>
                  <input type="number" min={0} step={0.01} {...register('shippingAmount')} className="input" />
                </div>
                <div>
                  <label className="label">Additional Discount (₹)</label>
                  <input type="number" min={0} step={0.01} {...register('discountAmount')} className="input" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                {tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(tax)}</span></div>}
                {shipping > 0 && <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>}
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <button type="submit" disabled={createOrder.isPending} className="btn-primary w-full justify-center py-3 text-base">
              {createOrder.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Create Order
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
