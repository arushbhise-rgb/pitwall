export function SkeletonRow({ count = 5 }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

export function SkeletonCard({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`, gap: '12px', padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div style={{ padding: '16px' }}>
      <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '16px' }} />
      <div className="skeleton skeleton-chart" />
    </div>
  )
}
