import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const STYLES = {
  success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25',
  error: 'bg-red-600 text-white shadow-lg shadow-red-600/25',
  info: 'bg-brand-600 text-white shadow-lg shadow-brand-600/25',
}

export default function Toast() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium animate-slide-up ${STYLES[toast.type] || STYLES.info}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}