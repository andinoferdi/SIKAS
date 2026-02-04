export default function DashboardLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
      <div className="space-y-2">
        <div className="h-7 bg-muted rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-muted rounded w-64 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-48 bg-muted rounded-2xl animate-pulse" />
    </div>
  )
}
