/**
 * Micro-chart: 7-day trend sparkline for dashboard summary cards
 * @param {number[]} data - 7 values representing daily counts (e.g. [5,8,6,10,12,9,14])
 */
export default function Sparkline({ data = [5, 8, 6, 10, 12, 9, 14], className = '' }) {
  const width = 48
  const height = 20
  const padding = 2
  const raw = Array.isArray(data) && data.length > 0 ? data : [5, 8, 6, 10, 12, 9, 14]
  const values = raw.length >= 7 ? raw.slice(-7) : [...Array(7 - raw.length).fill(Math.min(...raw, 0)), ...raw]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (values.length - 1)

  const points = values
    .map((v, i) => {
      const x = padding + i * stepX
      const y = height - padding - ((v - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-300"
      />
    </svg>
  )
}
