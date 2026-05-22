import { useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { getLighthouseData, detectSaasTools } from '../utils/lighthouseApi'

const CONCURRENCY = 3
const INTER_BATCH_DELAY = 1000
const INTER_REQUEST_DELAY = 300

export function useBusinessSearch() {
  const {
    setBusinesses, setIsSearching, setMapCenter, setMapZoom,
    setSelectedBusiness, placesServiceRef, setSearchQuery,
    setLighthouseData, setLoadingLighthouse,
    setFilterMode, setSortBy,
    setIsPaginating, setIsAnalyzing,
    addSearchEntry, addToast,
    lighthouseData,
  } = useApp()

  const analyzeAbortRef = useRef(0)

  const autoAnalyze = useCallback(async (list) => {
    const runId = ++analyzeAbortRef.current
    const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const svc = placesServiceRef.current
    if (!svc) return

    setIsAnalyzing(true)

    // Process businesses in batches of CONCURRENCY
    for (let i = 0; i < list.length; i += CONCURRENCY) {
      if (analyzeAbortRef.current !== runId) return

      const batch = list.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(async (biz) => {
        if (analyzeAbortRef.current !== runId) return

        await new Promise(resolve => {
          svc.getDetails(
            { placeId: biz.place_id, fields: ['website', 'formatted_phone_number', 'international_phone_number'] },
            async (place, st) => {
              if (analyzeAbortRef.current !== runId) { resolve(); return }

              const website = st === window.google.maps.places.PlacesServiceStatus.OK
                ? (place.website || null) : null
              const phone = st === window.google.maps.places.PlacesServiceStatus.OK
                ? (place.international_phone_number || place.formatted_phone_number || null) : null

              setBusinesses(prev => prev.map(b =>
                b.place_id === biz.place_id ? { ...b, website, phone } : b
              ))

              const cached = lighthouseData[biz.place_id]
              if (cached && !cached.error && !cached.noWebsite) {
                resolve()
                return
              }

              if (website) {
                setLoadingLighthouse(prev => ({ ...prev, [biz.place_id]: true }))
                try {
                  const [data, webData] = await Promise.all([
                    getLighthouseData(website, apiKey),
                    detectSaasTools(website),
                  ])
                  if (analyzeAbortRef.current === runId) {
                    const allSaas = [...(data.detectedSaas || [])]
                    const seen = new Set(allSaas.map(s => s.name))
                    for (const s of webData.saas) {
                      if (!seen.has(s.name)) { allSaas.push(s); seen.add(s.name) }
                    }
                    setLighthouseData(prev => ({ ...prev, [biz.place_id]: { ...data, detectedSaas: allSaas } }))

                    const ci = webData.contactInfo
                    if (ci.email || ci.socials.length > 0) {
                      setBusinesses(prev => prev.map(b =>
                        b.place_id === biz.place_id
                          ? { ...b, email: ci.email || b.email, socials: ci.socials }
                          : b
                      ))
                    }
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
      }))

      // Delay between batches
      if (i + CONCURRENCY < list.length && analyzeAbortRef.current === runId) {
        await new Promise(r => setTimeout(r, INTER_BATCH_DELAY))
      }
    }

    if (analyzeAbortRef.current === runId) setIsAnalyzing(false)
  }, [placesServiceRef, lighthouseData, setBusinesses, setLighthouseData, setLoadingLighthouse, setIsAnalyzing])

  const fetchNextPages = useCallback((pagination, pageCount = 1) => {
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
  }, [autoAnalyze, setBusinesses, setIsPaginating])

  const search = useCallback(({ type, location, coords, radius, isSearching, isPaginating }) => {
    if (isSearching || isPaginating) return

    if (!type.trim() || !location.trim()) {
      addToast('Ingresa tipo de negocio y ciudad', 'error')
      return
    }
    if (!placesServiceRef.current) {
      addToast('El mapa aun no cargo. Espera un momento.', 'error')
      return
    }

    analyzeAbortRef.current++
    setIsSearching(true)
    setSelectedBusiness(null)
    setSearchQuery({ type, location })

    const searchOpts = coords
      ? {
          location: new window.google.maps.LatLng(coords.lat, coords.lng),
          radius,
          keyword: type,
        }
      : { query: `${type} en ${location}` }

    const searchMethod = coords ? 'nearbySearch' : 'textSearch'

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
        addSearchEntry({ date: new Date().toISOString(), type, location, totalResults: results.length })

        if (pagination?.hasNextPage) {
          setIsPaginating(true)
          fetchNextPages(pagination)
        }
      } else {
        setBusinesses([])
        addToast('Sin resultados para esta busqueda', 'error')
      }
    })
  }, [placesServiceRef, setIsSearching, setSelectedBusiness, setSearchQuery,
      setBusinesses, setLoadingLighthouse, setFilterMode, setSortBy,
      setMapCenter, setMapZoom, autoAnalyze, addToast, addSearchEntry,
      fetchNextPages, setIsPaginating])

  const cancelAnalysis = useCallback(() => {
    analyzeAbortRef.current++
    setIsAnalyzing(false)
  }, [setIsAnalyzing])

  return {
    search,
    autoAnalyze,
    cancelAnalysis,
    fetchNextPages,
  }
}