import { useEffect, useState } from 'react'
import { operationsApi, Order } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, Money, PageHeader, StatusBadge } from '../../components/ui'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await operationsApi.orders.list(statusFilter ? { status: statusFilter } : undefined)
      setOrders(data)
    } catch (err) {
      setError('Unable to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: number, action: 'confirm' | 'calculateTotals') {
    try {
      setError('')
      if (action === 'confirm') {
        await operationsApi.orders.confirm(id)
      } else {
        await operationsApi.orders.calculateTotals(id)
      }
      await loadData()
    } catch (err) {
      setError('Unable to update order')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Sales orders, confirmation, and totals" />
      <Card title="Order Filter">
        <select className="rounded-md border-gray-300 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} onBlur={loadData}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Order List">
        {loading && <LoadingState />}
        {!loading && orders.length === 0 && <EmptyState title="No orders found" />}
        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.order_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Money amount={order.total_amount} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {order.status === 'draft' && <button className="text-green-600 hover:text-green-900" onClick={() => handleAction(order.id, 'confirm')}>Confirm</button>}
                      {order.status === 'draft' && <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleAction(order.id, 'calculateTotals')}>Calculate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
