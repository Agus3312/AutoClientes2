export default function ScoreGauge({ score, size = 'md', showLabel = true }) {
  const getColor = (s) => {
    if (s >= 90) return { stroke: '#16a34a', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' }
    if (s >= 50) return { stroke: '#d97706', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' }
    return { stroke: '#dc2626', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' }
  }

  const colors = getColor(score)
  const radius = size === 'lg' ? 30 : size === 'sm' ? 18 : 24
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const svgSize = radius * 2 + 10
  const cx = svgSize / 2
  const cy = svgSize / 2

  return (
    <div className={`flex flex-col items-center ${colors.bg} rounded-lg p-2`}>
      <svg width={svgSize} height={svgSize} className="rotate-[-90deg]">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={size === 'lg' ? 5 : 4} />
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={size === 'lg' ? 5 : 4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`font-bold mt-1 ${colors.text} ${size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {score}
      </span>
    </div>
  )
}
