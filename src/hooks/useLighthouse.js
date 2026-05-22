import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ac_lighthouse'

export function useLighthouse() {
  const [lighthouseData, setLighthouseData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
  })
  const [loadingLighthouse, setLoadingLighthouse] = useState({})

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lighthouseData))
  }, [lighthouseData])

  const clearLighthouseCache = useCallback(() => {
    setLighthouseData({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    lighthouseData,
    setLighthouseData,
    loadingLighthouse,
    setLoadingLighthouse,
    clearLighthouseCache,
  }
}