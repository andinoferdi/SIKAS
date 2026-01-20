export default function AddTransactionLoading() {
  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-7 bg-muted rounded-lg w-48 animate-pulse" />
        <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-20 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
