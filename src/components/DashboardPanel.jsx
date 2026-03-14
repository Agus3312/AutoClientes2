import { X, BarChart3, TrendingUp, Users, Phone, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-slate-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[11px] text-slate-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  )
}

function FunnelStep({ label, count, total, color, isLast }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700 dark:text-gray-300">{label}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{count}</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>
      {!isLast && <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>}
    </div>
  )
}

export default function DashboardPanel() {
  const { showDashboard, setShowDashboard, trackedCounts, searchHistory } = useApp()

  if (!showDashboard) return null

  const totalSearched = searchHistory.reduce((sum, s) => sum + (s.totalResults || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDashboard(false)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Dashboard</h2>
          </div>
          <button onClick={() => setShowDashboard(false)} className="btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[65vh] p-4 space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Globe} label="Busquedas realizadas" value={searchHistory.length} color="text-indigo-500" />
            <StatCard icon={TrendingUp} label="Negocios encontrados" value={totalSearched} color="text-green-500" />
            <StatCard icon={Users} label="Contactados" value={trackedCounts.contacted} color="text-slate-500" />
            <StatCard icon={Phone} label="Interesados" value={trackedCounts.interested} color="text-blue-500" />
          </div>

          {/* Conversion Funnel */}
          {trackedCounts.total > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Embudo de conversion</h3>
              <div className="space-y-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                <FunnelStep label="Contactados" count={trackedCounts.contacted + trackedCounts.responded + trackedCounts.interested} total={totalSearched || 1} color="bg-slate-400" />
                <FunnelStep label="Respondieron" count={trackedCounts.responded + trackedCounts.interested} total={trackedCounts.contacted + trackedCounts.responded + trackedCounts.interested || 1} color="bg-green-400" />
                <FunnelStep label="Interesados" count={trackedCounts.interested} total={trackedCounts.responded + trackedCounts.interested || 1} color="bg-blue-500" isLast />
              </div>
            </div>
          )}

          {/* Search History */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Historial de busquedas</h3>
            {searchHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Aun no hiciste busquedas</p>
            ) : (
              <div className="space-y-1.5">
                {searchHistory.slice(0, 10).map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-100 dark:border-gray-700 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-slate-700 dark:text-gray-300 truncate">{s.type}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400 truncate">{s.location}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{s.totalResults}</span>
                      <span className="text-[10px] text-slate-400">{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
