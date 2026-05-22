import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useLighthouse } from '../hooks/useLighthouse'
import { useContactPipeline } from '../hooks/useContactPipeline'
import { useSaved } from '../hooks/useSaved'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useUserSettings } from '../hooks/useUserSettings'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Core business state
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isPaginating, setIsPaginating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState({ type: '', location: '' })
  const [suggestedType, setSuggestedType] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 })
  const [mapZoom, setMapZoom] = useState(13)
  const [mapClickLocation, setMapClickLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5000)
  const mapRef = useRef(null)
  const placesServiceRef = useRef(null)

  // UI panels
  const [showCompare, setShowCompare] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showInteresados, setShowInteresados] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Compare
  const [compareList, setCompareList] = useState([])
  const addToCompare = useCallback((business) => {
    setCompareList(prev => {
      const exists = prev.find(b => b.place_id === business.place_id)
      if (exists) return prev.filter(b => b.place_id !== business.place_id)
      if (prev.length >= 3) return prev
      return [...prev, business]
    })
  }, [])
  const isInCompare = useCallback((placeId) => compareList.some(b => b.place_id === placeId), [compareList])
  const clearCompare = useCallback(() => { setCompareList([]); setShowCompare(false) }, [])

  // Toast notifications
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Delegated hooks
  const lighthouse = useLighthouse()
  const contact = useContactPipeline()
  const saved = useSaved()
  const searchHistory = useSearchHistory()
  const userSettings = useUserSettings()

  return (
    <AppContext.Provider value={{
      // Core business
      businesses, setBusinesses,
      selectedBusiness, setSelectedBusiness,
      isSearching, setIsSearching,
      isPaginating, setIsPaginating,
      isAnalyzing, setIsAnalyzing,
      searchQuery, setSearchQuery,
      suggestedType, setSuggestedType,
      filterMode, setFilterMode,
      sortBy, setSortBy,
      sortOrder, setSortOrder,

      // Map
      mapCenter, setMapCenter,
      mapZoom, setMapZoom,
      mapClickLocation, setMapClickLocation,
      searchRadius, setSearchRadius,
      mapRef, placesServiceRef,

      // Panels
      showCompare, setShowCompare,
      showSaved, setShowSaved,
      showInteresados, setShowInteresados,
      showDashboard, setShowDashboard,
      showSettings, setShowSettings,

      // Compare
      compareList, addToCompare, isInCompare, clearCompare,

      // Lighthouse (from hook)
      lighthouseData: lighthouse.lighthouseData,
      setLighthouseData: lighthouse.setLighthouseData,
      loadingLighthouse: lighthouse.loadingLighthouse,
      setLoadingLighthouse: lighthouse.setLoadingLighthouse,
      clearLighthouseCache: lighthouse.clearLighthouseCache,

      // Contact pipeline (from hook)
      contactStatuses: contact.contactStatuses,
      cycleContactStatus: contact.cycleContactStatus,
      clearContactStatus: contact.clearContactStatus,
      getContactStatus: contact.getContactStatus,
      trackedBusinesses: contact.trackedBusinesses,
      setTrackedBusinesses: contact.setTrackedBusinesses,
      trackedCounts: contact.trackedCounts,

      // Saved (from hook)
      savedBusinesses: saved.savedBusinesses,
      toggleSave: saved.toggleSave,
      isSaved: saved.isSaved,

      // Search history (from hook)
      searchHistory: searchHistory.searchHistory,
      addSearchEntry: searchHistory.addSearchEntry,

      // User settings (from hook)
      userSettings: userSettings.userSettings,
      setUserSettings: userSettings.setUserSettings,

      // Toast
      toasts, addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)