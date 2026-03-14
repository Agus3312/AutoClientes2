import { X, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import ScoreGauge from './ScoreGauge'

const COLORS = ['#1e40af', '#ea580c', '#16a34a']
const METRICS = [
  { key: 'performance', label: 'Performance' },
  { key: 'accessibility', label: 'Accesibilidad' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'seo', label: 'SEO' },
]

export default function ComparePanel() {
  const { compareList, clearCompare, setShowCompare, lighthouseData } = useApp()

  const radarData = METRICS.map(({ key, label }) => {
    const entry = { metric: label }
    compareList.forEach((b, i) => {
      const data = lighthouseData[b.place_id]
      entry[`biz${i}`] = data && !data.error ? data[key] : 0
    })
    return entry
  })

  const getBestIdx = key => {
    const scores = compareList.map((b, i) => ({
      score: lighthouseData[b.place_id]?.[key] || 0,
      idx: i,
    }))
    const max = Math.max(...scores.map(s => s.score))
    if (max === 0) return null
    return scores.find(s => s.score === max)?.idx ?? null
  }

  const hasLighthouse = compareList.some(
    b => lighthouseData[b.place_id] && !lighthouseData[b.place_id].error
  )

  const cols = compareList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowCompare(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-xl">
              Comparación de Negocios
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {compareList.length} negocios seleccionados
            </p>
          </div>
          <button
            onClick={() => setShowCompare(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Business headers */}
          <div className={`grid gap-4 mb-6 ${cols}`}>
            {compareList.map((b, i) => (
              <div key={b.place_id} className="card p-4 text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                  style={{ backgroundColor: COLORS[i] }}
                >
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {b.name}
                </h3>
                {b.rating && (
                  <p className="text-xs text-gray-500 mt-1">⭐ {b.rating}</p>
                )}
                {b.website && (
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 block truncate"
                    onClick={e => e.stopPropagation()}
                  >
                    {b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          {hasLighthouse && (
            <div className="card p-4 mb-6">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-4">
                Comparación Visual
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  {compareList.map((b, i) => (
                    <Radar
                      key={b.place_id}
                      name={b.name}
                      dataKey={`biz${i}`}
                      stroke={COLORS[i]}
                      fill={COLORS[i]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Score Table */}
          <div className="card overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wide">
                    Métrica
                  </th>
                  {compareList.map((b, i) => (
                    <th
                      key={b.place_id}
                      className="text-center px-4 py-3 text-xs font-semibold"
                      style={{ color: COLORS[i] }}
                    >
                      {b.name.length > 22 ? b.name.slice(0, 22) + '…' : b.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(({ key, label }) => {
                  const bestIdx = getBestIdx(key)
                  return (
                    <tr
                      key={key}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                        {label}
                      </td>
                      {compareList.map((b, i) => {
                        const data = lighthouseData[b.place_id]
                        const score = data && !data.error ? data[key] : null
                        return (
                          <td key={b.place_id} className="px-4 py-3 text-center">
                            {score !== null ? (
                              <div className="flex items-center justify-center gap-2">
                                <ScoreGauge score={score} size="sm" />
                                {i === bestIdx && (
                                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600 text-xs">
                                Sin datos
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}

                <tr className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                    Calificación
                  </td>
                  {compareList.map(b => (
                    <td key={b.place_id} className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ⭐ {b.rating || 'N/A'}
                      </span>
                      <span className="block text-xs text-gray-400">
                        ({b.user_ratings_total?.toLocaleString() || 0} reseñas)
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button onClick={clearCompare} className="btn-secondary text-sm">
              <X className="w-4 h-4" />
              Limpiar comparación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
