import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, MapPin, Loader2, X, Sparkles, Radar, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getLighthouseData, detectSaasTools } from '../utils/lighthouseApi'

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
  const [businessType, setBusinessType] = useState('')
  const [location, setLocation]         = useState('')
  const [radius, setRadius]             = useState(5000)
  const locationInputRef = useRef(null)
  const autocompleteRef  = useRef(null)
  const locationCoordsRef = useRef(null)

  const [showHistory, setShowHistory] = useState(false)
  const typeInputRef = useRef(null)

  const {
    setBusinesses, setIsSearching, isSearching,
    setMapCenter, setMapZoom, setSelectedBusiness,
    placesServiceRef, setSearchQuery,
    setLighthouseData, setLoadingLighthouse,
    setFilterMode, setSortBy,
    suggestedType, setSuggestedType,
    isPaginating, setIsPaginating,
    isAnalyzing, setIsAnalyzing,
    addSearchEntry, addToast,
    searchHistory,
  } = useApp()

  // Ref to cancel previous autoAnalyze runs
  const analyzeAbortRef = useRef(0)
  const debounceRef = useRef(null)

  // Unique recent search types (deduplicated, max 8)
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

  // Cuando el usuario clickea un chip del panel vacío, se pre-llena el input
  useEffect(() => {
    if (suggestedType) {
      setBusinessType(suggestedType)
      setSuggestedType('')
    }
  }, [suggestedType])

  useEffect(() => {
    if (!window.google || !locationInputRef.current) return
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
  }, [window.google])

  const fetchNextPages = (pagination, pageCount = 1) => {
    if (!pagination?.hasNextPage || pageCount >= 2) {
      setIsPaginating(false)
      return
    }
    setTimeout(() => {
      pagination.nextPage((moreResults, moreStatus, morePagination) => {
        if (moreStatus === window.google.maps.places.PlacesServiceStatus.OK && moreResults?.length) {
          setBusinesses(prev => [...prev, ...moreResults])
          autoAnalyze(moreResults)
          fetchNextPages(morePagination, pageCount + 1)
        } else {
          setIsPaginating(false)
        }
      })
    }, 2000)
  }

  const handleSearch = async (typeOverride) => {
    const type = typeOverride || businessType
    if (!type.trim() || !location.trim()) {
      addToast('Ingresa tipo de negocio y ciudad', 'error')
      return
    }
    if (!placesServiceRef.current) {
      addToast('El mapa aun no cargo. Espera un momento.', 'error')
      return
    }
    analyzeAbortRef.current++ // Cancel any running autoAnalyze
    setIsSearching(true)
    setSelectedBusiness(null)
    setSearchQuery({ type, location })

    const searchOpts = locationCoordsRef.current
      ? {
          location: new window.google.maps.LatLng(locationCoordsRef.current.lat, locationCoordsRef.current.lng),
          radius,
          keyword: type,
        }
      : { query: `${type} en ${location}` }

    const searchMethod = locationCoordsRef.current ? 'nearbySearch' : 'textSearch'

    placesServiceRef.current[searchMethod](searchOpts, (results, status, pagination) => {
      setIsSearching(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
        setBusinesses(results)
        setLoadingLighthouse({})
        setFilterMode('all')
        setSortBy(null)
        const loc = results[0].geometry?.location
        if (loc) { setMapCenter({ lat: loc.lat(), lng: loc.lng() }); setMapZoom(14) }
        autoAnalyze(results)
        addToast(`${results.length} negocios encontrados`, 'success')

        // Save to search history
        addSearchEntry({
          date: new Date().toISOString(),
          type, location,
          totalResults: results.length,
        })

        // Fetch all remaining pages (up to 60 results total)
        if (pagination?.hasNextPage) {
          setIsPaginating(true)
          fetchNextPages(pagination)
        }
      } else {
        setBusinesses([])
        addToast('Sin resultados para esta busqueda', 'error')
      }
    })
  }

  const autoAnalyze = async (list) => {
    const runId = ++analyzeAbortRef.current
    const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const svc = placesServiceRef.current
    setIsAnalyzing(true)

    for (const biz of list) {
      // Stop if a newer search was triggered
      if (analyzeAbortRef.current !== runId) return

      await new Promise(resolve => {
        svc.getDetails(
          { placeId: biz.place_id, fields: ['website', 'formatted_phone_number', 'international_phone_number'] },
          async (place, st) => {
            // Stop if a newer search was triggered
            if (analyzeAbortRef.current !== runId) { resolve(); return }

            const website = st === window.google.maps.places.PlacesServiceStatus.OK
              ? (place.website || null) : null
            const phone = st === window.google.maps.places.PlacesServiceStatus.OK
              ? (place.international_phone_number || place.formatted_phone_number || null) : null

            // Update business immutably (never mutate biz directly)
            setBusinesses(prev => prev.map(b =>
              b.place_id === biz.place_id ? { ...b, website, phone } : b
            ))

            // Read cache fresh each iteration to avoid stale data
            const cached = JSON.parse(localStorage.getItem('ac_lighthouse') || '{}')

            // Use cached Lighthouse data if available
            if (cached[biz.place_id] && !cached[biz.place_id].error) {
              setLighthouseData(prev => ({ ...prev, [biz.place_id]: cached[biz.place_id] }))
              resolve()
              return
            }

            if (website) {
              setLoadingLighthouse(prev => ({ ...prev, [biz.place_id]: true }))
              try {
                // Run Lighthouse + SaaS detection in parallel
                const [data, saasTools] = await Promise.all([
                  getLighthouseData(website, apiKey),
                  detectSaasTools(website),
                ])
                if (analyzeAbortRef.current === runId) {
                  // Merge SaaS tools from both sources (PageSpeed audits + HTML scan)
                  const allSaas = [...(data.detectedSaas || [])]
                  const seen = new Set(allSaas.map(s => s.name))
                  for (const s of saasTools) {
                    if (!seen.has(s.name)) { allSaas.push(s); seen.add(s.name) }
                  }
                  setLighthouseData(prev => ({ ...prev, [biz.place_id]: { ...data, detectedSaas: allSaas } }))
                }
              } catch (err) {
                if (analyzeAbortRef.current === runId) {
                  setLighthouseData(prev => ({ ...prev, [biz.place_id]: { error: err.message } }))
                }
              } finally {
                if (analyzeAbortRef.current === runId) {
                  setLoadingLighthouse(prev => ({ ...prev, [biz.place_id]: false }))
                }
              }
            } else {
              setLighthouseData(prev => ({ ...prev, [biz.place_id]: { noWebsite: true, detectedSaas: [] } }))
            }
            resolve()
          }
        )
      })
      await new Promise(r => setTimeout(r, 300))
    }
    if (analyzeAbortRef.current === runId) setIsAnalyzing(false)
  }

  const handleSearchDebounced = (typeOverride) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => handleSearch(typeOverride), 300)
  }

  const handleClear = () => {
    analyzeAbortRef.current++
    setIsAnalyzing(false)
    setBusinessType(''); setLocation('')
    setBusinesses([]); setSelectedBusiness(null)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-5 py-3">
      <div className="max-w-5xl mx-auto">
        {/* Search inputs */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          {/* Business type */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={typeInputRef}
              type="text"
              placeholder="Tipo de negocio…"
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleSearchDebounced()}
              className="input-field pl-10 shadow-sm"
            />
            {/* Search history dropdown */}
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

          {/* Divider */}
          <div className="hidden sm:flex items-center text-slate-300 dark:text-gray-700 text-lg font-light select-none">·</div>

          {/* Location */}
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

          {/* Radius selector */}
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

          {/* Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleSearch()} disabled={isSearching || isAnalyzing} className="btn-primary flex-1 sm:flex-none justify-center shadow-indigo-100">
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

        {/* Quick searches */}
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
