import { useEffect, useState } from 'react'
import { financeApi, Invoice } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, Money, PageHeader, StatusBadge } from '../../components/ui'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await financeApi.invoices.list(statusFilter ? { status: statusFilter } : undefined)
      setInvoices(data)
    } catch (err) {
      setError('Unable to load invoices')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: number, action: 'approve' | 'postToLedger') {
    try {
      setError('')
      if (action === 'approve') {
        await financeApi.invoices.approve(id)
      } else {
        await financeApi.invoices.postToLedger(id)
      }
      await loadData()
    } catch (err) {
      setError('Unable to update invoice')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Approve invoices and post them to the ledger" />
      <Card title="Filters">
        <select className="rounded-md border-gray-300 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} onBlur={loadData}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Invoice List">
        {loading && <LoadingState />}
        {!loading && invoices.length === 0 && <EmptyState title="No invoices found" />}
        {!loading && invoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.due_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Money amount={invoice.total_amount} currency={invoice.total_amount_currency} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={invoice.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {invoice.status === 'draft' && <button className="text-green-600 hover:text-green-900" onClick={() => handleAction(invoice.id, 'approve')}>Approve</button>}
                      {invoice.status === 'sent' && <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleAction(invoice.id, 'postToLedger')}>Post</button>}
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
