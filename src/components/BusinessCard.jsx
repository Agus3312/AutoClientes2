import { useState } from 'react'
import { Star, MapPin, Globe, GitCompare, ScrollText, FileText, Loader2, Check, ExternalLink, Bookmark, Phone } from 'lucide-react'
import LighthousePanel from './LighthousePanel'
import { useApp } from '../context/AppContext'
import { exportToPDF } from '../utils/pdfExport'
import { generateWhatsAppMessage } from '../utils/promptTemplates'

function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= full ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-gray-700 fill-slate-200 dark:fill-gray-700'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-gray-200">{rating}</span>
    </div>
  )
}

function ScorePill({ score, label }) {
  const cls = score >= 90 ? 'badge-green' : score >= 50 ? 'badge-yellow' : 'badge-red'
  return <span className={cls}>{label} {score}</span>
}

function ContactTicks({ status }) {
  if (!status) return <Check className="w-3.5 h-3.5" />
  if (status === 'contacted') return <Check className="w-3.5 h-3.5 text-slate-400" />
  // responded = 2 gray ticks, interested = 2 blue ticks
  const color = status === 'interested' ? 'text-blue-500' : 'text-slate-400'
  return (
    <span className={`flex items-center -space-x-1.5 ${color}`}>
      <Check className="w-3.5 h-3.5" />
      <Check className="w-3.5 h-3.5" />
    </span>
  )
}

const STATUS_LABELS = {
  null: 'Marcar como contactado',
  contacted: 'Marcar como respondio',
  responded: 'Marcar como interesado',
  interested: 'Quitar estado',
}

export default function BusinessCard({ business, index }) {
  const { selectedBusiness, setSelectedBusiness, addToCompare, isInCompare, lighthouseData, loadingLighthouse, toggleSave, isSaved, cycleContactStatus, getContactStatus, searchQuery } = useApp()
  const [isExporting, setIsExporting]       = useState(false)
  const [websiteLoading, setWebsiteLoading] = useState(false)
  const [photoError, setPhotoError]         = useState(false)

  const isSelected     = selectedBusiness?.place_id === business.place_id
  const inCompare      = isInCompare(business.place_id)
  const scores         = lighthouseData[business.place_id]
  const isAnalyzing    = loadingLighthouse[business.place_id]

  const COLORS  = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
  const photoRef = business.photos?.[0]?.photo_reference
  const photoUrl = photoRef
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photo_reference=${photoRef}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    : null

  const fetchWebsite = async e => {
    e.stopPropagation()
    if (business.website) return
    setWebsiteLoading(true)
    const svc = new window.google.maps.places.PlacesService(document.createElement('div'))
    svc.getDetails({ placeId: business.place_id, fields: ['website','formatted_phone_number'] }, (place, status) => {
      setWebsiteLoading(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        business.website = place.website || null
        business.phone   = place.formatted_phone_number || null
        setSelectedBusiness({ ...business })
      }
    })
  }

  const openPrompts = e => {
    e.stopPropagation()
    setSelectedBusiness(business)
  }

  const handleWhatsApp = e => {
    e.stopPropagation()
    const rawPhone = business.phone || ''
    const phone = rawPhone.startsWith('+')
      ? rawPhone.replace(/\D/g, '')
      : rawPhone.replace(/\D/g, '').replace(/^0+/, '')
    if (!phone) return
    const msg = generateWhatsAppMessage(business, searchQuery.location || '', searchQuery.type || '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleExport = async e => {
    e.stopPropagation()
    setIsExporting(true)
    try { await exportToPDF(business, lighthouseData) }
    finally { setIsExporting(false) }
  }

  return (
    <div
      onClick={() => setSelectedBusiness(isSelected ? null : business)}
      className={`
        relative cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden
        ${isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-md shadow-indigo-100/50'
          : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-gray-800 hover:shadow-md hover:border-slate-200 dark:hover:border-gray-700'}
      `}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: isSelected ? '#4f46e5' : COLORS[index % COLORS.length] }}
      />

      <div className="pl-4 pr-3 py-3 flex items-start gap-3">
        {/* Photo or number badge */}
        {photoUrl && !photoError ? (
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 mt-0.5 bg-slate-100 dark:bg-gray-800">
            <img src={photoUrl} alt={business.name} className="w-full h-full object-cover" onError={() => setPhotoError(true)} />
            <span
              className="absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center text-white text-[9px] font-bold rounded-tl-md"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            >{index + 1}</span>
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          >{index + 1}</div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
              {business.name}
            </h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="Ver en Google Maps"
              className="flex-shrink-0 text-slate-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400 transition-colors mt-0.5"
            >
              <MapPin className="w-3.5 h-3.5" />
            </a>
          </div>

          {business.rating && (
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={business.rating} />
              <span className="text-[11px] text-slate-400">({business.user_ratings_total?.toLocaleString() || 0})</span>
            </div>
          )}

          {business.vicinity && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-slate-300 dark:text-gray-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-400 dark:text-gray-500 line-clamp-1">{business.vicinity}</span>
            </div>
          )}

          {/* Score pills / estados lighthouse */}
          {isAnalyzing && (
            <div className="flex items-center gap-1.5 mt-2">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              <span className="text-[11px] text-slate-400">Analizando web…</span>
            </div>
          )}
          {!isAnalyzing && scores && !scores.error && !scores.noWebsite && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <ScorePill score={scores.performance}   label="Perf" />
              <ScorePill score={scores.seo}           label="SEO"  />
              <ScorePill score={scores.accessibility} label="A11y" />
              <ScorePill score={scores.bestPractices} label="BP"   />
            </div>
          )}
          {!isAnalyzing && scores?.noWebsite && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              Sin web
            </span>
          )}
          {!isAnalyzing && scores?.error && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full cursor-help" title={scores.error}>
              Error al analizar
            </span>
          )}

          {/* Website link */}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="mt-1.5 flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 w-fit"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-40">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </a>
          )}
        </div>

        {/* Action column */}
        <div className="flex flex-col gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => addToCompare(business)}
            title={inCompare ? 'Quitar' : 'Comparar'}
            className={`btn-ghost text-xs ${inCompare ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
          >
            {inCompare ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
          </button>

          <button onClick={openPrompts} title="Generar prompts" className="btn-ghost">
            <ScrollText className="w-3.5 h-3.5" />
          </button>

          {/* Guardar */}
          <button
            onClick={e => { e.stopPropagation(); toggleSave(business) }}
            title={isSaved(business.place_id) ? 'Quitar de guardados' : 'Guardar negocio'}
            className={`btn-ghost ${isSaved(business.place_id) ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved(business.place_id) ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Contact status ticks */}
          <button
            onClick={e => { e.stopPropagation(); cycleContactStatus(business) }}
            title={STATUS_LABELS[getContactStatus(business.place_id)]}
            className={`btn-ghost ${
              getContactStatus(business.place_id) === 'interested'
                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : getContactStatus(business.place_id)
                  ? 'text-slate-400 bg-slate-50 dark:bg-gray-800'
                  : ''
            }`}
          >
            <ContactTicks status={getContactStatus(business.place_id)} />
          </button>

          {/* WhatsApp */}
          {business.phone && (
            <button
              onClick={handleWhatsApp}
              title="Contactar por WhatsApp"
              className="btn-ghost text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          )}

          {!business.website && (
            <button onClick={fetchWebsite} disabled={websiteLoading} title="Obtener web" className="btn-ghost">
              {websiteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            </button>
          )}

          {scores && !scores.error && (
            <button onClick={handleExport} disabled={isExporting} title="Exportar PDF" className="btn-ghost">
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Lighthouse expandable */}
      {isSelected && (
        <div className="border-t border-indigo-100 dark:border-indigo-900/50 mx-3 pb-3">
          <LighthousePanel business={business} />
        </div>
      )}
    </div>
  )
}
