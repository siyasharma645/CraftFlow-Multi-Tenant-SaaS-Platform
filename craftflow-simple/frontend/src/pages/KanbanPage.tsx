import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Zap, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { ordersApi } from '../api'
import { Order, OrderStatus } from '../types'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, NEXT_STATUS } from '../utils'

const COLUMNS: OrderStatus[] = [
  'RECEIVED','CONFIRMED','MATERIALS_READY','IN_PRODUCTION',
  'QUALITY_CHECK','READY_TO_SHIP','DELIVERED'
]

const COLUMN_COLORS: Record<string, string> = {
  RECEIVED:        'border-t-gray-400',
  CONFIRMED:       'border-t-blue-400',
  MATERIALS_READY: 'border-t-yellow-400',
  IN_PRODUCTION:   'border-t-orange-400',
  QUALITY_CHECK:   'border-t-purple-400',
  READY_TO_SHIP:   'border-t-teal-400',
  DELIVERED:       'border-t-green-400',
}

export default function KanbanPage() {
  const queryClient = useQueryClient()
  const [movingId, setMovingId] = useState<string | null>(null)

  const { data: queue = [], isLoading } = useQuery<Order[]>({
    queryKey: ['kanban-queue'],
    queryFn: () => ordersApi.queue().then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: deliveredData } = useQuery({
    queryKey: ['kanban-delivered'],
    queryFn: () => ordersApi.list({ status: 'DELIVERED', size: 20 }).then(r => r.data.content as Order[]),
  })

  const allOrders: Order[] = [
    ...queue,
    ...(deliveredData ?? []),
  ]

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = allOrders.filter(o => o.status === col)
    return acc
  }, {} as Record<string, Order[]>)

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      ordersApi.updateStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-queue'] })
      queryClient.invalidateQueries({ queryKey: ['kanban-delivered'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Order moved successfully')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Cannot move order to that stage'),
    onSettled: () => setMovingId(null),
  })

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result
    if (!destination || destination.droppableId === source.droppableId) return

    const fromStatus = source.droppableId as OrderStatus
    const toStatus = destination.droppableId as OrderStatus
    const order = allOrders.find(o => o.id === draggableId)
    if (!order) return

    const expected = NEXT_STATUS[fromStatus]
    if (expected !== toStatus) {
      toast.error(`Orders must move step by step. Next step: ${ORDER_STATUS_LABELS[expected!] ?? toStatus}`)
      return
    }

    setMovingId(draggableId)
    updateStatus.mutate({ id: draggableId, status: toStatus })
  }

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-500 text-sm mt-0.5">Drag orders between columns to advance workflow</p>
        </div>
        <Link to="/orders/new" className="btn-primary text-sm">+ New Order</Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col} className={`flex-shrink-0 w-64 bg-gray-50 rounded-2xl border-t-4 ${COLUMN_COLORS[col]} border border-gray-200 flex flex-col`}>
              <div className="px-3 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 text-sm">{ORDER_STATUS_LABELS[col]}</h3>
                  <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-xs flex items-center justify-center font-bold">
                    {byStatus[col]?.length ?? 0}
                  </span>
                </div>
              </div>

              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 min-h-[400px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-brand-50' : ''
                    }`}
                  >
                    {(byStatus[col] ?? []).map((order, index) => (
                      <Draggable
                        key={order.id}
                        draggableId={order.id}
                        index={index}
                        isDragDisabled={order.status === 'DELIVERED' || order.status === 'CANCELLED' || movingId === order.id}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-xl border p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                              snapshot.isDragging ? 'shadow-lg rotate-1 border-brand-300' : 'border-gray-100 hover:border-gray-200 hover:shadow'
                            } ${movingId === order.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <span className="text-xs font-bold text-gray-800">#{order.orderNumber}</span>
                              <div className="flex items-center gap-1">
                                {order.isRushOrder && <Zap size={11} className="text-orange-500" />}
                                {order.isDelayed && <AlertTriangle size={11} className="text-red-500" />}
                                <Link to={`/orders/${order.id}`} className="text-gray-400 hover:text-brand-600" onClick={e => e.stopPropagation()}>
                                  <ExternalLink size={11} />
                                </Link>
                              </div>
                            </div>

                            {order.customerName && (
                              <p className="text-xs text-gray-600 mb-1 font-medium truncate">{order.customerName}</p>
                            )}

                            <div className="text-xs text-gray-500 space-y-0.5">
                              <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                              <p className="font-semibold text-gray-800">{formatCurrency(order.totalAmount)}</p>
                            </div>

                            {order.deliveryDate && (
                              <div className={`mt-2 flex items-center gap-1 text-xs ${
                                order.isDelayed ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                <Clock size={10} />
                                {formatDate(order.deliveryDate)}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {(byStatus[col]?.length ?? 0) === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-8 text-gray-300 text-xs">Drop here</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
