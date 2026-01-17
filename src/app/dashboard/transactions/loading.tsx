export default function TransactionsLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <div className="h-7 bg-muted rounded-lg w-40 animate-pulse" />
        <div className="h-9 bg-muted rounded-xl w-24 animate-pulse" />
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
