import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import BusinessList from './components/BusinessList'
import DetailPanel from './components/DetailPanel'
import ComparePanel from './components/ComparePanel'
import WelcomeScreen from './components/WelcomeScreen'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function AppContent() {
  const { showCompare, selectedBusiness } = useApp()

  return (
    <div className="h-screen bg-surface-50 dark:bg-surface-950 flex flex-col overflow-hidden transition-colors duration-200">
      <Navbar />
      <SearchBar />

      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Business list — full width on mobile, 55% on desktop */}
        <div className="w-full lg:w-[55%] flex flex-col overflow-hidden border-r border-slate-200/60 dark:border-slate-800/60">
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
            <DetailPanel />
          </ErrorBoundary>
        </div>
      </main>

      {showCompare && <ComparePanel />}
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