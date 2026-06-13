import { FormEvent, useEffect, useState } from 'react'
import { hrApi, LeaveRequest } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await hrApi.leaveRequests.list(statusFilter ? { status: statusFilter } : undefined)
      setLeaveRequests(data)
    } catch (err) {
      setError('Unable to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: number, action: 'approve' | 'reject') {
    try {
      if (action === 'approve') {
        await hrApi.leaveRequests.approve(id)
      } else {
        const rejectionReason = window.prompt('Rejection reason') || ''
        await hrApi.leaveRequests.reject(id, rejectionReason)
      }
      await loadData()
    } catch (err) {
      setError('Unable to update leave request')
    }
  }

  function submitFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loadData()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Requests" description="Review, approve, and reject employee leave requests" />
      <Card title="Filters">
        <form onSubmit={submitFilter} className="flex items-center gap-3">
          <select
            className="rounded-md border-gray-300 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Apply</button>
        </form>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Requests">
        {loading && <LoadingState />}
        {!loading && leaveRequests.length === 0 && <EmptyState title="No leave requests found" />}
        {!loading && leaveRequests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map(request => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.leave_type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.start_date} to {request.end_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.days_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={request.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {request.status === 'pending' && <button className="text-green-600 hover:text-green-900" onClick={() => handleStatusChange(request.id, 'approve')}>Approve</button>}
                      {request.status === 'pending' && <button className="text-red-600 hover:text-red-900" onClick={() => handleStatusChange(request.id, 'reject')}>Reject</button>}
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
