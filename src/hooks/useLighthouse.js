import { useState, useCallback, useEffect, useRef } from 'react'
import { getMapWithTTL, setMapEntryWithTTL, clearMap } from '../utils/storage'

const STORAGE_KEY = 'ac_lighthouse'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function useLighthouse() {
  const [lighthouseData, setLighthouseData] = useState(() => getMapWithTTL(STORAGE_KEY, MAX_AGE_MS))
  const [loadingLighthouse, setLoadingLighthouse] = useState({})
  const initializedRef = useRef(false)

  // Persist each entry with TTL, skip initial hydration write
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      return
    }
    // Batch persist: write the entire map
    try {
      const mapToStore = {}
      for (const [id, value] of Object.entries(lighthouseData)) {
        mapToStore[id] = { value, timestamp: value?.timestamp || Date.now() }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapToStore))
    } catch {
      // Storage full — will be handled by storage utility on next read
    }
  }, [lighthouseData])

  const clearLighthouseCache = useCallback(() => {
    setLighthouseData({})
    clearMap(STORAGE_KEY)
  }, [])

  return {
    lighthouseData,
    setLighthouseData,
    loadingLighthouse,
    setLoadingLighthouse,
    clearLighthouseCache,
  }
}