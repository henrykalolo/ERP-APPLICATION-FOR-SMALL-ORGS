import { useEffect, useState } from 'react'
import { operationsApi, Lead } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadDataWithFilter('')
  }, [])

  async function convertLead(id: number) {
    try {
      setError('')
      await operationsApi.leads.convertToCustomer(id)
      await loadDataWithFilter(statusFilter)
    } catch (err) {
      setError('Unable to convert lead')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="CRM pipeline and lead conversion" />
      <Card title="Pipeline Filter">
        <select className="rounded-md border-gray-300 text-sm" value={statusFilter} onChange={(event) => applyFilter(event.target.value)}>
          <option value="">All stages</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Lead Pipeline">
        {loading && <LoadingState />}
        {!loading && leads.length === 0 && <EmptyState title="No leads found" />}
        {!loading && leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={lead.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.estimated_value ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.probability}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!lead.converted_to_customer && lead.status !== 'lost' && <button className="text-indigo-600 hover:text-indigo-900" onClick={() => convertLead(lead.id)}>Convert</button>}
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
