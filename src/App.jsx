import { useJsApiLoader } from '@react-google-maps/api'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import BusinessList from './components/BusinessList'
import PromptPanel from './components/PromptPanel'
import ComparePanel from './components/ComparePanel'
import SavedPanel from './components/SavedPanel'
import PipelineView from './components/PipelineView'
import DashboardPanel from './components/DashboardPanel'
import SettingsPanel from './components/SettingsPanel'
import WelcomeScreen from './components/WelcomeScreen'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { AlertCircle } from 'lucide-react'

const GOOGLE_MAPS_LIBRARIES = ['places']

function AppContent() {
  const { showCompare, selectedBusiness } = useApp()

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const showMapWarning = !!loadError

  if (!isLoaded && !loadError) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-[3px] border-brand-200 dark:border-brand-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 dark:text-gray-400 text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-surface-50 dark:bg-surface-950 flex flex-col overflow-hidden transition-colors duration-200">
      <Navbar />
      <SearchBar />

      {/* Google Maps warning banner — app still works via Places API */}
      {showMapWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-amber-800 dark:text-amber-200 text-xs">
            Google Maps no se cargó. La búsqueda de lugares aún funciona, pero no se mostrará el mapa.
          </span>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Business list — full width on mobile, 55% on desktop */}
        <div className="w-full lg:w-[55%] overflow-hidden border-r border-slate-200/60 dark:border-slate-800/60">
          <ErrorBoundary>
            <BusinessList />
          </ErrorBoundary>
        </div>

        {/* Right: Detail panel — hidden on mobile unless business selected */}
        <div className={`lg:w-[45%] lg:h-full overflow-hidden flex-shrink-0 ${
          selectedBusiness
            ? 'fixed inset-0 z-40 bg-white dark:bg-surface-950 lg:relative lg:inset-auto lg:bg-transparent'
            : 'hidden lg:block'
        }`}>
          <ErrorBoundary>
            <PromptPanel />
          </ErrorBoundary>
        </div>
      </main>

      {showCompare && <ComparePanel />}
      <PipelineView />
      <DashboardPanel />
      <SettingsPanel />
      <SavedPanel />
      <Toast />
      <WelcomeScreen />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  )
}