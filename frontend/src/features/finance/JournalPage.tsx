import { useEffect, useState } from 'react'
import { financeApi, JournalEntry } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await financeApi.journalEntries.list(statusFilter ? { status: statusFilter } : undefined)
      setEntries(data)
    } catch (err) {
      setError('Unable to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  async function postEntry(id: number) {
    try {
      setError('')
      await financeApi.journalEntries.post(id)
      await loadData()
    } catch (err) {
      setError('Unable to post journal entry')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Journal Entries" description="Review and post double-entry journal records" />
      <Card title="Filters">
        <select className="rounded-md border-gray-300 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} onBlur={loadData}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Journal Ledger">
        {loading && <LoadingState />}
        {!loading && entries.length === 0 && <EmptyState title="No journal entries found" />}
        {!loading && entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lines</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.entry_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.lines.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={entry.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {entry.status === 'draft' && <button className="text-indigo-600 hover:text-indigo-900" onClick={() => postEntry(entry.id)}>Post</button>}
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
