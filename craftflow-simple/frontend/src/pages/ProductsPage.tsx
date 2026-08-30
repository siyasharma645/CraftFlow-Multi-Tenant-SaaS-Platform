import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, X, Loader2, Tag } from 'lucide-react'
import { productsApi } from '../api'
import { Product, PageResponse } from '../types'
import { formatCurrency } from '../utils'

interface ProductForm {
  name: string; sku: string; description: string; price: string
  costPrice: string; unit: string; productionTimeHours: string
  stockQuantity: string; lowStockThreshold: string; trackInventory: boolean
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const { data, isLoading } = useQuery<PageResponse<Product>>({
    queryKey: ['products', search, page],
    queryFn: () => productsApi.list({ search: search || undefined, page, size: 20 }).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductForm>()

  const createProduct = useMutation({
    mutationFn: (d: any) => editing ? productsApi.update(editing.id, d) : productsApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(editing ? 'Product updated!' : 'Product created!')
      handleClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save product'),
  })

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted') },
  })

  function handleClose() { setShowForm(false); setEditing(null); reset() }

  function openEdit(p: Product) {
    setEditing(p)
    reset({
      name: p.name, sku: p.sku ?? '', description: p.description ?? '',
      price: String(p.price), costPrice: String(p.costPrice ?? ''),
      unit: p.unit, productionTimeHours: String(p.productionTimeHours),
      stockQuantity: String(p.stockQuantity), lowStockThreshold: String(p.lowStockThreshold),
      trackInventory: p.trackInventory,
    })
    setShowForm(true)
  }

  function onSubmit(d: ProductForm) {
    createProduct.mutate({
      name: d.name, sku: d.sku || null, description: d.description,
      price: Number(d.price), costPrice: Number(d.costPrice) || null,
      unit: d.unit, productionTimeHours: Number(d.productionTimeHours) || 24,
      stockQuantity: Number(d.stockQuantity) || 0,
      lowStockThreshold: Number(d.lowStockThreshold) || 5,
      trackInventory: d.trackInventory,
    })
  }

  const products = data?.content ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.totalElements ?? 0} products</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true) }} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search products..." className="input pl-9" />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No products yet</p>
          <p className="text-sm mt-1">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="card p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <Package size={18} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id) }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{p.name}</h3>
              {p.sku && <p className="text-xs text-gray-400 mb-2">SKU: {p.sku}</p>}
              {p.categoryName && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-2"
                  style={{ background: p.categoryColor + '20', color: p.categoryColor }}>
                  <Tag size={10} />{p.categoryName}
                </span>
              )}
              <p className="text-lg font-bold text-gray-900 mb-2">{formatCurrency(p.price)}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className={p.isLowStock ? 'text-red-600 font-medium flex items-center gap-1' : ''}>
                  {p.isLowStock && <AlertTriangle size={11} />}
                  Stock: {p.stockQuantity} {p.unit}
                </span>
                <span>{p.productionTimeHours}h lead</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-500 flex items-center px-3">Page {page + 1} of {data!.totalPages}</span>
          <button disabled={data?.last} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Product Name *</label>
                <input {...register('name', { required: 'Required' })} className="input" placeholder="e.g. Handmade Soy Candle" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU</label>
                  <input {...register('sku')} className="input" placeholder="CANDLE-001" />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select {...register('unit')} className="input">
                    <option value="piece">Piece</option>
                    <option value="set">Set</option>
                    <option value="dozen">Dozen</option>
                    <option value="kg">KG</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="label">Selling Price (₹) *</label>
                  <input type="number" step="0.01" {...register('price', { required: 'Required', min: 0.01 })} className="input" />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="label">Cost Price (₹)</label>
                  <input type="number" step="0.01" {...register('costPrice')} className="input" />
                </div>
                <div>
                  <label className="label">Production Time (hrs)</label>
                  <input type="number" {...register('productionTimeHours')} className="input" placeholder="24" />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input type="number" {...register('stockQuantity')} className="input" placeholder="0" />
                </div>
                <div>
                  <label className="label">Low Stock Alert</label>
                  <input type="number" {...register('lowStockThreshold')} className="input" placeholder="5" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="track" {...register('trackInventory')} className="w-4 h-4 accent-brand-600" />
                  <label htmlFor="track" className="text-sm text-gray-700 cursor-pointer">Track Inventory</label>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Product description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting || createProduct.isPending} className="btn-primary flex-1 justify-center">
                  {createProduct.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  {editing ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
