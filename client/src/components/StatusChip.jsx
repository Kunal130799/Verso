const styles = {
  draft:   { bg: 'var(--surface)', color: 'var(--text-muted)', border: 'var(--border)' },
  private: { bg: 'var(--surface)', color: 'var(--text-muted)', border: 'var(--border)' },
  public:  { bg: 'var(--accent)',  color: '#ffffff',            border: 'var(--accent)'  },
}

const icons = {
  private: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
}

export default function StatusChip({ status }) {
  const s = styles[status] || styles.draft
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft'

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans font-medium border"
      style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
    >
      {icons[status]}
      {label}
    </span>
  )
}
