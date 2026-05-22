import { useState } from 'react'
import { Globe, Loader2, AlertCircle, Zap, Eye, Shield, Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import ScoreGauge from './ScoreGauge'
import { getLighthouseData, detectSaasTools } from '../utils/lighthouseApi'
import { useApp } from '../context/AppContext'

const METRICS = [
  { key: 'performance', label: 'Performance', icon: Zap },
  { key: 'accessibility', label: 'Accesibilidad', icon: Eye },
  { key: 'bestPractices', label: 'Best Practices', icon: Shield },
  { key: 'seo', label: 'SEO', icon: Search },
]

export default function LighthousePanel({ business }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const { lighthouseData, setLighthouseData, loadingLighthouse, setLoadingLighthouse } = useApp()

  const data = lighthouseData[business.place_id]
  const isLoading = loadingLighthouse[business.place_id]

  const runAnalysis = async (e) => {
    e.stopPropagation()
    const website = business.website
    if (!website) return

    // Prevent duplicate if already running from autoAnalyze
    if (isLoading || isReanalyzing) return

    setIsReanalyzing(true)
    setLoadingLighthouse(prev => ({ ...prev, [business.place_id]: true }))
    setIsOpen(true)

    const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    try {
      // Run Lighthouse + SaaS detection in parallel (same as autoAnalyze)
      const [lhResult, webData] = await Promise.all([
        getLighthouseData(website, apiKey),
        detectSaasTools(website),
      ])

      // Merge SaaS tools from both sources
      const allSaas = [...(lhResult.detectedSaas || [])]
      const seen = new Set(allSaas.map(s => s.name))
      for (const s of webData.saas) {
        if (!seen.has(s.name)) { allSaas.push(s); seen.add(s.name) }
      }

      setLighthouseData(prev => ({
        ...prev,
        [business.place_id]: { ...lhResult, detectedSaas: allSaas },
      }))

      // Update business with contact info if found
      const ci = webData.contactInfo
      if (ci.email || ci.socials.length > 0) {
        // We can't import setBusinesses here easily,
        // but contact info from SaaS scan supplements the business
        // This is handled by autoAnalyze for the main flow.
        // For manual re-analysis, we still get scores + SaaS which is the main value.
      }
    } catch (err) {
      setLighthouseData(prev => ({ ...prev, [business.place_id]: { error: err.message } }))
    } finally {
      setLoadingLighthouse(prev => ({ ...prev, [business.place_id]: false }))
      setIsReanalyzing(false)
    }
  }

  if (!business.website) {
    return (
      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5 italic">
        <Globe className="w-3.5 h-3.5" />
        <span>Sin sitio web registrado</span>
      </div>
    )
  }

  return (
    <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-primary-700 dark:text-primary-400">
          <Globe className="w-3.5 h-3.5" />
          <span className="truncate max-w-32">{business.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Re-analyze button — show if data exists (allow refresh) */}
          {data && !data.error && !isLoading && (
            <button
              onClick={runAnalysis}
              disabled={isReanalyzing}
              title="Re-analizar"
              className="text-xs text-slate-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 flex items-center gap-0.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {/* First-time analyze button */}
          {!data && !isLoading && (
            <button
              onClick={runAnalysis}
              className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              Analizar
            </button>
          )}
          {(data || isLoading) && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(o => !o) }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            >
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-2 animate-fade-in">
          {(isLoading || isReanalyzing) && (
            <div className="flex items-center gap-2 py-3 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span className="text-xs text-gray-500">Ejecutando análisis Lighthouse...</span>
            </div>
          )}

          {data?.error && (
            <div className="flex items-start gap-2 py-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error al analizar</p>
                <p className="text-gray-500 dark:text-gray-400">{data.error}</p>
              </div>
            </div>
          )}

          {data && !data.error && !isLoading && !isReanalyzing && (
            <div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {METRICS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col items-center">
                    <ScoreGauge score={data[key]} size="sm" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 text-center">{label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 mt-1">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Core Web Vitals</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'LCP', value: data.lcp },
                    { label: 'TBT', value: data.fid },
                    { label: 'CLS', value: data.cls },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] text-gray-400">{label}</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}