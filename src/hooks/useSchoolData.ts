"use client"

import { useState, useCallback, useEffect } from "react"

/**
 * Hook to fetch and refresh school data on demand
 * Can be used in any component that needs to show school information
 * and wants to support manual refresh
 */
export function useSchoolData(schoolId?: string) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!schoolId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/schools/${schoolId}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const schoolData = await res.json()
      setData(schoolData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados da escola")
      console.error("Error fetching school data:", err)
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  // Auto-fetch on mount
  useEffect(() => {
    if (schoolId) {
      fetchData()
    }
  }, [schoolId, fetchData])

  // Return refresh function for manual refresh
  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook to fetch school settings (for school-side pages)
 * Supports manual refresh
 */
export function useSchoolSettings() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/school-settings")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const settingsData = await res.json()
      setSettings(settingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar configurações")
      console.error("Error fetching school settings:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Return refresh function for manual refresh
  return { settings, loading, error, refresh: fetchSettings }
}
