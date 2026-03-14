import { Check, X, MapPin, Star, ExternalLink, Trash2, Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'

const SECTIONS = [
  { status: 'interested', label: 'Interesados', color: 'blue', bgCard: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40' },
  { status: 'responded',  label: 'Respondieron', color: 'green', bgCard: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/40' },
  { status: 'contacted',  label: 'Contactados', color: 'slate', bgCard: 'bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700' },
]

function StatusIcon({ status }) {
  if (status === 'contacted') return <Check className="w-3.5 h-3.5 text-slate-400" />
  if (status === 'responded') return (
    <span className="flex items-center -space-x-1.5 text-slate-400">
      <Check className="w-3.5 h-3.5" /><Check className="w-3.5 h-3.5" />
    </span>
  )
  return (
    <span className="flex items-center -space-x-1.5 text-blue-500">
      <Check className="w-3.5 h-3.5" /><Check className="w-3.5 h-3.5" />
    </span>
  )
}

export default function InteresadosPanel() {
  const { trackedBusinesses, contactStatuses, showInteresados, setShowInteresados, clearContactStatus } = useApp()

  if (!showInteresados) return null

  const handleRemove = (business) => {
    clearContactStatus(business.place_id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInteresados(false)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Seguimiento de contactos</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
              {trackedBusinesses.length}
            </span>
          </div>
          <button onClick={() => setShowInteresados(false)} className="btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[65vh] p-3 space-y-4">
          {trackedBusinesses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-gray-500">
              <Check className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay negocios en seguimiento</p>
              <p className="text-xs mt-1">Usa las tildes en cada negocio para marcar su estado</p>
            </div>
          ) : (
            SECTIONS.map(section => {
              const items = trackedBusinesses.filter(b => contactStatuses[b.place_id] === section.status)
              if (items.length === 0) return null
              return (
                <div key={section.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={section.status} />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.label}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      section.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : section.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                    }`}>
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map(b => (
                      <div key={b.place_id} className={`flex items-start gap-3 p-3 rounded-xl border ${section.bgCard}`}>
                        {b.photos?.[0]?.photo_reference ? (
                          <img
                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photo_reference=${b.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                            alt={b.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <StatusIcon status={section.status} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{b.name}</p>
                          {b.rating && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-slate-500">{b.rating} ({b.user_ratings_total?.toLocaleString() || 0})</span>
                            </div>
                          )}
                          {b.vicinity && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-300" />
                              <span className="text-[11px] text-slate-400 line-clamp-1">{b.vicinity}</span>
                            </div>
                          )}
                          {b.phone && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{b.phone}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <a
                            href={`https://www.google.com/maps/place/?q=place_id:${b.place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost"
                            title="Ver en Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {b.phone && (
                            <a
                              href={`https://wa.me/${(b.phone || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleRemove(b)}
                            title="Quitar del seguimiento"
                            className="btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
