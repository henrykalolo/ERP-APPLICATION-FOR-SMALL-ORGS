import { useEffect, useState, useRef } from 'react'
import { reportsApi, Report, ReportExecution } from '../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../components/ui'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [executions, setExecutions] = useState<ReportExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [runningIds, setRunningIds] = useState<Set<number>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const [reportsData, executionsData] = await Promise.all([
        reportsApi.reports.list(),
        reportsApi.executions.list(),
      ])
      setReports(reportsData)
      setExecutions(executionsData)
      const currentlyRunning = new Set(
        executionsData
          .filter(e => e.status === 'running')
          .map(e => e.report)
      )
      setRunningIds(currentlyRunning)
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
      setRunningIds(prev => new Set(prev).add(id))
      await loadData()
    } catch (err) {
      setError('Unable to execute report')
    }
  }

  useEffect(() => {
    loadData()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (runningIds.size > 0) {
      intervalRef.current = setInterval(() => {
        reportsApi.executions.list().then(data => {
          setExecutions(data)
          const stillRunning = new Set(
            data
              .filter(e => e.status === 'running')
              .map(e => e.report)
          )
          setRunningIds(stillRunning)
          if (stillRunning.size === 0 && intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        })
      }, 3000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [runningIds.size])

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and monitor operational reports" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card title="Reports"><div className="text-3xl font-semibold text-gray-900">{reports.length}</div></Card>
        <Card title="Scheduled"><div className="text-3xl font-semibold text-gray-900">{reports.filter(report => report.is_scheduled).length}</div></Card>
        <Card title="Running Now"><div className="text-3xl font-semibold text-gray-900">{runningIds.size}</div></Card>
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
                {reports.map(report => {
                  const latestExecution = executions.find(e => e.report === report.id)
                  return (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{report.report_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={report.is_scheduled ? 'active' : 'inactive'} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {latestExecution?.completed_at
                          ? new Date(latestExecution.completed_at).toLocaleString()
                          : report.last_run_at || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {runningIds.has(report.id) ? (
                          <span className="text-gray-400">Running...</span>
                        ) : (
                          <button className="text-indigo-600 hover:text-indigo-900" onClick={() => executeReport(report.id)}>Run</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent Executions">
        {loading && <LoadingState />}
        {!loading && executions.length === 0 && <EmptyState title="No executions yet" />}
        {!loading && executions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggered By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.slice(0, 20).map(exec => (
                  <tr key={exec.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exec.report_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={exec.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exec.started_at ? new Date(exec.started_at).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exec.completed_at ? new Date(exec.completed_at).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exec.triggered_by || '-'}</td>
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
