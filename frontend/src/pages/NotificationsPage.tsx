import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, ShoppingBag, Package, AlertTriangle } from 'lucide-react'
import { notificationsApi } from '../api'
import { Notification, PageResponse } from '../types'
import { timeAgo } from '../utils'
import toast from 'react-hot-toast'

function getIcon(type: string) {
  if (type.includes('ORDER')) return <ShoppingBag size={16} className="text-blue-500" />
  if (type.includes('STOCK') || type.includes('INVENTORY')) return <AlertTriangle size={16} className="text-red-500" />
  return <Bell size={16} className="text-brand-500" />
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<PageResponse<Notification>>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ size: 50 }).then(r => r.data),
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      toast.success('All notifications marked as read')
    },
  })

  const notifications = data?.content ?? []
  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500 mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead.mutate()} className="btn-secondary text-sm gap-2">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">All caught up!</p>
          <p className="text-sm mt-1">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`card p-4 flex gap-4 transition-all ${!n.isRead ? 'border-brand-200 bg-brand-50/30' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                !n.isRead ? 'bg-brand-100' : 'bg-gray-100'
              }`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
