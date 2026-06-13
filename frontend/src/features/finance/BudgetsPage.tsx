import { useEffect, useState } from 'react'
import { financeApi, Budget } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, Money, PageHeader, StatusBadge } from '../../components/ui'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await financeApi.budgets.list()
      setBudgets(data)
    } catch (err) {
      setError('Unable to load budgets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" description="Track approved and active fiscal budgets" />
      {error && <ErrorState message={error} />}
      <Card title="Budget List">
        {loading && <LoadingState />}
        {!loading && budgets.length === 0 && <EmptyState title="No budgets found" />}
        {!loading && budgets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiscal Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lines</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map(budget => (
                  <tr key={budget.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.fiscal_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.start_date} to {budget.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><Money amount={budget.total_budget} currency={budget.total_budget_currency} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={budget.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.lines.length}</td>
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
