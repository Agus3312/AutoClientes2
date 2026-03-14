import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2, X, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getLighthouseData } from '../utils/lighthouseApi'

const QUICK_SEARCHES = [
  { label: 'Cafeterías', icon: '☕' },
  { label: 'Dentistas', icon: '🦷' },
  { label: 'Gimnasios', icon: '💪' },
  { label: 'Restaurantes', icon: '🍽️' },
  { label: 'Peluquerías', icon: '✂️' },
]

export default function SearchBar() {
  const [businessType, setBusinessType] = useState('')
  const [location, setLocation]         = useState('')
  const locationInputRef = useRef(null)
  const autocompleteRef  = useRef(null)

  const {
    setBusinesses, setIsSearching, isSearching,
    setMapCenter, setMapZoom, setSelectedBusiness,
    placesServiceRef, setSearchQuery,
    setLighthouseData, setLoadingLighthouse,
    setFilterMode, setSortBy,
    suggestedType, setSuggestedType,
  } = useApp()

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
      if (place.geometry) setLocation(place.formatted_address || place.name)
    })
  }, [window.google])

  const handleSearch = async (typeOverride) => {
    const type = typeOverride || businessType
    if (!type.trim() || !location.trim()) {
      alert('Ingresa tipo de negocio y ciudad')
      return
    }
    if (!placesServiceRef.current) {
      alert('El mapa aún no cargó. Espera un momento.')
      return
    }
    setIsSearching(true)
    setSelectedBusiness(null)
    setSearchQuery({ type, location })

    placesServiceRef.current.textSearch({ query: `${type} en ${location}` }, (results, status) => {
      setIsSearching(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
        const top15 = results.slice(0, 15)
        setBusinesses(top15)
        setLighthouseData({})
        setLoadingLighthouse({})
        setFilterMode('all')
        setSortBy(null)
        const loc = top15[0].geometry?.location
        if (loc) { setMapCenter({ lat: loc.lat(), lng: loc.lng() }); setMapZoom(14) }
        autoAnalyze(top15)
      } else {
        setBusinesses([])
        alert('Sin resultados. Verifica que la Places API esté habilitada en Google Cloud.')
      }
    })
  }

  const autoAnalyze = async (list) => {
    const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    for (const biz of list) {
      await new Promise(resolve => {
        const svc = new window.google.maps.places.PlacesService(document.createElement('div'))
        svc.getDetails(
          { placeId: biz.place_id, fields: ['website', 'formatted_phone_number', 'international_phone_number'] },
          async (place, st) => {
            if (st === window.google.maps.places.PlacesServiceStatus.OK) {
              biz.website = place.website || null
              biz.phone = place.international_phone_number || place.formatted_phone_number || null
              setBusinesses(prev => prev.map(b => b.place_id === biz.place_id ? { ...biz } : b))
            }
            if (biz.website) {
              setLoadingLighthouse(prev => ({ ...prev, [biz.place_id]: true }))
              try {
                const data = await getLighthouseData(biz.website, apiKey)
                setLighthouseData(prev => ({ ...prev, [biz.place_id]: data }))
              } catch (err) {
                setLighthouseData(prev => ({ ...prev, [biz.place_id]: { error: err.message } }))
              } finally {
                setLoadingLighthouse(prev => ({ ...prev, [biz.place_id]: false }))
              }
            } else {
              setLighthouseData(prev => ({ ...prev, [biz.place_id]: { noWebsite: true } }))
            }
            resolve()
          }
        )
      })
      await new Promise(r => setTimeout(r, 300)) // evitar rate limit
    }
  }

  const handleClear = () => {
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
              type="text"
              placeholder="Tipo de negocio…"
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10 shadow-sm"
            />
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
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10 shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => handleSearch()} disabled={isSearching} className="btn-primary flex-1 sm:flex-none justify-center shadow-indigo-100">
              {isSearching
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Buscando…</span></>
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
