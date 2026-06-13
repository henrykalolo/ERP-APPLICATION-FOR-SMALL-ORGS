import { FormEvent, useEffect, useState } from 'react'
import { operationsApi, InventoryItem } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [inventoryItemId, setInventoryItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [movementType, setMovementType] = useState('adjustment')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await operationsApi.inventoryStock.list()
      setItems(data)
    } catch (err) {
      setError('Unable to load inventory')
    } finally {
      setLoading(false)
    }
  }

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setError('')
      setMessage('')
      await operationsApi.inventoryAdjustments.create({
        inventory_item: Number(inventoryItemId),
        quantity: Number(quantity),
        movement_type: movementType,
        reference,
        notes,
      })
      setMessage('Inventory adjustment recorded')
      setInventoryItemId('')
      setQuantity('')
      setReference('')
      setNotes('')
      await loadData()
    } catch (err) {
      setError('Unable to adjust inventory')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Stock" description="Stock levels and inventory adjustments" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <Card title="Items"><div className="text-3xl font-semibold text-gray-900">{items.length}</div></Card>
        <Card title="Low Stock"><div className="text-3xl font-semibold text-gray-900">{items.filter(item => item.quantity_available <= 0).length}</div></Card>
        <Card title="Allocated"><div className="text-3xl font-semibold text-gray-900">{items.reduce((total, item) => total + Number(item.quantity_allocated), 0)}</div></Card>
        <Card title="Available"><div className="text-3xl font-semibold text-gray-900">{items.reduce((total, item) => total + Number(item.quantity_available), 0)}</div></Card>
      </div>
      <Card title="Adjust Stock">
        <form onSubmit={submitAdjustment} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <input className="rounded-md border-gray-300 text-sm" placeholder="Inventory item ID" value={inventoryItemId} onChange={(event) => setInventoryItemId(event.target.value)} required />
          <input className="rounded-md border-gray-300 text-sm" type="number" placeholder="Quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
          <select className="rounded-md border-gray-300 text-sm" value={movementType} onChange={(event) => setMovementType(event.target.value)}>
            <option value="adjustment">Adjustment</option>
            <option value="receipt">Receipt</option>
            <option value="issue">Issue</option>
            <option value="transfer">Transfer</option>
            <option value="return">Return</option>
          </select>
          <input className="rounded-md border-gray-300 text-sm" placeholder="Reference" value={reference} onChange={(event) => setReference(event.target.value)} />
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700" type="submit">Adjust</button>
        </form>
        <textarea className="mt-4 w-full rounded-md border-gray-300 text-sm" placeholder="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Stock List">
        {loading && <LoadingState />}
        {!loading && items.length === 0 && <EmptyState title="No inventory items found" />}
        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_on_hand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_allocated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity_available}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || '-'}</td>
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
