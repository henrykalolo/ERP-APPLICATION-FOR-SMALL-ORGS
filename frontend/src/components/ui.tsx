import { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="mt-4 flex md:ml-4 md:mt-0">{actions}</div>}
    </div>
  )
}

export function Card({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {title && <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.replace(/_/g, ' ')
  const className = status === 'active' || status === 'approved' || status === 'paid' || status === 'completed' || status === 'won' || status === 'confirmed'
    ? 'bg-green-100 text-green-800'
    : status === 'pending' || status === 'draft' || status === 'planning' || status === 'new'
      ? 'bg-yellow-100 text-yellow-800'
      : status === 'rejected' || status === 'cancelled' || status === 'failed' || status === 'lost' || status === 'on_hold'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}>
      {normalized}
    </span>
  )
}

export function Money({ amount, currency = 'MWK' }: { amount: number | string | null | undefined; currency?: string }) {
  if (amount === null || amount === undefined || amount === '') return <span>-</span>
  return <span>{currency} {amount}</span>
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <div className="text-sm text-gray-500 py-8 text-center">{label}</div>
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{message}</div>
}
