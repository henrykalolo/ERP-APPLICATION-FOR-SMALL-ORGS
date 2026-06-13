import { useEffect, useState } from 'react'
import { reportsApi, Report, ReportExecution } from '../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../components/ui'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [executions, setExecutions] = useState<ReportExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [reportsData, executionsData] = await Promise.all([
        reportsApi.reports.list(),
        reportsApi.executions.list(),
      ])
      setReports(reportsData)
      setExecutions(executionsData)
    } catch (err) {
      setError('Unable to load reports')
    } finally {
      setLoading(false)
    }
  }

  async function executeReport(id: number) {
    try {
      setError('')
      setMessage('')
      const result = await reportsApi.reports.execute(id)
      setMessage(`Report execution started: ${result.execution_id}`)
      await loadData()
    } catch (err) {
      setError('Unable to execute report')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and monitor operational reports" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card title="Reports"><div className="text-3xl font-semibold text-gray-900">{reports.length}</div></Card>
        <Card title="Scheduled"><div className="text-3xl font-semibold text-gray-900">{reports.filter(report => report.is_scheduled).length}</div></Card>
        <Card title="Recent Executions"><div className="text-3xl font-semibold text-gray-900">{executions.length}</div></Card>
      </div>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">{message}</div>}
      {error && <ErrorState message={error} />}
      <Card title="Available Reports">
        {loading && <LoadingState />}
        {!loading && reports.length === 0 && <EmptyState title="No reports configured" />}
        {!loading && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map(report => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{report.report_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={report.is_scheduled ? 'active' : 'inactive'} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.last_run_at || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900" onClick={() => executeReport(report.id)}>Run</button>
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
