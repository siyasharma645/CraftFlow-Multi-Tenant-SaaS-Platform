import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, AlertTriangle, Package, ArrowUp, ArrowDown, X, Loader2, Archive } from 'lucide-react'
import { inventoryApi } from '../api'
import { InventoryItem, PageResponse } from '../types'
import { formatCurrency, formatDate } from '../utils'

const TYPES = ['RAW_MATERIAL','FINISHED_GOOD','PACKAGING','TOOL']

interface ItemForm { type: string; name: string; sku: string; unit: string; lowStockThreshold: string; unitCost: string; supplierName: string; location: string }
interface TxForm { type: string; quantity: string; notes: string; unitCost: string }

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [showItemForm, setShowItemForm] = useState(false)
  const [txItem, setTxItem] = useState<InventoryItem | null>(null)
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery<PageResponse<InventoryItem>>({
    queryKey: ['inventory', page],
    queryFn: () => inventoryApi.list({ page, size: 20 }).then(r => r.data),
  })

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory-low-stock'],
    queryFn: () => inventoryApi.lowStock().then(r => r.data),
  })

  const itemForm = useForm<ItemForm>({ defaultValues: { type: 'RAW_MATERIAL', unit: 'piece' } })
  const txForm = useForm<TxForm>({ defaultValues: { type: 'STOCK_IN', quantity: '1' } })

  const createItem = useMutation({
    mutationFn: (d: any) => inventoryApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item added!'); setShowItemForm(false); itemForm.reset() },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const adjustStock = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryApi.adjust(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
      toast.success('Stock updated!')
      setTxItem(null); txForm.reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const allItems = data?.content ?? []
  const items = activeTab === 'ALL' ? allItems : allItems.filter(i => i.type === activeTab)
  const lowCount = lowStockItems.length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.totalElements ?? 0} items · {lowCount} low stock</p>
        </div>
        <button onClick={() => setShowItemForm(true)} className="btn-primary"><Plus size={16} /> Add Item</button>
      </div>

      {/* Low stock alert bar */}
      {lowCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 text-sm">{lowCount} item{lowCount > 1 ? 's' : ''} running low</p>
            <p className="text-red-500 text-xs mt-0.5">{lowStockItems.slice(0,3).map(i => i.name).join(', ')}{lowCount > 3 ? ` and ${lowCount - 3} more` : ''}</p>
          </div>
        </div>
      )}

      {/* Type tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['ALL', ...TYPES].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTab === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="card p-5 h-32 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Archive size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No inventory items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`card p-5 hover:shadow-md transition-shadow ${item.isLowStock ? 'border-red-200' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {item.type.replace('_',' ')}
                    </span>
                    {item.isLowStock && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertTriangle size={11} /> Low
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                  {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Available</span>
                  <span className={`font-bold ${item.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.availableQuantity} {item.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${item.isLowStock ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (item.availableQuantity / (item.lowStockThreshold * 3)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Min: {item.lowStockThreshold} {item.unit}</p>
              </div>

              {item.unitCost && (
                <p className="text-xs text-gray-500 mb-3">Unit cost: {formatCurrency(item.unitCost)}</p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setTxItem(item); txForm.setValue('type', 'STOCK_IN') }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
                  <ArrowUp size={13} /> Stock In
                </button>
                <button onClick={() => { setTxItem(item); txForm.setValue('type', 'STOCK_OUT') }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                  <ArrowDown size={13} /> Stock Out
                </button>
              </div>

              {item.supplierName && (
                <p className="text-xs text-gray-400 mt-2">Supplier: {item.supplierName}</p>
              )}
              {item.lastRestockedAt && (
                <p className="text-xs text-gray-400">Last restocked: {formatDate(item.lastRestockedAt)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-500 flex items-center px-3">Page {page + 1}</span>
          <button disabled={data?.last} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Inventory Item</h2>
              <button onClick={() => { setShowItemForm(false); itemForm.reset() }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={itemForm.handleSubmit(d => createItem.mutate({
              type: d.type, name: d.name, sku: d.sku, unit: d.unit,
              lowStockThreshold: Number(d.lowStockThreshold) || 10,
              unitCost: Number(d.unitCost) || null,
              supplierName: d.supplierName, location: d.location,
            }))} className="p-6 space-y-4">
              <div>
                <label className="label">Type</label>
                <select {...itemForm.register('type')} className="input">
                  {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Name *</label>
                <input {...itemForm.register('name', { required: 'Required' })} className="input" placeholder="e.g. Soy Wax" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU</label>
                  <input {...itemForm.register('sku')} className="input" />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select {...itemForm.register('unit')} className="input">
                    {['piece','kg','gram','litre','ml','metre','box','set','roll','sheet'].map(u =>
                      <option key={u} value={u}>{u}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="label">Low Stock Alert</label>
                  <input type="number" {...itemForm.register('lowStockThreshold')} className="input" placeholder="10" />
                </div>
                <div>
                  <label className="label">Unit Cost (₹)</label>
                  <input type="number" step="0.01" {...itemForm.register('unitCost')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Supplier Name</label>
                <input {...itemForm.register('supplierName')} className="input" />
              </div>
              <div>
                <label className="label">Storage Location</label>
                <input {...itemForm.register('location')} className="input" placeholder="e.g. Shelf A3" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createItem.isPending} className="btn-primary flex-1 justify-center">
                  {createItem.isPending ? <Loader2 size={15} className="animate-spin" /> : null} Add Item
                </button>
                <button type="button" onClick={() => { setShowItemForm(false); itemForm.reset() }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {txItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Adjust Stock — {txItem.name}</h2>
              <button onClick={() => { setTxItem(null); txForm.reset() }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={txForm.handleSubmit(d => adjustStock.mutate({ id: txItem.id, data: { type: d.type, quantity: Number(d.quantity), notes: d.notes, unitCost: Number(d.unitCost) || null } }))}
              className="p-6 space-y-4">
              <div className="flex gap-2">
                {['STOCK_IN','STOCK_OUT','ADJUSTMENT'].map(t => (
                  <button key={t} type="button" onClick={() => txForm.setValue('type', t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      txForm.watch('type') === t
                        ? t === 'STOCK_IN' ? 'bg-green-600 text-white border-green-600'
                          : t === 'STOCK_OUT' ? 'bg-red-600 text-white border-red-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                    {t.replace('_',' ')}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Current Stock</span><span className="font-bold">{txItem.quantity} {txItem.unit}</span></div>
                <div className="flex justify-between mt-1"><span className="text-gray-500">Available</span><span className="font-medium text-green-700">{txItem.availableQuantity} {txItem.unit}</span></div>
              </div>
              <div>
                <label className="label">Quantity ({txItem.unit}) *</label>
                <input type="number" step="0.001" min="0.001" {...txForm.register('quantity', { required: true, min: 0.001 })} className="input" />
              </div>
              <div>
                <label className="label">Unit Cost (₹)</label>
                <input type="number" step="0.01" {...txForm.register('unitCost')} className="input" placeholder="Optional" />
              </div>
              <div>
                <label className="label">Notes</label>
                <input {...txForm.register('notes')} className="input" placeholder="Reason for adjustment..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={adjustStock.isPending} className="btn-primary flex-1 justify-center">
                  {adjustStock.isPending ? <Loader2 size={15} className="animate-spin" /> : null} Confirm
                </button>
                <button type="button" onClick={() => { setTxItem(null); txForm.reset() }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
