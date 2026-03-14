import { Bookmark, X, MapPin, Star, ExternalLink, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SavedPanel() {
  const { savedBusinesses, toggleSave, showSaved, setShowSaved } = useApp()

  if (!showSaved) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaved(false)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Negocios guardados</h2>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              {savedBusinesses.length}
            </span>
          </div>
          <button onClick={() => setShowSaved(false)} className="btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[60vh] p-3 space-y-2">
          {savedBusinesses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-gray-500">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay negocios guardados</p>
              <p className="text-xs mt-1">Hacé click en el ícono 🔖 de cualquier negocio</p>
            </div>
          ) : (
            savedBusinesses.map(b => (
              <div key={b.place_id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-xl">
                {b.photos?.[0]?.photo_reference ? (
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photo_reference=${b.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                    alt={b.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-4 h-4 text-indigo-400" />
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
                  <button
                    onClick={() => toggleSave(b)}
                    title="Quitar de guardados"
                    className="btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
