import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Search, ChevronRight, User, Phone, Mail, X, Loader2, ShoppingBag, TrendingUp } from 'lucide-react'
import { customersApi } from '../api'
import { Customer, PageResponse } from '../types'
import { formatCurrency, formatDate } from '../utils'

interface CustomerForm {
  firstName: string; lastName: string; email: string; phone: string; whatsapp: string; notes: string
  addressLine1: string; city: string; state: string; postalCode: string
}

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery<PageResponse<Customer>>({
    queryKey: ['customers', search, page],
    queryFn: () => customersApi.list({ search: search || undefined, page, size: 20 }).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerForm>()

  const createMutation = useMutation({
    mutationFn: (d: any) => customersApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer added!')
      setShowForm(false); reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add customer'),
  })

  function onSubmit(d: CustomerForm) {
    createMutation.mutate({
      firstName: d.firstName, lastName: d.lastName, email: d.email,
      phone: d.phone, whatsapp: d.whatsapp, notes: d.notes,
      address: d.addressLine1 ? { addressLine1: d.addressLine1, city: d.city, state: d.state, postalCode: d.postalCode } : null,
    })
  }

  const customers = data?.content ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.totalElements ?? 0} customers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search by name, email, phone..." className="input pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-gray-50" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No customers yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Contact</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Orders</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Total Spent</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Last Order</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{c.fullName}</p>
                        <p className="text-xs text-gray-400">Since {formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      {c.phone && <p className="flex items-center gap-1.5 text-gray-600"><Phone size={12} className="text-gray-400" />{c.phone}</p>}
                      {c.email && <p className="flex items-center gap-1.5 text-gray-500 text-xs"><Mail size={11} className="text-gray-300" />{c.email}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                      <ShoppingBag size={13} className="text-brand-500" />{c.totalOrders}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-900">{formatCurrency(c.totalSpent)}</span>
                    {c.averageOrderValue > 0 && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <TrendingUp size={10} />avg {formatCurrency(c.averageOrderValue)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="text-brand-600 hover:text-brand-700 p-1 rounded-lg hover:bg-brand-50">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-500 flex items-center px-3">Page {page + 1}</span>
          <button disabled={data?.last} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Customer</h2>
              <button onClick={() => { setShowForm(false); reset() }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input {...register('firstName', { required: 'Required' })} className="input" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input {...register('lastName', { required: 'Required' })} className="input" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" {...register('email')} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input {...register('phone')} className="input" placeholder="+91..." />
                </div>
                <div>
                  <label className="label">WhatsApp</label>
                  <input {...register('whatsapp')} className="input" placeholder="+91..." />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} rows={2} className="input resize-none" placeholder="Any special notes..." />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Address (Optional)</p>
                <div className="space-y-3">
                  <input {...register('addressLine1')} className="input" placeholder="Street address" />
                  <div className="grid grid-cols-3 gap-3">
                    <input {...register('city')} className="input" placeholder="City" />
                    <input {...register('state')} className="input" placeholder="State" />
                    <input {...register('postalCode')} className="input" placeholder="PIN" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
                  {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  Add Customer
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
