import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ac_saved'

export function useSaved() {
  const [savedBusinesses, setSavedBusinesses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBusinesses))
  }, [savedBusinesses])

  const toggleSave = useCallback((business) => {
    setSavedBusinesses(prev => {
      const exists = prev.find(b => b.place_id === business.place_id)
      return exists ? prev.filter(b => b.place_id !== business.place_id) : [...prev, business]
    })
  }, [])

  const isSaved = useCallback((placeId) => savedBusinesses.some(b => b.place_id === placeId), [savedBusinesses])

  return {
    savedBusinesses,
    toggleSave,
    isSaved,
  }
}