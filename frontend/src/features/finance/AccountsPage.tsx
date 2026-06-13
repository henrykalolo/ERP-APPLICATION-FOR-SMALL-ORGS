import { useEffect, useState } from 'react'
import { financeApi, Account } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await financeApi.accounts.list(typeFilter ? { account_type: typeFilter } : undefined)
      setAccounts(data)
    } catch (err) {
      setError('Unable to load accounts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Chart of accounts for tenant accounting" />
      <Card title="Filters">
        <select className="rounded-md border-gray-300 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} onBlur={loadData}>
          <option value="">All account types</option>
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="equity">Equity</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Account List">
        {loading && <LoadingState />}
        {!loading && accounts.length === 0 && <EmptyState title="No accounts found" />}
        {!loading && accounts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{account.account_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.balance_currency} {account.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={account.is_active ? 'active' : 'inactive'} /></td>
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
