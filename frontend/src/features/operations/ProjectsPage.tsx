import { useEffect, useState } from 'react'
import { operationsApi, Project } from '../../api'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await operationsApi.projects.list(statusFilter ? { status: statusFilter } : undefined)
      setProjects(data)
    } catch (err) {
      setError('Unable to load projects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Project status and Kanban-ready workflow data" />
      <Card title="Project Filter">
        <select className="rounded-md border-gray-300 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} onBlur={loadData}>
          <option value="">All statuses</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>
      {error && <ErrorState message={error} />}
      <Card title="Project Board">
        {loading && <LoadingState />}
        {!loading && projects.length === 0 && <EmptyState title="No projects found" />}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(project => (
              <div key={project.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{project.code}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-3 text-sm text-gray-500">{project.description || 'No description'}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div>Customer: {project.customer_name || '-'}</div>
                  <div>Priority: <span className="capitalize">{project.priority.replace('_', ' ')}</span></div>
                  <div>Progress: {project.progress}%</div>
                  <div>Assigned: {project.assigned_to_email || '-'}</div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${Math.min(project.progress, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
