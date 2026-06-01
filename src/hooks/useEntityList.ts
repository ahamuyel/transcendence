"use client"
import { useState, useEffect, useCallback, useRef } from "react"

type SortConfig = { field: string; dir: "asc" | "desc" }

type UseEntityListOptions = {
  endpoint: string
  limit?: number
  storageKey?: string
}

type EntityListResult<T> = {
  data: T[]
  total: number
  page: number
  totalPages: number
  search: string
  setSearch: (s: string) => void
  setPage: (p: number) => void
  filters: Record<string, string>
  setFilters: (f: Record<string, string>) => void
  sort: SortConfig | null
  setSort: (s: SortConfig | null) => void
  clearFilters: () => void
  activeFilterCount: number
  loading: boolean
  error: string
  refetch: () => void
}

function loadFromSession(key: string): { filters?: Record<string, string>; sort?: SortConfig | null } {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(`entityList:${key}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToSession(key: string, filters: Record<string, string>, sort: SortConfig | null) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(`entityList:${key}`, JSON.stringify({ filters, sort }))
  } catch {
    // ignore quota errors
  }
}

export function useEntityList<T>({ endpoint, limit = 5, storageKey }: UseEntityListOptions): EntityListResult<T> {
  const key = storageKey || endpoint
  const saved = useRef(loadFromSession(key))

  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearchState] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFiltersState] = useState<Record<string, string>>(saved.current.filters || {})
  const [sort, setSortState] = useState<SortConfig | null>(saved.current.sort || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const debounceRef = useRef<NodeJS.Timeout>(null)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const setSearch = useCallback((s: string) => {
    setSearchState(s)
    setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(s), 300)
  }, [])

  const setFilters = useCallback((f: Record<string, string>) => {
    setFiltersState(f)
    setPage(1)
  }, [])

  const setSort = useCallback((s: SortConfig | null) => {
    setSortState(s)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    setPage(1)
  }, [])

  // Persist filters/sort to sessionStorage
  useEffect(() => {
    saveToSession(key, filters, sort)
  }, [key, filters, sort])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (debouncedSearch) params.set("search", debouncedSearch)
      // Add filters
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, v)
      }
      // Add sort
      if (sort) {
        params.set("sortBy", sort.field)
        params.set("sortDir", sort.dir)
      }
      const res = await fetch(`${endpoint}?${params}`)
      if (!res.ok) throw new Error("Erro ao carregar dados")
      const json = await res.json()
      setData(json.data)
      setTotal(json.total)
      setTotalPages(json.totalPages)
    } catch {
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, limit, debouncedSearch, filters, sort])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data, total, page, totalPages, search, setSearch, setPage,
    filters, setFilters, sort, setSort, clearFilters, activeFilterCount,
    loading, error, refetch: fetchData,
  }
}
