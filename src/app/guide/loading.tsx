export default function GuideLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}
