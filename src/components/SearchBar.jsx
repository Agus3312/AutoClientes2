import { useState, useRef, useEffect, useMemo } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { Search, MapPin, Loader2, X, Sparkles, Radar, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useBusinessSearch } from '../hooks/useBusinessSearch'

const GOOGLE_MAPS_LIBRARIES = ['places']

const QUICK_SEARCHES = [
  { label: 'Cafeterías', icon: '☕' },
  { label: 'Dentistas', icon: '🦷' },
  { label: 'Gimnasios', icon: '💪' },
  { label: 'Restaurantes', icon: '🍽️' },
  { label: 'Peluquerías', icon: '✂️' },
]

const RADIUS_OPTIONS = [
  { value: 1000,  label: '1 km' },
  { value: 2000,  label: '2 km' },
  { value: 5000,  label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 20000, label: '20 km' },
  { value: 50000, label: '50 km' },
]

export default function SearchBar() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const [businessType, setBusinessType] = useState('')
  const [location, setLocation]         = useState('')
  const [radius, setRadius]             = useState(5000)
  const locationInputRef = useRef(null)
  const autocompleteRef  = useRef(null)
  const locationCoordsRef = useRef(null)

  const [showHistory, setShowHistory] = useState(false)
  const debounceRef = useRef(null)

  const {
    isSearching, isPaginating, isAnalyzing,
    suggestedType, setSuggestedType,
    searchHistory,
    searchRadius, setSearchRadius,
    setBusinesses, setSelectedBusiness,
    placesServiceRef,
  } = useApp()

  const { search, cancelAnalysis } = useBusinessSearch()

  const recentSearchTypes = useMemo(() => {
    const seen = new Set()
    return searchHistory
      .filter(entry => {
        const key = entry.type.toLowerCase().trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 8)
  }, [searchHistory])

  useEffect(() => {
    if (suggestedType) {
      setBusinessType(suggestedType)
      setSuggestedType('')
    }
  }, [suggestedType])

  useEffect(() => {
    setSearchRadius(radius)
  }, [radius])

  // Initialize PlacesService once Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || placesServiceRef.current) return
    const div = document.createElement('div')
    placesServiceRef.current = new window.google.maps.places.PlacesService(div)
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded || !locationInputRef.current) return
    autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
      types: ['(cities)'],
      fields: ['geometry', 'name', 'formatted_address'],
    })
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      if (place.geometry) {
        setLocation(place.formatted_address || place.name)
        locationCoordsRef.current = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      }
    })
  }, [isLoaded])

  const handleSearch = (typeOverride) => {
    const type = typeOverride || businessType
    search({
      type,
      location,
      coords: locationCoordsRef.current,
      radius,
    })
  }

  const handleSearchDebounced = (typeOverride) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => handleSearch(typeOverride), 300)
  }

  const handleClear = () => {
    cancelAnalysis()
    setIsSearching(false)
    setIsPaginating(false)
    setIsAnalyzing(false)
    setLocation('')
    setBusinesses([])
    setSelectedBusiness(null)
    setLighthouseData({})
    locationCoordsRef.current = null
  }

  return (
    <div className="bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-5 py-3">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tipo de negocio…"
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleSearchDebounced()}
              className="input-field pl-10 shadow-sm"
            />
            {showHistory && recentSearchTypes.length > 0 && !businessType && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <p className="text-[11px] text-slate-400 dark:text-gray-500 px-3 pt-2 pb-1 font-medium">Busquedas recientes</p>
                {recentSearchTypes.map((entry, i) => (
                  <button
                    key={i}
                    onMouseDown={e => {
                      e.preventDefault()
                      setBusinessType(entry.type)
                      setShowHistory(false)
                      if (entry.location) setLocation(entry.location)
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="truncate">{entry.type}</span>
                    <span className="text-[11px] text-slate-400 dark:text-gray-500 ml-auto flex-shrink-0">{entry.location}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center text-slate-300 dark:text-gray-700 text-lg font-light select-none">·</div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Ciudad o zona…"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchDebounced()}
              className="input-field pl-10 shadow-sm"
            />
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-auto">
            <Radar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="input-field pl-9 pr-2 shadow-sm appearance-none cursor-pointer text-sm min-w-[100px]"
            >
              {RADIUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleSearch()} disabled={isSearching || isAnalyzing} className="btn-primary flex-1 sm:flex-none justify-center">
              {isSearching
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Buscando…</span></>
                : isAnalyzing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Analizando…</span></>
                  : <><Sparkles className="w-4 h-4" /><span>Analizar</span></>}
            </button>
            {(businessType || location) && (
              <button onClick={handleClear} className="btn-secondary px-3">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5">
          {QUICK_SEARCHES.map(q => (
            <button
              key={q.label}
              onClick={() => { setBusinessType(q.label); handleSearch(q.label) }}
              disabled={isSearching || !location.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 border border-slate-200 dark:border-gray-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{q.icon}</span>
              <span>{q.label}</span>
            </button>
          ))}
          {!location.trim() && (
            <span className="text-[11px] text-slate-400 dark:text-gray-600 self-center ml-1 italic">
              Escribe una ciudad primero
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
