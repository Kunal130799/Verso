import { useMemo, useState } from 'react'

const WIDTH = 700
const HEIGHT = 200
const PAD = { top: 16, right: 12, bottom: 28, left: 12 }

function niceMax(value) {
  if (value <= 0) return 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const steps = [1, 2, 2.5, 5, 10]
  for (const s of steps) {
    if (value <= s * magnitude) return s * magnitude
  }
  return 10 * magnitude
}

function formatShortDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ViewsChart({ series }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const [showTable, setShowTable] = useState(false)

  const max = useMemo(() => niceMax(Math.max(...series.map(s => s.views), 0)), [series])

  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const n = series.length

  const points = series.map((d, i) => ({
    ...d,
    x: PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: PAD.top + innerH - (d.views / max) * innerH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[n - 1].x},${PAD.top + innerH} L${points[0].x},${PAD.top + innerH} Z`

  const last = points[n - 1]
  const totalViews = series.reduce((sum, d) => sum + d.views, 0)

  const handleMove = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - px)
      if (dist < best) { best = dist; nearest = i }
    })
    setHoverIndex(nearest)
  }

  if (totalViews === 0) {
    return (
      <p className="text-sm font-sans text-faint py-6">
        No views yet in the last 30 days. Once a public post gets read, its traffic shows up here.
      </p>
    )
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* gridlines */}
          {[0, 0.5, 1].map(f => {
            const y = PAD.top + innerH * (1 - f)
            return (
              <line key={f} x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
            )
          })}

          <path d={areaPath} fill="var(--accent)" fillOpacity="0.1" stroke="none" />
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* crosshair */}
          {hovered && (
            <line x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 3" />
          )}

          {/* endpoint marker + value label */}
          <circle cx={last.x} cy={last.y} r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          <text x={last.x} y={last.y - 10} textAnchor="end" fontSize="11" fontFamily="Inter, sans-serif" fill="var(--text)" fontWeight="600">
            {last.views}
          </text>

          {/* hover marker */}
          {hovered && (
            <circle cx={hovered.x} cy={hovered.y} r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          )}

          {/* focusable hit targets — keyboard parity with hover */}
          {points.map((p, i) => (
            <circle
              key={p.date}
              cx={p.x}
              cy={p.y}
              r="12"
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${formatShortDate(p.date)}: ${p.views} ${p.views === 1 ? 'view' : 'views'}`}
              onFocus={() => setHoverIndex(i)}
              onBlur={() => setHoverIndex(null)}
              onMouseEnter={() => setHoverIndex(i)}
              className="focus:outline-none"
            />
          ))}

          {/* x-axis: first / mid / last date */}
          {[0, Math.floor((n - 1) / 2), n - 1].map(i => (
            <text key={i} x={points[i].x} y={HEIGHT - 8} textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif" fill="var(--text-muted)">
              {formatShortDate(points[i].date)}
            </text>
          ))}
        </svg>

        {hovered && (
          <div
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg text-xs font-sans"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              left: `${(hovered.x / WIDTH) * 100}%`,
              top: 0,
              transform: `translate(${hovered.x > WIDTH * 0.8 ? '-105%' : '10px'}, 0)`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div className="text-ink font-semibold">{hovered.views} {hovered.views === 1 ? 'view' : 'views'}</div>
            <div className="text-faint">{formatShortDate(hovered.date)}</div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowTable(s => !s)}
        className="text-xs font-sans text-faint hover:text-ink transition-colors mt-2"
      >
        {showTable ? 'Hide' : 'Show'} as table
      </button>

      {showTable && (
        <div className="mt-3 max-h-48 overflow-y-auto border border-wire rounded-lg">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-wire text-faint text-left">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {series.map(d => (
                <tr key={d.date} className="border-b border-wire last:border-0">
                  <td className="px-3 py-1.5 text-ink">{formatShortDate(d.date)}</td>
                  <td className="px-3 py-1.5 text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
