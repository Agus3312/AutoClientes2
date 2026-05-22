import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import { Moon, Sun, GitCompare, Zap, Bookmark, Check, BarChart3, Settings } from 'lucide-react'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const { compareList, setShowCompare, savedBusinesses, setShowSaved, trackedCounts, setShowInteresados, setShowDashboard, setShowSettings, searchHistory } = useApp()

  return (
    <nav className="bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-5 h-14 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm shadow-brand-500/25">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight">
          Auto<span className="text-brand-600 dark:text-brand-400">Clientes</span>
        </span>
        <span className="hidden sm:inline text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">
          Pro
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowDashboard(true)}
          className={`btn-ghost relative ${searchHistory.length > 0 ? 'text-brand-500' : ''}`}
          title="Dashboard"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Comparar</span>
            <span className="bg-brand-600 dark:bg-brand-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {compareList.length}
            </span>
          </button>
        )}
        {trackedCounts.total > 0 && (
          <button
            onClick={() => setShowInteresados(true)}
            className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors"
            title="Ver seguimiento de contactos"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seguimiento</span>
            <span className="bg-blue-600 dark:bg-blue-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {trackedCounts.total}
            </span>
          </button>
        )}
        <button
          onClick={() => setShowSaved(true)}
          className={`btn-ghost relative ${savedBusinesses.length > 0 ? 'text-amber-500' : ''}`}
          title="Negocios guardados"
        >
          <Bookmark className={`w-4.5 h-4.5 ${savedBusinesses.length > 0 ? 'fill-amber-500' : ''}`} />
          {savedBusinesses.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {savedBusinesses.length}
            </span>
          )}
        </button>
        <button onClick={() => setShowSettings(true)} className="btn-ghost" title="Configuracion">
          <Settings className="w-4 h-4" />
        </button>
        <button onClick={toggleTheme} className="btn-ghost" title={isDark ? 'Modo claro' : 'Modo oscuro'}>
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </nav>
  )
}