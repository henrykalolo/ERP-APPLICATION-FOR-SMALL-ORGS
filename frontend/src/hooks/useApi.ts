import { useCallback, useState } from 'react'
import { buildUrl } from '../api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async <T>(
    fetcher: () => Promise<T>,
    options?: { showError?: string; onSuccess?: (data: T) => void }
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetcher()
      options?.onSuccess?.(data)
      return data
    } catch (err) {
      const msg = options?.showError || 'An error occurred'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { request, loading, error, setError }
}

export function useQuery<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, deps)

  return { data, error, loading, execute, setData }
}

export function useFilters<T>(fetcher: (params?: any) => Promise<T>, initial = '') {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apply = useCallback(async (overrides?: Record<string, string>) => {
    setLoading(true)
    setError(null)
    try {
      const merged = { ...filters, ...overrides }
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== '')
      )
      const result = await fetcher(Object.keys(cleaned).length ? cleaned : undefined)
      setData(result)
    } catch {
      setError('Failed to filter data')
    } finally {
      setLoading(false)
    }
  }, [fetcher, filters])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback((key?: string) => {
    if (key) {
      setFilters(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } else {
      setFilters({})
    }
  }, [])

  return { filters, data, error, loading, setFilter, apply, reset, setData }
}

export function useMutation<T, P extends any[] = []>(
  mutator: (...params: P) => Promise<T>,
  options?: { onSuccess?: () => void; showError?: string }
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (...params: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutator(...params)
      options?.onSuccess?.()
      return result
    } catch {
      setError(options?.showError || 'Action failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [mutator, options])

  return { mutate, loading, error, setError }
}

export function usePagedList<T>(
  fetcher: (params?: any) => Promise<T[]>,
  options?: { initialFetcher?: () => Promise<void> }
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (p = 1, append = false, extra?: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher({ page: p, ...extra })
      setItems(prev => append ? [...prev, ...result] : result)
      setPage(p)
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    load(1)
  }, [])

  const refresh = useCallback(() => load(1), [load])

  return { items, page, hasMore, total, loading, error, load, refresh, setItems, setPage, setHasMore, setTotal }
}
