import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import ViewsChart from './ViewsChart'

function StatTile({ label, value }) {
  return (
    <div className="border border-wire rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--surface)' }}>
      <p className="text-xs font-sans text-faint mb-1">{label}</p>
      <p className="text-2xl font-sans font-semibold text-ink">{value.toLocaleString()}</p>
    </div>
  )
}

export default function AnalyticsPanel({ posts }) {
  const { getToken } = useAuth()
  const [series, setSeries] = useState(null)

  useEffect(() => {
    getToken()
      .then(token => api.get('/api/my-posts/analytics', token))
      .then(data => setSeries(data.series))
      .catch(() => setSeries([]))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0)
  const views30d = series ? series.reduce((sum, d) => sum + d.views, 0) : 0

  return (
    <div className="mb-10 pb-10 border-b border-wire">
      <h2 className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Analytics</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Posts" value={posts.length} />
        <StatTile label="Total views" value={totalViews} />
        <StatTile label="Views, last 30 days" value={views30d} />
      </div>

      {series === null ? (
        <p className="text-sm font-sans text-faint">Loading…</p>
      ) : (
        <ViewsChart series={series} />
      )}
    </div>
  )
}
