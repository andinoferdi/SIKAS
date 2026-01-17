export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 bg-muted rounded-lg w-32 mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
