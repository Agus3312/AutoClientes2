import { useApp } from '../context/AppContext'
import BusinessCard from './BusinessCard'
import { TrendingUp, Search, Globe, WifiOff, ArrowUp, ArrowDown, Target, Download, Loader2 } from 'lucide-react'
import { exportToCSV } from '../utils/csvExport'

// Rubros ordenados por probabilidad de no tener web (mayor → menor)
const HOT_TARGETS = [
  { label: 'Plomeros',        icon: '🔧', reason: '~80% sin web' },
  { label: 'Electricistas',   icon: '⚡', reason: '~78% sin web' },
  { label: 'Carpinteros',     icon: '🪚', reason: '~75% sin web' },
  { label: 'Cerrajeros',      icon: '🔑', reason: '~74% sin web' },
  { label: 'Pintores',        icon: '🎨', reason: '~72% sin web' },
  { label: 'Veterinarias',    icon: '🐾', reason: '~60% sin web' },
  { label: 'Kinesiólogos',    icon: '💆', reason: '~65% sin web' },
  { label: 'Contadores',      icon: '📊', reason: '~55% sin web' },
  { label: 'Dentistas',       icon: '🦷', reason: '~45% sin web' },
  { label: 'Peluquerías',     icon: '✂️', reason: '~50% sin web' },
  { label: 'Ferreterías',     icon: '🔩', reason: '~70% sin web' },
  { label: 'Nutricionistas',  icon: '🥗', reason: '~62% sin web' },
]

const SORT_LIGHTHOUSE = [
  { value: 'performance',   label: 'Perf' },
  { value: 'seo',           label: 'SEO' },
  { value: 'accessibility', label: 'Accesib.' },
  { value: 'bestPractices', label: 'Prácticas' },
]

const SORT_GENERAL = [
  { value: 'rating',  label: 'Rating' },
  { value: 'reviews', label: 'Reseñas' },
]

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 p-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-7 h-7 bg-slate-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 bg-slate-100 dark:bg-gray-800 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full w-1/2" />
          <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full w-full" />
        </div>
      </div>
    </div>
  )
}

export default function BusinessList() {
  const {
    businesses, isSearching, searchQuery,
    lighthouseData, loadingLighthouse,
    filterMode, setFilterMode,
    sortBy, setSortBy, sortOrder, setSortOrder,
    setSuggestedType,
    isPaginating, contactStatuses, addToast,
  } = useApp()

  // Apply filter
  const filtered = businesses.filter(b => {
    const lh      = lighthouseData[b.place_id]
    if (filterMode === 'no-website')  return lh?.noWebsite === true
    if (filterMode === 'has-website') return b.website && !lh?.noWebsite
    return true
  })

  // Apply sort
  const sorted = sortBy
    ? [...filtered].sort((a, b) => {
        let valA, valB
        if (sortBy === 'rating') {
          valA = a.rating || 0
          valB = b.rating || 0
        } else if (sortBy === 'reviews') {
          valA = a.user_ratings_total || 0
          valB = b.user_ratings_total || 0
        } else {
          const lhA = lighthouseData[a.place_id]
          const lhB = lighthouseData[b.place_id]
          valA = lhA && !lhA.error && !lhA.noWebsite ? (lhA[sortBy] ?? -1) : -1
          valB = lhB && !lhB.error && !lhB.noWebsite ? (lhB[sortBy] ?? -1) : -1
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })
    : filtered

  const toggleSort = (key) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortOrder('asc') }
  }

  // Business intelligence stats
  const noWebCount = businesses.filter(b => lighthouseData[b.place_id]?.noWebsite).length
  const withWebCount = businesses.filter(b => b.website).length
  const withPhoneCount = businesses.filter(b => b.phone).length
  const analyzedCount = Object.keys(lighthouseData).filter(id => businesses.some(b => b.place_id === id)).length
  const noWebPct = analyzedCount > 0 ? Math.round((noWebCount / analyzedCount) * 100) : 0

  const handleExportCSV = () => {
    exportToCSV(businesses, lighthouseData, contactStatuses)
    addToast('CSV exportado', 'success')
  }

  if (isSearching) {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!businesses.length) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-gray-200">Rubros con mayor demanda de web</p>
            <p className="text-[11px] text-slate-400">Clickea uno para pre-llenar la busqueda</p>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-col gap-2">
          {HOT_TARGETS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setSuggestedType(t.label)}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <span className="text-base">{t.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                {t.label}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                {t.reason}
              </span>
              <span className="text-[11px] font-bold text-slate-300 dark:text-gray-600 group-hover:text-indigo-400">
                #{i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-gray-950/90 backdrop-blur-sm px-3 pt-2 pb-0 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">
              {sorted.length} / {businesses.length} negocios
            </span>
            {isPaginating && (
              <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> cargando mas...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {searchQuery.type && (
              <span className="text-[11px] text-slate-400 italic truncate max-w-36">
                "{searchQuery.type}" · {searchQuery.location}
              </span>
            )}
            <button
              onClick={handleExportCSV}
              className="btn-ghost text-xs"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Business Intelligence Bar */}
        {analyzedCount > 0 && (
          <div className="mb-2 p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {noWebCount} de {analyzedCount} sin web ({noWebPct}%)
              </span>
              <span className="text-slate-500 dark:text-gray-400">
                {withWebCount} con web · {withPhoneCount} con tel
              </span>
            </div>
            <div className="mt-1.5 h-2 bg-white dark:bg-gray-800 rounded-full overflow-hidden flex">
              <div style={{width: `${noWebPct}%`}} className="bg-red-400 transition-all duration-500" />
              <div style={{width: `${100-noWebPct}%`}} className="bg-green-400 transition-all duration-500" />
            </div>
          </div>
        )}

        {/* Filter: website */}
        <div className="flex gap-1.5 flex-wrap pb-2">
          {[
            { key: 'all',         label: 'Todos',       icon: null },
            { key: 'no-website',  label: 'Sin web',     icon: <WifiOff className="w-3 h-3" /> },
            { key: 'has-website', label: 'Con web',     icon: <Globe className="w-3 h-3" /> },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterMode(f.key)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                filterMode === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              {f.icon}{f.label}
            </button>
          ))}

          {/* General sort buttons (always visible) */}
          {SORT_GENERAL.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleSort(opt.value)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                sortBy === opt.value
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:border-amber-300'
              }`}
            >
              {opt.label}
              {sortBy === opt.value
                ? sortOrder === 'asc'
                  ? <ArrowUp className="w-3 h-3" />
                  : <ArrowDown className="w-3 h-3" />
                : null}
            </button>
          ))}

          {/* Lighthouse sort buttons (only when has-website) */}
          {filterMode === 'has-website' && SORT_LIGHTHOUSE.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleSort(opt.value)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                sortBy === opt.value
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:border-amber-300'
              }`}
            >
              {opt.label}
              {sortBy === opt.value
                ? sortOrder === 'asc'
                  ? <ArrowUp className="w-3 h-3" />
                  : <ArrowDown className="w-3 h-3" />
                : null}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {sorted.map((b, i) => (
          <div key={b.place_id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
            <BusinessCard business={b} index={businesses.indexOf(b)} />
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-8">Sin resultados para este filtro</p>
        )}
      </div>
    </div>
  )
}
