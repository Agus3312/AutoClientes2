import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [compareList, setCompareList] = useState([])
  const [lighthouseData, setLighthouseData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ac_lighthouse') || '{}') } catch { return {} }
  })
  const [loadingLighthouse, setLoadingLighthouse] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 })
  const [mapZoom, setMapZoom] = useState(13)
  const [searchQuery, setSearchQuery] = useState({ type: '', location: '' })
  const [suggestedType, setSuggestedType] = useState('')  // tipo sugerido desde el panel vacío
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'no-website' | 'has-website'
  const [sortBy, setSortBy] = useState(null)          // 'performance'|'seo'|'accessibility'|'bestPractices'
  const [sortOrder, setSortOrder] = useState('asc')  // 'asc' | 'desc'
  const [showSaved, setShowSaved] = useState(false)
  const [showInteresados, setShowInteresados] = useState(false)

  const [savedBusinesses, setSavedBusinesses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ac_saved') || '[]') } catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem('ac_saved', JSON.stringify(savedBusinesses))
  }, [savedBusinesses])

  useEffect(() => {
    localStorage.setItem('ac_lighthouse', JSON.stringify(lighthouseData))
  }, [lighthouseData])

  const toggleSave = useCallback((business) => {
    setSavedBusinesses(prev => {
      const exists = prev.find(b => b.place_id === business.place_id)
      return exists ? prev.filter(b => b.place_id !== business.place_id) : [...prev, business]
    })
  }, [])
  const isSaved = useCallback((placeId) => savedBusinesses.some(b => b.place_id === placeId), [savedBusinesses])

  // Contact status: null → 'contacted' → 'responded' → 'interested' → null
  // trackedBusinesses stores business data for any business with a status
  const [contactStatuses, setContactStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ac_contact_statuses') || '{}') } catch { return {} }
  })
  const [trackedBusinesses, setTrackedBusinesses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ac_tracked') || '[]') } catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem('ac_contact_statuses', JSON.stringify(contactStatuses))
  }, [contactStatuses])
  useEffect(() => {
    localStorage.setItem('ac_tracked', JSON.stringify(trackedBusinesses))
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

  // Derived counts
  const trackedCounts = {
    contacted: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'contacted').length,
    responded: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'responded').length,
    interested: trackedBusinesses.filter(b => contactStatuses[b.place_id] === 'interested').length,
    total: trackedBusinesses.length,
  }

  const mapRef = useRef(null)
  const placesServiceRef = useRef(null)

  const addToCompare = useCallback((business) => {
    setCompareList(prev => {
      const exists = prev.find(b => b.place_id === business.place_id)
      if (exists) return prev.filter(b => b.place_id !== business.place_id)
      if (prev.length >= 3) {
        alert('Máximo 3 negocios para comparar. Elimina uno primero.')
        return prev
      }
      return [...prev, business]
    })
  }, [])

  const isInCompare = useCallback((placeId) => {
    return compareList.some(b => b.place_id === placeId)
  }, [compareList])

  const clearCompare = useCallback(() => {
    setCompareList([])
    setShowCompare(false)
  }, [])

  return (
    <AppContext.Provider value={{
      businesses, setBusinesses,
      selectedBusiness, setSelectedBusiness,
      compareList, addToCompare, isInCompare, clearCompare,
      lighthouseData, setLighthouseData,
      loadingLighthouse, setLoadingLighthouse,
      isSearching, setIsSearching,
      showCompare, setShowCompare,
      mapCenter, setMapCenter,
      mapZoom, setMapZoom,
      searchQuery, setSearchQuery,
      suggestedType, setSuggestedType,
      filterMode, setFilterMode,
      sortBy, setSortBy,
      sortOrder, setSortOrder,
      savedBusinesses, toggleSave, isSaved,
      showSaved, setShowSaved,
      contactStatuses, cycleContactStatus, clearContactStatus, getContactStatus,
      trackedBusinesses, setTrackedBusinesses, trackedCounts,
      showInteresados, setShowInteresados,
      mapRef, placesServiceRef,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
