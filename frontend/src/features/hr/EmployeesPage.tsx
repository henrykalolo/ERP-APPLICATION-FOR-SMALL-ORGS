import { useEffect, useState } from 'react'
import { hrApi, Employee, Department } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [employeesData, departmentsData] = await Promise.all([
        hrApi.employees.list(),
        hrApi.departments.list(),
      ])
      setEmployees(employeesData)
      setDepartments(departmentsData)
    } catch (err) {
      setError('Unable to load employees')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Employee directory and department assignments" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Employees"><div className="text-3xl font-semibold text-gray-900">{employees.length}</div></Card>
        <Card title="Departments"><div className="text-3xl font-semibold text-gray-900">{departments.length}</div></Card>
        <Card title="Active Employees"><div className="text-3xl font-semibold text-gray-900">{employees.filter(employee => employee.employment_status === 'active').length}</div></Card>
        <Card title="On Leave"><div className="text-3xl font-semibold text-gray-900">{employees.filter(employee => employee.employment_status === 'on_leave').length}</div></Card>
      </div>
      {error && <ErrorState message={error} />}
      <Card title="Employee List">
        {loading && <LoadingState />}
        {!loading && employees.length === 0 && <EmptyState title="No employees found" description="Create employees in the backend or seed demo data." />}
        {!loading && employees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.user_full_name || employee.user_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employee_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.job_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 capitalize">{employee.employment_status.replace('_', ' ')}</span></td>
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
