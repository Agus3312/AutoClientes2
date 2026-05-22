import { useState, useCallback, useEffect } from 'react'

const HISTORY_KEY = 'ac_search_history'

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory))
  }, [searchHistory])

  const addSearchEntry = useCallback((entry) => {
    setSearchHistory(prev => [entry, ...prev].slice(0, 20))
  }, [])

  return {
    searchHistory,
    addSearchEntry,
  }
}