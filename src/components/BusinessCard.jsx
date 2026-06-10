import { useState, memo } from 'react'
import { Star, MapPin, Globe, GitCompare, FileText, Loader2, Check, ExternalLink, Bookmark, Phone, Zap } from 'lucide-react'
import { SocialChips } from './SocialLinks'
import { useApp } from '../context/AppContext'
import { exportToPDF } from '../utils/pdfExport'
import { generateWhatsAppMessage } from '../utils/promptTemplates'
import { buildWhatsAppUrl } from '../utils/phoneUtils'

function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= full ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-white">{rating}</span>
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

const COLORS = ['#6340f6','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

function BusinessCard({ business, index }) {
  const { selectedBusiness, setSelectedBusiness, setBusinesses, addToCompare, isInCompare, lighthouseData, loadingLighthouse, toggleSave, isSaved, cycleContactStatus, getContactStatus, searchQuery, placesServiceRef } = useApp()
  const [isExporting, setIsExporting]       = useState(false)
  const [websiteLoading, setWebsiteLoading] = useState(false)
  const [photoError, setPhotoError]         = useState(false)

  const isSelected  = selectedBusiness?.place_id === business.place_id
  const inCompare   = isInCompare(business.place_id)
  const scores      = lighthouseData[business.place_id]
  const isAnalyzing = loadingLighthouse[business.place_id]

  const mapsUrl  = `https://www.google.com/maps/place/?q=place_id:${business.place_id}`
  const photoRef = business.photos?.[0]?.photo_reference
  const photoUrl = photoRef
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=120&photo_reference=${photoRef}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    : null

  const fetchWebsite = async e => {
    e.stopPropagation()
    if (business.website || !placesServiceRef.current) return
    setWebsiteLoading(true)
    placesServiceRef.current.getDetails(
      { placeId: business.place_id, fields: ['website', 'formatted_phone_number', 'international_phone_number'] },
      (place, status) => {
        setWebsiteLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const website = place.website || null
          const phone = place.international_phone_number || place.formatted_phone_number || null
          setBusinesses(prev => prev.map(b =>
            b.place_id === business.place_id ? { ...b, website, phone } : b
          ))
          setSelectedBusiness({ ...business, website, phone })
        }
      }
    )
  }

  const handleWhatsApp = e => {
    e.stopPropagation()
    const msg = generateWhatsAppMessage(business, searchQuery.location || '', searchQuery.type || '')
    const url = buildWhatsAppUrl(business.phone, msg)
    if (!url) return
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
        relative cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800/60 border-l-4 transition-all duration-200 overflow-hidden
        ${isSelected
          ? 'bg-brand-500/5 dark:bg-brand-500/10 border-l-brand-500 shadow-card-hover'
          : 'bg-white dark:bg-surface-900 hover:shadow-card-hover'}
      `}
      style={isSelected ? {} : { borderLeftColor: COLORS[index % COLORS.length] }}
    >
      <div className="pl-4 pr-3 py-3">
        {/* Top section: Photo + Info */}
        <div className="flex items-start gap-3">
          {/* Photo or number badge */}
          {photoUrl && !photoError ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-surface-800">
              <img src={photoUrl} alt={business.name} className="w-full h-full object-cover" onError={() => setPhotoError(true)} />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-white text-[9px] font-mono rounded-tl-sm"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}B0` }}
              >{index + 1}</span>
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono flex-shrink-0"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}12`, color: COLORS[index % COLORS.length] }}
            >{index + 1}</div>
          )}

          {/* Info content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
              {business.name}
            </h3>

            {business.rating && (
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={business.rating} />
                <span className="text-[11px] text-slate-400 dark:text-slate-500">({business.user_ratings_total?.toLocaleString() || 0})</span>
              </div>
            )}

            {business.vicinity && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">{business.vicinity}</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-[11px] text-brand-500 hover:text-brand-700 flex items-center gap-0.5 ml-1 flex-shrink-0"
                >
                  <MapPin className="w-3 h-3" />
                  Ver mapa
                </a>
              </div>
            )}

            {/* Score pills */}
            {isAnalyzing && (
              <div className="flex items-center gap-1.5 mt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Analizando web…</span>
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
            {!isAnalyzing && scores?.detectedSaas?.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {scores.detectedSaas.map(s => (
                  <span key={s.name} className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md">
                    <Zap className="w-2.5 h-2.5" />{s.name}
                  </span>
                ))}
              </div>
            )}
            {!isAnalyzing && scores && !scores.error && !scores.noWebsite && scores.detectedSaas?.length === 0 && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                <Zap className="w-2.5 h-2.5" /> Sin SaaS detectado — oportunidad
              </span>
            )}
            {!isAnalyzing && scores?.noWebsite && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                <Zap className="w-2.5 h-2.5" /> Sin web — alta oportunidad SaaS
              </span>
            )}
            {!isAnalyzing && scores?.error && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md cursor-help" title={scores.error}>
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
                className="mt-1.5 flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-700 dark:text-brand-400 w-fit"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-40">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </a>
            )}

            {/* Social chips */}
            <SocialChips email={business.email} socials={business.socials} />
          </div>
        </div>

        {/* Bottom action row */}
        <div
          className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-0.5 flex-wrap"
          onClick={e => e.stopPropagation()}
        >
          {/* WhatsApp CTA — subtle outline button */}
          {business.phone && (
            <button
              onClick={handleWhatsApp}
              disabled={isAnalyzing}
              title={isAnalyzing ? 'Esperando análisis…' : 'Contactar por WhatsApp'}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all active:scale-[0.97] ${
                isAnalyzing
                  ? 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-wait'
                  : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white'
              }`}
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAnalyzing ? 'Analizando…' : 'WhatsApp'}</span>
            </button>
          )}

          {/* Secondary actions — subtle icon buttons */}
          <button
            onClick={() => addToCompare(business)}
            title={inCompare ? 'Quitar de comparar' : 'Comparar'}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors ${inCompare ? 'text-brand-500 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {inCompare ? <Check className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={e => { e.stopPropagation(); toggleSave(business) }}
            title={isSaved(business.place_id) ? 'Quitar de guardados' : 'Guardar negocio'}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors ${isSaved(business.place_id) ? 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved(business.place_id) ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={e => { e.stopPropagation(); cycleContactStatus(business) }}
            title={STATUS_LABELS[getContactStatus(business.place_id)]}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors ${
              getContactStatus(business.place_id) === 'interested'
                ? 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/10'
                : getContactStatus(business.place_id)
                  ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-surface-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <ContactTicks status={getContactStatus(business.place_id)} />
          </button>

          {!business.website && (
            <button
              onClick={fetchWebsite}
              disabled={websiteLoading}
              title="Obtener web"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40"
            >
              {websiteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            </button>
          )}

          {scores && !scores.error && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              title="Exportar PDF"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-40"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(BusinessCard)
