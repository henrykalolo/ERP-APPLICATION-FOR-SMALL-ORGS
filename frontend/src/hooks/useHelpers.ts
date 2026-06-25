import { useState, useEffect } from 'react'

export function buildUrl(path: string, params?: Record<string, any>): string {
  if (!params) return path
  const search = new URLSearchParams()
  for (const key of Object.keys(params)) {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

export function formatCurrency(amount: number | string | null | undefined, currency = 'MWK'): string {
  if (amount === null || amount === undefined || amount === '') return '-'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function truncate(str: string | null | undefined, max = 30): string {
  if (!str) return ''
  return str.length > max ? `${str.slice(0, max)}...` : str
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
