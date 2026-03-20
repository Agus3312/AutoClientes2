import { useCallback, useRef } from 'react'
import { GoogleMap, Marker, InfoWindow, Circle } from '@react-google-maps/api'
import { useApp } from '../context/AppContext'

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const LIGHT_MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d6e8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#efefef' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ececec' }] },
]

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
}

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9E9E9E' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
]

const CIRCLE_OPTIONS = {
  fillColor: '#4f46e5',
  fillOpacity: 0.08,
  strokeColor: '#4f46e5',
  strokeOpacity: 0.4,
  strokeWeight: 2,
  clickable: false,
}

export default function MapView() {
  const {
    businesses, selectedBusiness, setSelectedBusiness,
    mapCenter, setMapCenter, mapZoom, setMapZoom,
    mapRef, placesServiceRef,
    mapClickLocation, setMapClickLocation,
    searchRadius, addToast,
  } = useApp()

  const geocoderRef = useRef(null)

  const onLoad = useCallback((map) => {
    mapRef.current = map
    const div = document.createElement('div')
    placesServiceRef.current = new window.google.maps.places.PlacesService(div)
    geocoderRef.current = new window.google.maps.Geocoder()
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    setMapClickLocation({ lat, lng, label: 'Cargando...' })
    setMapCenter({ lat, lng })

    // Reverse geocode to get a readable name
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          // Find best label: locality or sublocality or first result
          const locality = results.find(r =>
            r.types.includes('locality') || r.types.includes('sublocality')
          )
          const label = locality?.formatted_address || results[0].formatted_address
          setMapClickLocation({ lat, lng, label })
        } else {
          setMapClickLocation({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
        }
      })
    }

    addToast('Ubicacion seleccionada en el mapa', 'success')
  }, [setMapClickLocation, setMapCenter, addToast])

  const handleMarkerClick = (business) => {
    setSelectedBusiness(business)
    if (business.geometry?.location) {
      const loc = business.geometry.location
      mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() })
    }
  }

  const isDark = document.documentElement.classList.contains('dark')

  const COLORS = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

  const getMarkerIcon = (business, isSelected, idx) => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: isSelected ? '#f97316' : COLORS[idx % COLORS.length],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
    scale: isSelected ? 13 : 10,
  })

  return (
    <div className="h-60 md:h-72 flex-shrink-0 relative">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{ ...MAP_OPTIONS, styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES }}
      >
        {/* Search radius circle */}
        {mapClickLocation && (
          <>
            <Circle
              center={{ lat: mapClickLocation.lat, lng: mapClickLocation.lng }}
              radius={searchRadius}
              options={CIRCLE_OPTIONS}
            />
            <Marker
              position={{ lat: mapClickLocation.lat, lng: mapClickLocation.lng }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#4f46e5',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 8,
              }}
              title="Punto de busqueda"
            />
          </>
        )}

        {businesses.map((business, idx) => (
          business.geometry?.location && (
            <Marker
              key={business.place_id}
              position={{
                lat: business.geometry.location.lat(),
                lng: business.geometry.location.lng()
              }}
              onClick={() => handleMarkerClick(business)}
              icon={getMarkerIcon(business, selectedBusiness?.place_id === business.place_id, idx)}
              label={{
                text: String(idx + 1),
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            />
          )
        ))}

        {selectedBusiness && selectedBusiness.geometry?.location && (
          <InfoWindow
            position={{
              lat: selectedBusiness.geometry.location.lat(),
              lng: selectedBusiness.geometry.location.lng()
            }}
            onCloseClick={() => setSelectedBusiness(null)}
          >
            <div className="p-1 max-w-48">
              <p className="font-semibold text-gray-900 text-sm">{selectedBusiness.name}</p>
              {selectedBusiness.rating && (
                <p className="text-xs text-gray-500 mt-1">⭐ {selectedBusiness.rating} ({selectedBusiness.user_ratings_total || 0})</p>
              )}
              <p className="text-xs text-gray-500">{selectedBusiness.vicinity}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Click hint overlay */}
      {!mapClickLocation && businesses.length === 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full pointer-events-none">
          Haz click en el mapa para elegir donde buscar
        </div>
      )}
    </div>
  )
}
