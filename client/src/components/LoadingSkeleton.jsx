export function PostCardSkeleton() {
  return (
    <div className="border border-wire rounded-xl overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-surface" />
      <div className="p-5">
        <div className="h-4 bg-surface rounded w-16 mb-3" />
        <div className="h-5 bg-surface rounded w-3/4 mb-2" />
        <div className="h-4 bg-surface rounded w-full mb-1" />
        <div className="h-4 bg-surface rounded w-2/3 mb-4" />
        <div className="flex items-center gap-2 pt-3 border-t border-wire">
          <div className="w-5 h-5 rounded-full bg-surface" />
          <div className="h-3 bg-surface rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function PostPageSkeleton() {
  return (
    <div className="max-w-feed mx-auto px-6 py-12 animate-pulse">
      <div className="h-10 bg-surface rounded w-3/4 mb-4" />
      <div className="h-4 bg-surface rounded w-1/3 mb-10" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 bg-surface rounded w-full mb-3" />
      ))}
    </div>
  )
}
