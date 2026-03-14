import { useState } from 'react'
import { X, Settings, MessageSquare, User, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PLACEHOLDERS_HELP = [
  { tag: '{nombre}', desc: 'Nombre del negocio' },
  { tag: '{rubro}', desc: 'Tipo de negocio detectado' },
  { tag: '{ubicacion}', desc: 'Direccion del negocio' },
  { tag: '{rating}', desc: 'Calificacion en Google' },
  { tag: '{resenas}', desc: 'Cantidad de resenas' },
]

export default function SettingsPanel() {
  const { showSettings, setShowSettings, userSettings, setUserSettings, addToast } = useApp()
  const [tab, setTab] = useState('message')

  if (!showSettings) return null

  const customTemplate = userSettings.customTemplate || ''
  const sellerName = userSettings.sellerName || ''
  const sellerCompany = userSettings.sellerCompany || ''
  const sellerPhone = userSettings.sellerPhone || ''

  const updateSetting = (key, value) => {
    setUserSettings(prev => ({ ...prev, [key]: value }))
  }

  const clearTemplate = () => {
    updateSetting('customTemplate', '')
    addToast('Template reseteado al default', 'info')
  }

  const clearLighthouseCache = () => {
    localStorage.removeItem('ac_lighthouse')
    addToast('Cache de Lighthouse borrado', 'success')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Configuracion</h2>
          </div>
          <button onClick={() => setShowSettings(false)} className="btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-gray-800 px-4">
          {[
            { id: 'message', label: 'Mensaje', icon: MessageSquare },
            { id: 'profile', label: 'Perfil', icon: User },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-4">
          {tab === 'message' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-gray-300 mb-1.5 block">
                  Template de mensaje personalizado
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Deja vacio para usar el mensaje automatico segun tipo de negocio
                </p>
                <textarea
                  value={customTemplate}
                  onChange={e => updateSetting('customTemplate', e.target.value)}
                  placeholder="Ej: Hola! Vi {nombre} en Google Maps y me gustaria ofrecerles..."
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm text-slate-700 dark:text-gray-300 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  rows={5}
                />
                {customTemplate && (
                  <button onClick={clearTemplate} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 mt-1.5">
                    <Trash2 className="w-3 h-3" /> Resetear al default
                  </button>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Placeholders disponibles</p>
                <div className="space-y-1">
                  {PLACEHOLDERS_HELP.map(p => (
                    <div key={p.tag} className="flex items-center justify-between text-xs">
                      <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded font-mono text-[11px]">{p.tag}</code>
                      <span className="text-slate-500">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                <button onClick={clearLighthouseCache} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" /> Borrar cache de Lighthouse
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Fuerza re-analizar todos los sitios web</p>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-gray-300 mb-1 block">Tu nombre</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={e => updateSetting('sellerName', e.target.value)}
                  placeholder="Juan Perez"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-gray-300 mb-1 block">Empresa</label>
                <input
                  type="text"
                  value={sellerCompany}
                  onChange={e => updateSetting('sellerCompany', e.target.value)}
                  placeholder="Mi Agencia Digital"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-gray-300 mb-1 block">Tu telefono</label>
                <input
                  type="text"
                  value={sellerPhone}
                  onChange={e => updateSetting('sellerPhone', e.target.value)}
                  placeholder="+54 11 1234-5678"
                  className="input-field text-sm"
                />
              </div>
              <p className="text-[11px] text-slate-400">Estos datos se usan en los PDF exportados y pueden incluirse en mensajes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
