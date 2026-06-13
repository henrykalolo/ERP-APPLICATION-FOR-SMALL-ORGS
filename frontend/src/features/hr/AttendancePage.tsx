import { FormEvent, useEffect, useState } from 'react'
import { hrApi, Attendance } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui'

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await hrApi.attendance.list()
      setAttendance(data)
    } catch (err) {
      setError('Unable to load attendance')
    } finally {
      setLoading(false)
    }
  }

  async function handleClock(action: 'clockIn' | 'clockOut') {
    try {
      setError('')
      setMessage('')
      if (action === 'clockIn') {
        await hrApi.attendance.clockIn({ employee_id: employeeId })
        setMessage('Clock-in recorded')
      } else {
        await hrApi.attendance.clockOut({ employee_id: employeeId })
        setMessage('Clock-out recorded')
      }
      setEmployeeId('')
      await loadData()
    } catch (err) {
      setError('Unable to record attendance')
    }
  }

  function submitClock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleClock('clockIn')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Clock employees in and out and review attendance history" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Clock In / Out">
          <form onSubmit={submitClock} className="space-y-4">
            <input className="w-full rounded-md border-gray-300 text-sm" placeholder="Employee ID" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required />
            <textarea className="w-full rounded-md border-gray-300 text-sm" placeholder="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div className="flex gap-3">
              <button type="submit" className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">Clock In</button>
              <button type="button" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700" onClick={() => handleClock('clockOut')}>Clock Out</button>
            </div>
          </form>
          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        </Card>
        <Card title="Today Summary">
          <div className="text-3xl font-semibold text-gray-900">{attendance.filter(item => item.date === new Date().toISOString().slice(0, 10)).length}</div>
          <p className="mt-1 text-sm text-gray-500">Records captured today</p>
        </Card>
      </div>
      {error && <ErrorState message={error} />}
      <Card title="Attendance Records">
        {loading && <LoadingState />}
        {!loading && attendance.length === 0 && <EmptyState title="No attendance records found" />}
        {!loading && attendance.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clock_in || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.clock_out || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.clock_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.notes || '-'}</td>
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
