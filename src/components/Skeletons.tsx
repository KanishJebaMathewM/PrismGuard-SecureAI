export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton mt-4 h-4 w-32 rounded" />
      <div className="skeleton mt-2 h-8 w-24 rounded" />
      <div className="skeleton mt-3 h-3 w-40 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="skeleton h-4 flex-1 rounded" />
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  );
}

export function SkeletonPipeline() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton h-24 w-36 rounded-xl" />
          {i < 5 && <div className="skeleton h-1 w-8 rounded" />}
        </div>
      ))}
    </div>
  );
}
