import { useState, useCallback, useEffect, useMemo } from 'react'

const STATUS_KEY = 'ac_contact_statuses'
const TRACKED_KEY = 'ac_tracked'

export function useContactPipeline() {
  const [contactStatuses, setContactStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}') } catch { return {} }
  })
  const [trackedBusinesses, setTrackedBusinesses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STATUS_KEY, JSON.stringify(contactStatuses))
  }, [contactStatuses])

  useEffect(() => {
    localStorage.setItem(TRACKED_KEY, JSON.stringify(trackedBusinesses))
  }, [trackedBusinesses])

  const cycleContactStatus = useCallback((business) => {
    const order = [null, 'contacted', 'responded', 'interested']
    setContactStatuses(prev => {
      const current = prev[business.place_id] || null
      const idx = order.indexOf(current)
      const next = order[(idx + 1) % order.length]
      const updated = { ...prev }
      if (next === null) {
        delete updated[business.place_id]
        setTrackedBusinesses(p => p.filter(b => b.place_id !== business.place_id))
      } else {
        updated[business.place_id] = next
        setTrackedBusinesses(p => {
          if (p.some(b => b.place_id === business.place_id)) return p
          return [...p, business]
        })
      }
      return updated
    })
  }, [])

  const clearContactStatus = useCallback((placeId) => {
    setContactStatuses(prev => {
      const updated = { ...prev }
      delete updated[placeId]
      return updated
    })
    setTrackedBusinesses(p => p.filter(b => b.place_id !== placeId))
  }, [])

  const getContactStatus = useCallback((placeId) => contactStatuses[placeId] || null, [contactStatuses])

  const trackedCounts = useMemo(() => ({
    contacted: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'contacted').length,
    responded: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'responded').length,
    interested: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'interested').length,
    total: trackedBusinesses.length,
  }), [trackedBusinesses, contactStatuses])

  return {
    contactStatuses,
    trackedBusinesses,
    setTrackedBusinesses,
    cycleContactStatus,
    clearContactStatus,
    getContactStatus,
    trackedCounts,
  }
}