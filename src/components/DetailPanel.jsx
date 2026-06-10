import { MessageSquare, LayoutGrid, BarChart3, Bookmark, Settings } from 'lucide-react'
import PromptPanel from './PromptPanel'
import PipelineView from './PipelineView'
import DashboardPanel from './DashboardPanel'
import SavedPanel from './SavedPanel'
import SettingsPanel from './SettingsPanel'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'message', icon: MessageSquare, label: 'Mensaje' },
  { id: 'pipeline', icon: LayoutGrid, label: 'Pipeline' },
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'saved', icon: Bookmark, label: 'Guardados' },
  { id: 'settings', icon: Settings, label: 'Config' },
]

export default function DetailPanel() {
  const { detailTab, setDetailTab } = useApp()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-950">
      {/* Tab bar */}
      <div className="flex items-center border-b border-slate-200/60 dark:border-slate-800/60 px-1 flex-shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = detailTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {detailTab === 'message' && <PromptPanel />}
        {detailTab === 'pipeline' && <PipelineView inline />}
        {detailTab === 'dashboard' && <DashboardPanel inline />}
        {detailTab === 'saved' && <SavedPanel inline />}
        {detailTab === 'settings' && <SettingsPanel inline />}
      </div>
    </div>
  )
}
