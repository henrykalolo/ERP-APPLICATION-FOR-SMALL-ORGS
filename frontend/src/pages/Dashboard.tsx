import { useEffect, useState } from 'react'
import apiClient from '../api/client'

interface DashboardSummary {
  employees: number
  projects: number
  pending_invoices: number
  total_revenue: string
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    employees: 0,
    projects: 0,
    pending_invoices: 0,
    total_revenue: '0',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<DashboardSummary>('/dashboard/summary/')
      .then((response) => setSummary(response.data))
      .catch(() => setSummary({ employees: 0, projects: 0, pending_invoices: 0, total_revenue: '0' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.employees}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.projects}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Invoices</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.pending_invoices}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">MWK {loading ? '…' : summary.total_revenue}</dd>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    employees: 0,
    projects: 0,
    pending_invoices: 0,
    total_revenue: '0',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<DashboardSummary>('/dashboard/summary/')
      .then((response) => setSummary(response.data))
      .catch(() => setSummary({ employees: 0, projects: 0, pending_invoices: 0, total_revenue: '0' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.employees}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.projects}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Invoices</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{loading ? '…' : summary.pending_invoices}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">MWK {loading ? '…' : summary.total_revenue}</dd>
          </div>
        </div>
      </div>
    </div>
  )
}
