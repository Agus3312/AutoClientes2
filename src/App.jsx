import { useJsApiLoader } from '@react-google-maps/api'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import MapView from './components/MapView'
import BusinessList from './components/BusinessList'
import PromptPanel from './components/PromptPanel'
import ComparePanel from './components/ComparePanel'
import SavedPanel from './components/SavedPanel'
import InteresadosPanel from './components/InteresadosPanel'
import { AlertCircle, Loader2 } from 'lucide-react'

const GOOGLE_MAPS_LIBRARIES = ['places']

function AppContent() {
  const { showCompare } = useApp()

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 max-w-md text-center shadow-lg">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">Error al cargar Google Maps</h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Verifica que la clave API esté en el <code className="bg-slate-100 dark:bg-gray-800 px-1 rounded text-xs">.env</code> y que las APIs <strong>Maps JavaScript</strong> y <strong>Places</strong> estén habilitadas en Google Cloud Console.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" style={{borderWidth:'3px'}} />
            <p className="text-slate-500 dark:text-gray-400 text-sm">Cargando Google Maps…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-gray-950 flex flex-col overflow-hidden transition-colors duration-200">
      <Navbar />
      <SearchBar />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Map + List */}
        <div className="flex flex-col lg:w-[58%] h-full overflow-hidden border-r border-slate-100 dark:border-gray-800">
          <MapView />
          <BusinessList />
        </div>

        {/* Right: Prompts */}
        <div className="lg:w-[42%] h-52 lg:h-full overflow-hidden flex-shrink-0">
          <PromptPanel />
        </div>
      </main>

      {showCompare && <ComparePanel />}
      <SavedPanel />
      <InteresadosPanel />
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
